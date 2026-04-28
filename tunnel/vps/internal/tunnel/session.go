package tunnel

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/hashicorp/yamux"
)

type Registry struct {
	mu       sync.RWMutex
	sessions map[string]*yamux.Session
}

func NewRegistry() *Registry {
	return &Registry{sessions: make(map[string]*yamux.Session)}
}

func (r *Registry) Handle(w http.ResponseWriter, req *http.Request) {
	if req.TLS == nil || len(req.TLS.PeerCertificates) == 0 {
		http.Error(w, "client certificate required", http.StatusUnauthorized)
		return
	}

	cn := req.TLS.PeerCertificates[0].Subject.CommonName
	if cn == "" {
		http.Error(w, "client certificate CN required", http.StatusBadRequest)
		return
	}

	id := req.URL.Query().Get("id")
	if id == "" {
		id = cn
	}

	hijacker, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "hijacking not supported", http.StatusInternalServerError)
		return
	}

	conn, rw, err := hijacker.Hijack()
	if err != nil {
		http.Error(w, fmt.Sprintf("hijack failed: %v", err), http.StatusInternalServerError)
		return
	}

	if err := rw.Flush(); err != nil {
		conn.Close()
		return
	}

	sess, err := yamux.Server(conn, nil)
	if err != nil {
		conn.Close()
		return
	}

	r.mu.Lock()
	if old := r.sessions[id]; old != nil {
		old.Close()
	}
	r.sessions[id] = sess
	r.mu.Unlock()

	go func() {
		<-sess.CloseChan()
		r.mu.Lock()
		if r.sessions[id] == sess {
			delete(r.sessions, id)
		}
		r.mu.Unlock()
	}()
}

func (r *Registry) Get(id string) *yamux.Session {
	r.mu.RLock()
	defer r.mu.RUnlock()

	return r.sessions[id]
}
