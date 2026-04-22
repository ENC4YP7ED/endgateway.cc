package proxy

import (
	"fmt"
	"io"
	"net"

	"github.com/hashicorp/yamux"
)

type Service struct {
	TCPPort int
	UDPPort int

	tcp net.Listener
	udp net.PacketConn
}

func Start(tcpPort, udpPort int, sess *yamux.Session, id string) (*Service, error) {
	tcpListener, err := net.Listen("tcp", fmt.Sprintf(":%d", tcpPort))
	if err != nil {
		return nil, err
	}

	udpConn, err := net.ListenPacket("udp", fmt.Sprintf(":%d", udpPort))
	if err != nil {
		tcpListener.Close()
		return nil, err
	}

	svc := &Service{
		TCPPort: tcpPort,
		UDPPort: udpPort,
		tcp:     tcpListener,
		udp:     udpConn,
	}

	go svc.serveTCP(sess, id)
	go svc.serveUDP(sess, id)

	return svc, nil
}

func (s *Service) Close() error {
	var firstErr error

	if s.tcp != nil {
		if err := s.tcp.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}

	if s.udp != nil {
		if err := s.udp.Close(); err != nil && firstErr == nil {
			firstErr = err
		}
	}

	return firstErr
}

func (s *Service) serveTCP(sess *yamux.Session, id string) {
	for {
		client, err := s.tcp.Accept()
		if err != nil {
			return
		}

		go func(client net.Conn) {
			defer client.Close()

			stream, err := sess.Open()
			if err != nil {
				return
			}
			defer stream.Close()

			ip, srcPort, err := net.SplitHostPort(client.RemoteAddr().String())
			if err != nil {
				return
			}

			header := fmt.Sprintf("TCP %s %s\n", id, client.RemoteAddr().String())
			if _, err := stream.Write([]byte(header)); err != nil {
				return
			}

			proxyHeader := fmt.Sprintf("PROXY TCP4 %s 127.0.0.1 %s %d\r\n", ip, srcPort, s.TCPPort)
			if _, err := stream.Write([]byte(proxyHeader)); err != nil {
				return
			}

			go io.Copy(stream, client)
			io.Copy(client, stream)
		}(client)
	}
}
