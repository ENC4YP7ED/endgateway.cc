package alloc

import (
	"errors"
	"sync"
)

var ErrNoPorts = errors.New("no free ports in range")

type Allocator struct {
	mu     sync.Mutex
	tcp    map[int]bool
	udp    map[int]bool
	sticky map[string]int
	min    int
	max    int
}

func New(_ string) *Allocator {
	return &Allocator{
		tcp:    make(map[int]bool),
		udp:    make(map[int]bool),
		sticky: make(map[string]int),
		min:    50000,
		max:    60000,
	}
}

func (a *Allocator) Allocate(id string) (int, int, error) {
	a.mu.Lock()
	defer a.mu.Unlock()

	if p, ok := a.sticky[id]; ok && !a.tcp[p] && !a.udp[p] {
		a.tcp[p], a.udp[p] = true, true
		return p, p, nil
	}

	for port := a.min; port <= a.max; port++ {
		if !a.tcp[port] && !a.udp[port] {
			a.tcp[port], a.udp[port] = true, true
			a.sticky[id] = port
			return port, port, nil
		}
	}

	return 0, 0, ErrNoPorts
}

func (a *Allocator) Release(tcpPort, udpPort int) {
	a.mu.Lock()
	delete(a.tcp, tcpPort)
	delete(a.udp, udpPort)
	a.mu.Unlock()
}
