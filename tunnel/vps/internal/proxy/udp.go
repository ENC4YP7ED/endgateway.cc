package proxy

import (
	"fmt"
	"net"

	"github.com/hashicorp/yamux"
)

func (s *Service) serveUDP(sess *yamux.Session, id string) {
	buf := make([]byte, 2048)
	streams := make(map[string]net.Conn)

	for {
		n, addr, err := s.udp.ReadFrom(buf)
		if err != nil {
			return
		}

		key := addr.String()
		stream, ok := streams[key]
		if !ok {
			stream, err = sess.Open()
			if err != nil {
				continue
			}

			header := fmt.Sprintf("UDP %s %s\n", id, key)
			if _, err := stream.Write([]byte(header)); err != nil {
				stream.Close()
				continue
			}

			streams[key] = stream

			go func(addr net.Addr, stream net.Conn) {
				defer stream.Close()

				tmp := make([]byte, 2048)
				for {
					m, err := stream.Read(tmp)
					if err != nil {
						return
					}

					if _, err := s.udp.WriteTo(tmp[:m], addr); err != nil {
						return
					}
				}
			}(addr, stream)
		}

		if _, err := stream.Write(buf[:n]); err != nil {
			stream.Close()
			delete(streams, key)
		}
	}
}
