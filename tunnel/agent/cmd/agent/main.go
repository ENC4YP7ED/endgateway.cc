package main

import (
	"bufio"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"strings"

	"github.com/ENC4YP7ED/endgateway.cc/tunnel/agent/internal/config"
	"github.com/hashicorp/yamux"
)

func main() {
	vps := flag.String("vps", "localhost:8443", "vps address")
	id := flag.String("id", "srv1", "server id")
	serverName := flag.String("server-name", "vps", "TLS server name")
	certFile := flag.String("cert", "/certs/agent.crt", "agent certificate")
	keyFile := flag.String("key", "/certs/agent.key", "agent private key")
	caFile := flag.String("ca", "/certs/ca.crt", "CA certificate")
	flag.Parse()

	ca, err := os.ReadFile(*caFile)
	if err != nil {
		log.Fatalf("read CA cert: %v", err)
	}

	pool := x509.NewCertPool()
	if ok := pool.AppendCertsFromPEM(ca); !ok {
		log.Fatal("append CA cert failed")
	}

	cert, err := tls.LoadX509KeyPair(*certFile, *keyFile)
	if err != nil {
		log.Fatalf("load agent cert: %v", err)
	}

	tlsCfg := &tls.Config{
		RootCAs:      pool,
		Certificates: []tls.Certificate{cert},
		ServerName:   *serverName,
		MinVersion:   tls.VersionTLS13,
	}

	conn, err := tls.Dial("tcp", *vps, tlsCfg)
	if err != nil {
		log.Fatal(err)
	}

	req, err := http.NewRequest(http.MethodGet, "https://"+*vps+"/tunnel", nil)
	if err != nil {
		log.Fatal(err)
	}

	if err := req.Write(conn); err != nil {
		log.Fatal(err)
	}

	sess, err := yamux.Client(conn, nil)
	if err != nil {
		log.Fatal(err)
	}

	if err := notifyStart(*vps, *id, tlsCfg); err != nil {
		log.Fatalf("start tunnel: %v", err)
	}

	log.Println("agent connected, waiting streams")
	for {
		stream, err := sess.Accept()
		if err != nil {
			return
		}

		go handle(stream)
	}
}

func handle(s net.Conn) {
	defer s.Close()

	reader := bufio.NewReader(s)
	line, err := reader.ReadString('\n')
	if err != nil {
		return
	}

	fields := strings.Fields(strings.TrimSpace(line))
	if len(fields) == 0 {
		return
	}

	switch fields[0] {
	case "TCP":
		handleTCP(s, reader)
	case "UDP":
		handleUDP(s, reader)
	default:
		return
	}
}

func handleTCP(stream net.Conn, reader *bufio.Reader) {
	mc, err := net.Dial("tcp", "127.0.0.1:25565")
	if err != nil {
		return
	}
	defer mc.Close()

	go io.Copy(mc, reader)
	io.Copy(stream, mc)
}

func handleUDP(stream net.Conn, reader *bufio.Reader) {
	voice, err := net.Dial("udp", "127.0.0.1:24454")
	if err != nil {
		return
	}
	defer voice.Close()

	go func() {
		buf := make([]byte, 2048)
		for {
			n, err := reader.Read(buf)
			if err != nil {
				return
			}
			if _, err := voice.Write(buf[:n]); err != nil {
				return
			}
		}
	}()

	buf := make([]byte, 2048)
	for {
		n, err := voice.Read(buf)
		if err != nil {
			return
		}
		if _, err := stream.Write(buf[:n]); err != nil {
			return
		}
	}
}

func notifyStart(vps, id string, tlsCfg *tls.Config) error {
	client := &http.Client{
		Transport: &http.Transport{TLSClientConfig: tlsCfg},
	}

	resp, err := client.Post("https://"+vps+"/v1/servers/"+id+"/start", "application/json", nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("start endpoint returned %s: %s", resp.Status, strings.TrimSpace(string(body)))
	}

	var payload struct {
		VoiceHost string `json:"voice_host"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return err
	}

	if payload.VoiceHost != "" {
		config.UpdateVoiceHost(payload.VoiceHost)
	}

	return nil
}
