//go:build qa

package classify

import (
	"testing"
	"time"

	"energyai/internal/analysis/changes"
	"energyai/internal/analysis/model"
	"energyai/internal/data"
	"energyai/internal/testutil"
)

// Valores límite de la severidad de una anomalía real.
// backend/README.md §8: "HIGH si la variación SUPERA 50% y sigue activa; MEDIUM si SUPERA 20%".
// "Supera" es estrictamente mayor: 50% exacto es MEDIUM y 20% exacto es LOW.
// Hoy realSeverity usa >= (OBS-01 en qa/04-caja-blanca.md).
func TestQA_RealSeverityBoundaries(t *testing.T) {
	tests := []struct {
		pct     float64
		ongoing bool
		want    model.Severity
	}{
		{50.01, true, model.SeverityHigh},
		{50, true, model.SeverityMedium},
		{49.99, true, model.SeverityMedium},
		{110.5, false, model.SeverityMedium}, // ya no está activa
		{20.01, true, model.SeverityMedium},
		{20, true, model.SeverityLow},
		{-79.8, true, model.SeverityHigh}, // las caídas cuentan en valor absoluto
	}
	for _, tt := range tests {
		got := realSeverity(changes.Change{ChangePct: tt.pct, Ongoing: tt.ongoing})
		if got != tt.want {
			t.Errorf("realSeverity(%.2f%%, activa=%v) = %s, esperaba %s", tt.pct, tt.ongoing, got, tt.want)
		}
	}
}

// Límite inferior de la ventana de eventos: −24 h incluido, −25 h fuera.
// El test existente solo cubre el límite superior (+6 h / +7 h).
func TestQA_EventWindowLowerBound(t *testing.T) {
	start := testutil.MustParse(t, "2026-09-12 14:00")
	for _, tt := range []struct {
		offset   time.Duration
		explains bool
	}{
		{-24 * time.Hour, true},
		{-25 * time.Hour, false},
	} {
		events := []data.Event{{Timestamp: start.Add(tt.offset), Type: data.EventOperationalChange}}
		got := explainingEvent(changes.Change{Start: start, Direction: changes.Up}, events) != nil
		if got != tt.explains {
			t.Errorf("evento a %v: explica = %v, esperaba %v", tt.offset, got, tt.explains)
		}
	}
}

// Confianza: piso 0,5, techo 0,95 y el ajuste ×0,9 por evento (README §9).
func TestQA_ConfidenceRange(t *testing.T) {
	none := []model.Check{{Weight: 1, Strength: 0}}
	full := []model.Check{{Weight: 1, Strength: 1}}
	if got := confidence(none, 1); got != 0.5 {
		t.Errorf("sin evidencia: %v, esperaba 0.5", got)
	}
	if got := confidence(full, 1); got != 0.95 {
		t.Errorf("evidencia completa: %v, esperaba 0.95", got)
	}
	if got := confidence(full, eventTrust); got != 0.86 {
		t.Errorf("evidencia completa con evento: %v, esperaba 0.86", got)
	}
}
