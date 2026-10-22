---
name: playwright-bdd
description: >-
  Escribe y extiende la suite e2e de EnergIA en Gherkin (español) con
  playwright-bdd y Playwright. Úsala al agregar escenarios, pasos, Page
  Objects, tags @CN-xx/@DEF-0x/@fail, o al correr y leer qa/evidencias/index.html.
---

# Playwright BDD de EnergIA

La suite vive en `e2e/`. Los casos están en [`qa/03-casos-caja-negra.md`](../../../qa/03-casos-caja-negra.md). No modifiques `frontend/` ni `backend/`: si el producto no cumple la documentación, el escenario lleva `@fail`.

## Al agregar un escenario

1. Escríbelo en `features/api/` o `features/ui/`, con `# language: es` en la primera línea. Texto de negocio (`Dado`/`Cuando`/`Entonces`), cifras en tablas.
2. Reutiliza pasos (`pnpm bdd:steps`). Un paso nuevo va en `steps/api.steps.ts` o `steps/ui.steps.ts`; el locator queda en `pages/`, no en el paso.
3. Tag de caso `@CN-xx` (y `@SM-xx` si es humo). Si evidencia un defecto abierto, `@DEF-0x` y `@fail`.
4. `pnpm bdd:check` (todos los pasos implementados, ninguno skipped) y después `pnpm test`.

## Tags y proyectos

| Tag | Dónde corre |
| --- | --- |
| `@api` / `@ui` | Proyecto `api` o los de UI |
| `@fail` | Fallo esperado (`test.fail()`). Si empieza a pasar, hay que quitar el tag |
| `@utc` | Solo `chromium-utc` (navegador en UTC). El resto de la UI va en `America/Bogota` |
| `@anon` | Solo `chromium-anon`, sin `storageState` y sin depender de `setup` |
| `@mutate` | Solo Chromium. Reservado a Run AI Analysis: el motor no corre dos análisis a la vez |

En un Esquema, `@fail` va en un bloque `Ejemplos` aparte. Las otras filas tienen que pasar.

`@anon` y `@mutate` se filtran con `grep` / `grepInvert` del proyecto. No crees otro `defineBddConfig` si basta con un tag.

## Cómo afirmar

- Oráculo: README, `backend/README.md`, `frontend/PRODUCT.md` y `e2e/data/expected.ts`. Nunca `expected_results.csv`.
- Locators: `getByRole` y `getByLabel`. No uses CSS de estilos, `data-testid` ni `waitForTimeout`.
- La espera es `expect(locator)` o `expect.poll`. El estado vacío del libro se lee con `visibleMeterIds()` (devuelve `[]`), para que un `@fail` falle por la lista y no por un locator que no existe.
- En API, cada `Cuando` que llama al backend pasa por `keep` en `steps/api.steps.ts` (`$testInfo.attach` del JSON recortado: sin historial horario ni JWT completo).
- No afirmes solo que un elemento es visible si el caso habla de una cifra, un estado o un medidor.

## Después de correr

`pnpm test` tiene que terminar con 0 unexpected, 0 skipped y 0 flaky. Los `@fail` salen como `x` y fallan por el defecto. La evidencia queda sola en `qa/evidencias/index.html` (reporte Cucumber: escenarios, capturas de UI y JSON de API). Traces y video van al reporte de Playwright, no a esa carpeta.

`pnpm test:api` y `pnpm test:ui` reescriben `index.html` solo con su parte. La evidencia completa es `pnpm test`.
