package alloc

import "testing"

func TestAllocateSticky(t *testing.T) {
	a := New("")

	tcp1, udp1, err := a.Allocate("srv1")
	if err != nil {
		t.Fatalf("first allocate: %v", err)
	}
	if tcp1 != udp1 {
		t.Fatalf("tcp/udp mismatch: %d vs %d", tcp1, udp1)
	}

	a.Release(tcp1, udp1)

	tcp2, udp2, err := a.Allocate("srv1")
	if err != nil {
		t.Fatalf("second allocate: %v", err)
	}
	if tcp2 != tcp1 || udp2 != udp1 {
		t.Fatalf("sticky lost: got %d/%d want %d/%d", tcp2, udp2, tcp1, udp1)
	}
}

func TestAllocateDistinct(t *testing.T) {
	a := New("")

	p1, _, _ := a.Allocate("srv1")
	p2, _, _ := a.Allocate("srv2")

	if p1 == p2 {
		t.Fatalf("ports must differ across ids: %d", p1)
	}
}

func TestAllocateExhaustion(t *testing.T) {
	a := New("")
	a.min = 50000
	a.max = 50001

	if _, _, err := a.Allocate("a"); err != nil {
		t.Fatal(err)
	}
	if _, _, err := a.Allocate("b"); err != nil {
		t.Fatal(err)
	}
	if _, _, err := a.Allocate("c"); err == nil {
		t.Fatal("expected ErrNoPorts")
	}
}
