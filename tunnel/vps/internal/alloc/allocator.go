package alloc

import (
	"sync"
)

type Allocator struct {
	mu     sync.Mutex
	tcp    map[int]bool
	udp    map[int]bool
	sticky map[string]int
}

func New(_ string) *Allocator {
	return &Allocator{
		tcp:    make(map[int]bool),
		udp:    make(map[int]bool),
		sticky: make(map[string]int),
	}
}

func (a *Allocator) Allocate(id string) (int, int) {
	a.mu.Lock()
	defer a.mu.Unlock()
	if p, ok := a.sticky[id]; ok && !a.tcp[p] && !a.udp[p] {
		a.tcp[p], a.udp[p] = true, true
		return p, p
	}
	for port := 50000; port <= 60000; port++ {
		if !a.tcp[port] && !a.udp[port] {
			a.tcp[port], a.udp[port] = true, true
			a.sticky[id] = port
			return port, port
		}
	}
	panic("no ports")
}

func (a *Allocator) Release(tcpPort, udpPort int) {
	a.mu.Lock()
	delete(a.tcp, tcpPort)
	delete(a.udp, udpPort)
	a.mu.Unlock()
}
