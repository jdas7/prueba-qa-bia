# Parte B · Suite de humo

**Objetivo:** Si falla algún caso de humo, no se sigue con la caja negra: se reporta y se espera un build nuevo.

**Entorno:** Windows 11 Pro, zona horaria del equipo `SA Pacific Standard Time` (UTC−5, igual a `America/Bogota`), Docker 29.7.2 / Compose v5.3.1, commit `15765d9`. UI en `http://localhost:3000` (nginx), API en `http://localhost:8080`. Navegador: Chromium de Playwright 1.64.1. Ejecutado el 21/10/2026.

| ID | Verificación | Por qué está en el humo | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|
| SM-01 | `GET /health` | Si la API no arranca (por ejemplo, no encuentra los CSV), nada más tiene sentido | 200 `{"status":"ok"}` | 200 `{"status":"ok"}` | Pasa | curl en la consola; [reporte](evidencias/index.html), `@SM-01` |
| SM-02 | Swagger en `/docs` y `/docs/openapi.json` | Es parte del oráculo; si no carga, falta la referencia del contrato | Página y spec cargan | Cargan | Pasa | navegador |
| SM-03 | `POST /auth/login` con `admin@energia.local` / `admin123` | Todas las rutas de `/api/v1` dependen del token | 200 con `access_token`, `token_type: Bearer`, `expires_in` | 200, token JWT, `expires_in: 28800` (8 h, igual a `JWT_TTL`) | Pasa | [reporte](evidencias/index.html), `@SM-03` |
| SM-04 | `POST /auth/login` con clave incorrecta | Confirma que el login no deja pasar cualquier cosa | 401 con el formato de error | 401 `Email o contraseña incorrectos` | Pasa | manual (respuesta en la columna "Resultado obtenido") |
| SM-05 | `GET /auth/me` sin token y con token | Confirma que el middleware protege las rutas | 401 sin token; 200 con el usuario | 401 / 200 `Operador` | Pasa | [reporte](evidencias/index.html), `@SM-05` |
| SM-06 | `GET /dashboard/getSummary` | Es la primera pantalla del operador; comprueba que el motor corrió al arrancar | 200, 12 medidores, 4 anomalías, `last_analysis` `COMPLETED` | 200, 12 medidores, 4 anomalías, AN-0001 `COMPLETED` | Pasa | [reporte](evidencias/index.html), `@SM-06` |
| SM-07 | `GET /anomaly/getAll` | Es el producto: si no hay anomalías priorizadas, el build no sirve | 200 con 4 anomalías, M-109 en prioridad 1 | 200, 4 anomalías, M-109 prioridad 1 | Pasa | [reporte](evidencias/index.html), `@SM-07` |
| SM-08 | UI: login → Despacho → Libro de medidores → Detalle M-109 | Confirma que el front se sirve, el proxy `/api` funciona y las rutas cargan | Cada pantalla muestra datos | Las 4 pantallas cargan con datos | Pasa | [reporte](evidencias/index.html), `@CN-17` (recorrido con captura) |
| SM-09 | UI: abrir `/medidores` sin sesión | Una ruta protegida abierta sería un problema de seguridad básico | Redirige a `/login` | Redirige a `/login` | Pasa | manual (navegador sin sesión) |

**Veredicto del smoke:** 9 test de 9 pasan. El build se puede probar.

**Automatización:** los casos de API SM-01, SM-03, SM-05, SM-06 y SM-07 están en Gherkin en [`e2e/features/api/smoke.feature`](../e2e/features/api/smoke.feature) (tags `@smoke @SM-xx`). El login por la UI lo hace [`e2e/setup/auth.setup.ts`](../e2e/setup/auth.setup.ts) antes de los escenarios de UI, y el recorrido de SM-08 hasta el detalle de M-109 está dentro de [`e2e/features/ui/flujo-m109.feature`](../e2e/features/ui/flujo-m109.feature). Para correr solo el humo: `pnpm exec bddgen; pnpm exec playwright test --grep "@smoke"`. Cada corrida deja el [reporte de evidencias](evidencias/index.html) con la request y la respuesta de cada paso de API. En el reporte se busca el tag de la columna "Evidencia" para ver el escenario.
