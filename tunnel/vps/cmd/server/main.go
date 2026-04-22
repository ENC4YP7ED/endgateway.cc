package main

import (
	"crypto/tls"
	"crypto/x509"
	"log"
	"net/http"
	"os"

	"github.com/ENC4YP7ED/endgateway.cc/tunnel/vps/internal/alloc"
	"github.com/ENC4YP7ED/endgateway.cc/tunnel/vps/internal/api"
	"github.com/ENC4YP7ED/endgateway.cc/tunnel/vps/internal/tunnel"
	"github.com/gorilla/mux"
)

func main() {
	certFile := getenv("TLS_CERT", "/etc/tunnel/server.crt")
	keyFile := getenv("TLS_KEY", "/etc/tunnel/server.key")
	caFile := getenv("CA_CERT", "/etc/tunnel/ca.crt")

	caCert, err := os.ReadFile(caFile)
	if err != nil {
		log.Fatalf("read CA cert: %v", err)
	}

	caPool := x509.NewCertPool()
	if ok := caPool.AppendCertsFromPEM(caCert); !ok {
		log.Fatal("append CA cert failed")
	}

	tlsCfg := &tls.Config{
		ClientCAs:  caPool,
		ClientAuth: tls.RequireAndVerifyClientCert,
		MinVersion: tls.VersionTLS13,
	}

	allocator := alloc.New("/data/ports.db")
	sessions := tunnel.NewRegistry()

	r := mux.NewRouter()
	api.Register(r, allocator, sessions)
	r.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	}).Methods(http.MethodGet)

	// Agents connect here and switch the HTTP connection to yamux.
	r.HandleFunc("/tunnel", sessions.Handle).Methods(http.MethodGet)

	srv := &http.Server{
		Addr:      ":8443",
		Handler:   r,
		TLSConfig: tlsCfg,
	}

	log.Println("vps-tunnel listening on :8443")
	log.Fatal(srv.ListenAndServeTLS(certFile, keyFile))
}

func getenv(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}

	return d
}
