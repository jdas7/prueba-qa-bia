# EnergIA · pruebas E2E y de API en Gherkin (Playwright + playwright-bdd + TypeScript)

Los casos de prueba están escritos en Gherkin en español (`features/*.feature`), para que cualquier persona del negocio pueda leerlos. Los pasos se implementan en TypeScript (`steps/`) sobre Playwright, con [playwright-bdd](https://vitalets.github.io/playwright-bdd/). playwright-bdd convierte cada `.feature` en un test de Playwright, así que se conservan los proyectos, los navegadores, los fixtures, el reporte HTML y los traces.

## Ejecutar

Con la app corriendo (`docker compose up -d --build` en la raíz), desde esta carpeta:

```bash
pnpm install && pnpm e2e
```

`pnpm e2e` instala Chromium y Firefox de Playwright, genera los tests desde los `.feature` (`bddgen`) y corre toda la suite. En PowerShell 5 usa `;` en lugar de `&&`.

Al terminar, `pnpm report` abre el reporte HTML. Ahí cada test muestra los pasos Gherkin (`Dado`, `Cuando`, `Entonces`) con su resultado.

| Script | Qué hace |
| --- | --- |
| `pnpm test` | Genera los tests y corre toda la suite (con los navegadores ya instalados) |
| `pnpm test:api` | Solo los escenarios de API |
| `pnpm test:ui` | Solo UI: Chromium y Firefox en Bogotá, el control en UTC y el acceso sin sesión |
| `pnpm test:headed` | UI en Chromium con el navegador visible |
| `pnpm test:evidence` | Toda la suite grabando video y trace de cada escenario |
| `pnpm bdd:check` | Genera los tests y lista los escenarios sin correrlos. Falla si algún paso no está implementado |
| `pnpm bdd:steps` | Lista todos los pasos disponibles para escribir escenarios nuevos |
| `pnpm typecheck` | Chequeo de tipos |

Para correr por tag: `pnpm exec bddgen; pnpm exec playwright test --grep "@DEF-02"`.

Las convenciones para agregar escenarios (tags, Page Objects, `@fail`, oráculo) están en [`.claude/skills/playwright-bdd/SKILL.md`](.claude/skills/playwright-bdd/SKILL.md).

## Reporte de evidencias

Cada corrida genera, sin ningún script adicional, [`../qa/evidencias/index.html`](../qa/evidencias/index.html). Es el reporte HTML de Cucumber que produce playwright-bdd (`cucumberReporter` en `playwright.config.ts`). Es un solo archivo, sin carpetas al lado, y contiene:

- Los escenarios en Gherkin, con el resultado de cada paso. Los `@fail` aparecen como fallidos con el motivo del defecto.
- En UI, la captura de la pantalla al terminar cada escenario.
- En API, un adjunto JSON por llamada, con la request, el status y la respuesta. El historial horario y el token se recortan para que el adjunto se pueda leer.
- Un buscador por texto y por tag, por ejemplo `@DEF-02` o `@SM-03`.

`pnpm test:api` y `pnpm test:ui` reescriben el archivo solo con su parte; para la evidencia completa se usa `pnpm test`. Video y trace no se incluyen. Quedan en el reporte de Playwright (`playwright-report/`, se abre con `pnpm report`).

Variables opcionales: `BASE_URL` (por defecto `http://localhost:3000`), `API_URL` (`http://localhost:8080`), `E2E_EMAIL` y `E2E_PASSWORD` (por defecto, las del `.env.example`).

### Tags

| Tag | Significado |
| --- | --- |
| `@api` / `@ui` | Capa que se prueba |
| `@smoke`, `@SM-xx` | Pruebas de humo de [`../qa/02-smoke.md`](../qa/02-smoke.md) |
| `@CN-xx` | Caso de caja negra de [`../qa/03-casos-caja-negra.md`](../qa/03-casos-caja-negra.md) |
| `@DEF-0x` | Defecto de [`../qa/05-defectos.md`](../qa/05-defectos.md) |
| `@fail` | Fallo esperado: el escenario evidencia un defecto abierto (equivale a `test.fail()`) |
| `@utc` | Corre solo en el proyecto `chromium-utc` (navegador en UTC) |
| `@anon` | Corre solo en `chromium-anon`, sin sesión guardada |
| `@mutate` | Corre solo en Chromium (Run AI Analysis) |

## Cómo leer el resultado

La suite termina en verde aunque la app tenga defectos. Los escenarios que evidencian un defecto conocido llevan `@fail` y el ID del defecto. Aparecen como `x` en la consola y como "expected to fail" en el reporte. Si un defecto se corrige, su escenario pasa y Playwright lo reporta como fallo inesperado: es la señal para quitar el `@fail`.

En los Esquemas, `@fail` va sobre un bloque `Ejemplos` aparte, así que solo las filas del defecto se marcan como fallo esperado. Las demás filas tienen que pasar.

## Agregar un escenario

1. Escribe el escenario en el `.feature` que corresponda, o crea uno nuevo en `features/api` o `features/ui`, con `# language: es` en la primera línea.
2. Reutiliza los pasos existentes (`pnpm bdd:steps` los lista). Si falta uno, agrégalo en `steps/api.steps.ts` o `steps/ui.steps.ts` con `Given`, `When` o `Then` de `steps/fixtures.ts`. Usa lenguaje de negocio en el texto del paso y deja los detalles técnicos en el código.
3. Corre `pnpm bdd:check` para confirmar que todos los pasos están implementados, y luego `pnpm test`.

## Estructura

```
e2e/
├── playwright.config.ts     # setup, api, chromium, firefox, chromium-utc, chromium-anon
├── features/                # casos de prueba en Gherkin (español)
│   ├── api/                 # smoke, clasificación de estado, búsqueda, paginación, errores
│   └── ui/                  # flujo M-109, hora de planta, libro, login, despacho, Run AI
├── steps/
│   ├── fixtures.ts          # createBdd, contexto del escenario (ctx) y utilidades
│   ├── api.steps.ts         # pasos de API (cliente tipado de fixtures/api.ts)
│   └── ui.steps.ts          # pasos de UI (Page Objects de pages/)
├── setup/auth.setup.ts      # login por la UI una vez → .auth/operator.json (storageState)
├── .features-gen/           # tests generados por bddgen (no se versionan)
├── config/env.ts            # URLs y credenciales (variables de entorno)
├── data/                    # oráculo: valores esperados del README, separados de los pasos
├── fixtures/
│   ├── test.ts              # test de playwright-bdd extendido: page objects + cliente de API autenticado
│   └── api.ts               # cliente tipado de la API de EnergIA
├── pages/                   # Page Objects: Login, Despacho, Libro, Detalle, Anomalías, Investigación
└── .claude/skills/playwright-bdd/   # convenciones para extender la suite
```
