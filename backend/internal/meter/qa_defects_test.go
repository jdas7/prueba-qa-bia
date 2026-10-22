//go:build qa

// Tests de QA que evidencian defectos abiertos. Fallan hoy y deben pasar
// cuando se corrijan. Se excluyen de `go test ./...` con el tag `qa`:
//
//	go test -tags qa ./internal/meter/ ./internal/httpx/ ./internal/analysis/classify/
package meter

import (
	"slices"
	"testing"

	"energyai/internal/analysis/model"
	"energyai/internal/httpx"
)

// DEF-01: backend/README.md §"Estado de alerta": "Sin anomalía, o FALSE_POSITIVE → NORMAL".
func TestQA_StatusOfFalsePositiveIsNormal(t *testing.T) {
	fp := &model.Anomaly{Anomaly: false, Type: model.TypeFalsePositive, Severity: model.SeverityLow}
	if got := StatusOf(fp); got != StatusNormal {
		t.Errorf("FALSE_POSITIVE: StatusOf = %s, esperaba %s", got, StatusNormal)
	}
}

// DEF-01 con los datos reales: M-106 es el falso positivo del dataset.
func TestQA_M106IsNormalAndCountsMatchReadme(t *testing.T) {
	svc := newTestService(t)
	d, ok := svc.GetByID("M-106")
	if !ok {
		t.Fatal("M-106 debería existir")
	}
	if d.Status != StatusNormal {
		t.Errorf("M-106 (FALSE_POSITIVE) tiene estado %s, esperaba NORMAL", d.Status)
	}

	big := httpx.Pagination{Size: httpx.MaxPageSize}
	want := map[Status][]string{
		StatusNormal:   {"M-101", "M-102", "M-103", "M-105", "M-106", "M-107", "M-108", "M-110", "M-111"},
		StatusAlert:    {"M-104"},
		StatusCritical: {"M-109", "M-112"},
	}
	for status, ids := range want {
		got := getAll(t, svc, PagedRequest{Pagination: big, Filter: Filter{Status: status}})
		if !slices.Equal(got, ids) {
			t.Errorf("estado %s: obtuve %v, esperaba %v", status, got, ids)
		}
	}
}

// DEF-04: dto.go documenta "Coincidencia parcial y sin importar mayúsculas".
func TestQA_SearchIsCaseInsensitive(t *testing.T) {
	svc := newTestService(t)
	big := httpx.Pagination{Size: httpx.MaxPageSize}
	for _, q := range []string{"m-109", "M-109", "m-1", "109"} {
		got := getAll(t, svc, PagedRequest{Pagination: big, Filter: Filter{MeterID: q}})
		if !slices.Contains(got, "M-109") {
			t.Errorf("búsqueda %q: obtuve %v, debería incluir M-109", q, got)
		}
	}
}

// DEF-05: una página negativa debe rechazarse como entrada inválida (400), no llegar a Paginate.
func TestQA_NormalizeRejectsNegativePage(t *testing.T) {
	for _, page := range []int{-1, -100} {
		req := PagedRequest{Pagination: httpx.Pagination{Page: page, Size: 10}}
		if errs := req.Normalize(); len(errs) == 0 {
			t.Errorf("page %d: Normalize no devolvió errores; esperaba un error de validación", page)
		}
	}
}
