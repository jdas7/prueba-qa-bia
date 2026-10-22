//go:build qa

package httpx

import "testing"

// DEF-05: Paginate con una página negativa hace panic (slice con índice negativo)
// y el middleware Recover lo convierte en 500.
func TestQA_PaginateNegativePageDoesNotPanic(t *testing.T) {
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("Paginate con page -1 hizo panic: %v", r)
		}
	}()
	p := Pagination{Page: -1, Size: 10}
	p.Normalize()
	Paginate([]int{1, 2, 3}, p)
}
