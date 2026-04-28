package proxy

import (
	"encoding/binary"
	"fmt"
	"io"
	"net"

	"github.com/hashicorp/yamux"
)

const maxUDPPacket = 65535

func (s *Service) serveUDP(sess *yamux.Session, id string) {
	buf := make([]byte, maxUDPPacket)
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

				lenBuf := make([]byte, 2)
				for {
					if _, err := io.ReadFull(stream, lenBuf); err != nil {
						return
					}

					sz := binary.BigEndian.Uint16(lenBuf)
					if sz == 0 {
						continue
					}

					pkt := make([]byte, sz)
					if _, err := io.ReadFull(stream, pkt); err != nil {
						return
					}

					if _, err := s.udp.WriteTo(pkt, addr); err != nil {
						return
					}
				}
			}(addr, stream)
		}

		if err := writeFramed(stream, buf[:n]); err != nil {
			stream.Close()
			delete(streams, key)
		}
	}
}

func writeFramed(w io.Writer, p []byte) error {
	if len(p) > maxUDPPacket {
		return fmt.Errorf("udp packet too large: %d", len(p))
	}

	hdr := []byte{byte(len(p) >> 8), byte(len(p))}
	if _, err := w.Write(hdr); err != nil {
		return err
	}

	_, err := w.Write(p)
	return err
}
