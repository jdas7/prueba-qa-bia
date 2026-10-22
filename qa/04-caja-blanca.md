# Parte D · Pruebas de caja blanca

Aquí confirmo las causas raíz, reviso los tests existentes y agrego los que faltan.

## 1. Módulos elegidos y por qué

| Módulo | Riesgo |
|---|---|
| `backend/internal/meter/` (estado, filtro, orden, paginación) + `backend/internal/httpx/paging.go` | Decide qué ve el operador y en qué orden. Un error aquí esconde un medidor crítico o infla la cola de trabajo. La caja negra encontró 3 fallos en esta zona |
| `backend/internal/analysis/classify/` (tipo, severidad, confianza, eventos) | Es la decisión de negocio central: si clasifica mal, se manda a alguien a revisar el medidor equivocado. Tiene solo 6,9 % de cobertura propia |
| `frontend/src/lib/format.ts` y `frontend/src/features/meters/` (fechas, paginación, filtros) | Es la última capa antes del operador; la caja negra mostró que la UI altera datos correctos de la API |

## 2. Tests nuevos

No modifiqué código de producto. Los tests que evidencian defectos están marcados para no romper las suites existentes: en Go con el build tag `qa`, en Vitest con `it.fails` (equivalente a `test.fail()` de Playwright: pasa mientras el defecto existe y falla cuando se corrige, señal para cambiarlo a `it`).

| Archivo | Test | Evidencia | Hoy |
|---|---|---|---|
| [backend/internal/meter/qa_defects_test.go](../backend/internal/meter/qa_defects_test.go) | `TestQA_StatusOfFalsePositiveIsNormal` | DEF-01 | Falla: `StatusOf = ALERT, esperaba NORMAL` |
| | `TestQA_M106IsNormalAndCountsMatchReadme` | DEF-01 con datos reales | Falla: ALERT = [M-104 M-106] |
| | `TestQA_SearchIsCaseInsensitive` | DEF-04 | Falla: `"m-109"` → [] |
| | `TestQA_NormalizeRejectsNegativePage` | DEF-05 | Falla: sin error de validación |
| [backend/internal/httpx/qa_defects_test.go](../backend/internal/httpx/qa_defects_test.go) | `TestQA_PaginateNegativePageDoesNotPanic` | DEF-05 | Falla: `slice bounds out of range [:-10]` |
| [backend/internal/analysis/classify/qa_gaps_test.go](../backend/internal/analysis/classify/qa_gaps_test.go) | `TestQA_RealSeverityBoundaries` | OBS-01 | Falla en 50 % y 20 % exactos |
| | `TestQA_EventWindowLowerBound` | Hueco de cobertura (−24 h / −25 h) | Pasa |
| | `TestQA_ConfidenceRange` | Hueco de cobertura (0,5 / 0,95 / ×0,9) | Pasa |
| [frontend/src/lib/format.qa.test.ts](../frontend/src/lib/format.qa.test.ts) | 2 × `it.fails` con `TZ=America/Bogota` + 1 control de zona + 1 de `formatPlantDay` | DEF-02 | Expected fail (2) / pasa (2) |
| [frontend/src/features/meters/components/Pagination.qa.test.tsx](../frontend/src/features/meters/components/Pagination.qa.test.tsx) | 1 × `it.fails` (12 de 10) + 3 límites (última página, múltiplo exacto, 0 resultados) | DEF-03 | Expected fail (1) / pasa (3) |

Cómo correrlos:

```bash
# backend: falla hoy a propósito (6 tests de defectos), pasan 2 de huecos de cobertura
docker run --rm -v "${PWD}:/src" -w /src golang:1.26 go test -tags qa -v -run TestQA ./internal/meter/ ./internal/httpx/ ./internal/analysis/classify/

# frontend: verde, con 3 "expected fail"
pnpm test
```
