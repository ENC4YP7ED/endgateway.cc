package api

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"sync"

	"github.com/ENC4YP7ED/endgateway.cc/tunnel/vps/internal/alloc"
	"github.com/ENC4YP7ED/endgateway.cc/tunnel/vps/internal/dns"
	"github.com/ENC4YP7ED/endgateway.cc/tunnel/vps/internal/proxy"
	"github.com/ENC4YP7ED/endgateway.cc/tunnel/vps/internal/tunnel"
	"github.com/gorilla/mux"
)

type Server struct {
	mu       sync.Mutex
	alloc    *alloc.Allocator
	sess     *tunnel.Registry
	cf       *dns.CFClient
	records  map[string]string
	services map[string]*proxy.Service
}

func Register(r *mux.Router, a *alloc.Allocator, s *tunnel.Registry) {
	srv := &Server{
		alloc:    a,
		sess:     s,
		cf:       dns.NewFromEnv(),
		records:  make(map[string]string),
		services: make(map[string]*proxy.Service),
	}

	r.HandleFunc("/v1/servers/{id}/start", srv.start).Methods(http.MethodPost)
	r.HandleFunc("/v1/servers/{id}/stop", srv.stop).Methods(http.MethodPost)
	r.HandleFunc("/v1/servers/{id}/allocation", srv.allocation).Methods(http.MethodGet)
	r.HandleFunc("/v1/heartbeat", srv.heartbeat).Methods(http.MethodPost)
}

func (s *Server) start(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	sess := s.sess.Get(id)
	if sess == nil {
		http.Error(w, "no tunnel", http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	if existing := s.services[id]; existing != nil {
		resp := s.responseFor(id, existing.TCPPort, existing.UDPPort, r)
		s.mu.Unlock()
		writeJSON(w, http.StatusOK, resp)
		return
	}
	s.mu.Unlock()

	tcpPort, udpPort, err := s.alloc.Allocate(id)
	if err != nil {
		http.Error(w, fmt.Sprintf("allocate ports: %v", err), http.StatusServiceUnavailable)
		return
	}

	service, err := proxy.Start(tcpPort, udpPort, sess, id)
	if err != nil {
		s.alloc.Release(tcpPort, udpPort)
		http.Error(w, fmt.Sprintf("start proxy: %v", err), http.StatusInternalServerError)
		return
	}

	recordID := ""
	if s.cf.Token != "" && s.cf.Zone != "" && s.cf.Domain != "" {
		ip := os.Getenv("VPS_PUBLIC_IP")
		if ip == "" {
			http.Error(w, "VPS_PUBLIC_IP is required when Cloudflare DNS is enabled", http.StatusInternalServerError)
			service.Close()
			s.alloc.Release(tcpPort, udpPort)
			return
		}

		recordID, err = s.cf.CreateRecord("mc-"+id, ip)
		if err != nil {
			service.Close()
			s.alloc.Release(tcpPort, udpPort)
			http.Error(w, fmt.Sprintf("create DNS record: %v", err), http.StatusInternalServerError)
			return
		}
	}

	s.mu.Lock()
	s.services[id] = service
	if recordID != "" {
		s.records[id] = recordID
	}
	resp := s.responseFor(id, tcpPort, udpPort, r)
	s.mu.Unlock()

	writeJSON(w, http.StatusOK, resp)
}

func (s *Server) stop(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	s.mu.Lock()
	service := s.services[id]
	delete(s.services, id)
	recordID := s.records[id]
	delete(s.records, id)
	s.mu.Unlock()

	if service == nil {
		http.Error(w, "server not active", http.StatusNotFound)
		return
	}

	if err := service.Close(); err != nil {
		http.Error(w, fmt.Sprintf("close listeners: %v", err), http.StatusInternalServerError)
		return
	}

	s.alloc.Release(service.TCPPort, service.UDPPort)
	s.cf.DeleteRecord(recordID)

	writeJSON(w, http.StatusOK, map[string]any{
		"closed":     true,
		"tcp_public": service.TCPPort,
		"udp_public": service.UDPPort,
	})
}

func (s *Server) heartbeat(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"ttl": 45})
}

func (s *Server) allocation(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	s.mu.Lock()
	service := s.services[id]
	s.mu.Unlock()

	if service == nil {
		http.Error(w, "server not active", http.StatusNotFound)
		return
	}

	writeJSON(w, http.StatusOK, s.responseFor(id, service.TCPPort, service.UDPPort, r))
}

func (s *Server) responseFor(id string, tcpPort, udpPort int, r *http.Request) map[string]any {
	dnsName := ""
	host := hostOnly(r.Host)

	if s.cf.Domain != "" {
		dnsName = fmt.Sprintf("mc-%s.%s", id, s.cf.Domain)
		host = dnsName
	}

	return map[string]any{
		"tcp_public": tcpPort,
		"udp_public": udpPort,
		"voice_host": fmt.Sprintf("%s:%d", host, udpPort),
		"dns_name":   dnsName,
	}
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func hostOnly(hostport string) string {
	host, _, err := net.SplitHostPort(hostport)
	if err == nil {
		return host
	}

	return hostport
}
