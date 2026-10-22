# Parte C · Casos funcionales de caja negra

Diseñados y ejecutados **sin mirar el código**, con la documentación como fuente de verdad: [README.md](../README.md), [backend/README.md](../backend/README.md) (BR), [frontend/README.md](../frontend/README.md) (FR) y [frontend/PRODUCT.md](../frontend/PRODUCT.md) (PR).

**Cómo reproducir:** los casos marcados con **[auto]** están en la suite Playwright, escritos en Gherkin (español) en [`e2e/features/`](../e2e/features). `pnpm test` en `e2e/` los corre y deja el [reporte de evidencias](evidencias/index.html), con la request y la respuesta de cada paso de API y una captura por escenario de UI. Los demás se reproducen a mano con los datos de la tabla. Cada escenario lleva el tag del caso (`@CN-xx`), así que `playwright test --grep "@CN-xx"` lo corre solo. Los escenarios que evidencian un defecto llevan `@fail`: son fallos esperados.

| Caso | Feature |
| --- | --- |
| CN-01 | [setup/auth.setup.ts](../e2e/setup/auth.setup.ts) (UI) y [smoke.feature](../e2e/features/api/smoke.feature) (API) |
| CN-02, CN-03, CN-05 | [login.feature](../e2e/features/ui/login.feature) (proyecto `chromium-anon`, sin sesión) |
| CN-06 | [paginacion-api.feature](../e2e/features/api/paginacion-api.feature) (valores límite en un Esquema; `page=-1` con `@fail`, DEF-05) |
| CN-07 | [paginacion-libro.feature](../e2e/features/ui/paginacion-libro.feature) (`@fail`, DEF-03; control por URL que pasa) |
| CN-08 | [clasificacion-estado.feature](../e2e/features/api/clasificacion-estado.feature) (cada filtro devuelve solo su estado) y [errores-api.feature](../e2e/features/api/errores-api.feature) (estado inválido → 400). Los conteos 9/1/2 quedan en CN-16 |
| CN-09 | [filtro-alertas.feature](../e2e/features/ui/filtro-alertas.feature) (`@fail`, DEF-01: hoy salen M-104 y M-106) |
| CN-10 | [busqueda-medidor.feature](../e2e/features/api/busqueda-medidor.feature) (particiones; `m-109` con `@fail`, DEF-04) |
| CN-11 | [busqueda-libro.feature](../e2e/features/ui/busqueda-libro.feature) (particiones en la UI; `m-109` con `@fail`, DEF-04). `M-109` exacto también está en [flujo-m109.feature](../e2e/features/ui/flujo-m109.feature) |
| CN-12 | Parcial: el criterio inválido `name` → 400 en [errores-api.feature](../e2e/features/api/errores-api.feature). El orden válido de la UI está en CN-13 |
| CN-13 | [filtros-url.feature](../e2e/features/ui/filtros-url.feature) (deep link `estado=CRITICAL` y `orden=consumption`) |
| CN-14, CN-15 | [clasificacion-estado.feature](../e2e/features/api/clasificacion-estado.feature) (tabla de decisión como Esquema; la fila de M-106 en un bloque `Ejemplos` con `@fail`, DEF-01) |
| CN-16 | [clasificacion-estado.feature](../e2e/features/api/clasificacion-estado.feature) (conteos de la API) y [despacho.feature](../e2e/features/ui/despacho.feature) (la tarjeta de la UI). Los dos con `@fail`, DEF-01 |
| CN-17 | [flujo-m109.feature](../e2e/features/ui/flujo-m109.feature) (UI contra README y API, con las cifras en tablas) |
| CN-18 | [hora-planta.feature](../e2e/features/ui/hora-planta.feature) (`@fail` en Bogotá, control `@utc` que pasa; DEF-02) |
| CN-19 | [errores-api.feature](../e2e/features/api/errores-api.feature) (M-999 → 404) y [medidor-inexistente.feature](../e2e/features/ui/medidor-inexistente.feature) (mensaje y vuelta al libro) |
| CN-20 | [run-ai.feature](../e2e/features/ui/run-ai.feature) (`@mutate`, solo Chromium) |

## Técnicas aplicadas

| Técnica | Dónde |
|---|---|
| Partición de equivalencia | Login (CN-01 a CN-04), `status` (CN-08), `meter_id` (CN-10, CN-11) |
| Valores límite | Paginación `page` y `size` (CN-06, CN-07) |
| Tabla de decisión | Tipo → estado, severidad, prioridad y acción (CN-14, CN-15) |
| Negativas y validación de entradas | CN-03, CN-05, CN-06, CN-08, CN-12, CN-19 |
| Consistencia entre capas (API ↔ UI ↔ docs) | CN-09, CN-16, CN-17, CN-18 |
| Transición de estados / concurrencia | Run AI Analysis (CN-20) |

## Particiones y límites diseñados

**Login:** clases válidas: credencial correcta, email con otro uso de mayúsculas; inválidas clave incorrecta, campos vacíos, JSON mal formado, sin token, token alterado.

**Paginación** (12 medidores; `size` documentado entre 1 y 100 por el mensaje de error de la API):

| Campo | Inválido bajo | Límite | Válido | Límite | Inválido alto |
|---|---|---|---|---|---|
| `page` | −1, 0 | 1 | 2 | última = 2 (con size 10), 12 (con size 1) | 3 (más allá de la última) |
| `size` | 0 | 1 | 10, 12 | 100 | 101 |

**`status`:** {`NORMAL`, `ALERT`, `CRITICAL`} válidos; {`WARNING`} inválido; {`critical`} borde de mayúsculas.

**`meter_id`:** {exacto `M-109`, parcial `109`, minúsculas `m-109`, sin coincidencias `X-999`}. BR: "Búsqueda parcial, sin importar mayúsculas (`109` encuentra `M-109`)".

## Casos

| ID | Título | Precondición | Pasos | Datos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|---|
| CN-01 | Login con credenciales válidas (API y UI) **[auto]** | App arriba | API: `POST /auth/login`. UI: llenar Email y Contraseña, clic en Entrar | `admin@energia.local` / `admin123` | 200 con JWT (BR §Login). UI navega a `/` (Despacho) | 200, JWT, `expires_in 28800`. UI navega a `/` | Pasa |
| CN-02 | Login con clave incorrecta **[auto]** | App arriba | Igual que CN-01 | clave `admin124` (API) / `mala` (UI) | 401 con formato de error común (BR §Errores). UI muestra mensaje y se queda en `/login` | 401 `Email o contraseña incorrectos`. UI: alerta "Email o contraseña incorrectos. Revisa los datos e inténtalo de nuevo." | Pasa |
| CN-03 | Login con campos vacíos **[auto]** | App arriba | API con email y password vacíos. UI: vaciar Email y enviar | `""` / `""` | 400 con `errors` por campo. UI bloquea el envío | 400 `Datos inválidos`, `errors: ["email es obligatorio","password es obligatorio"]`. UI: validación nativa `required` | Pasa |
| CN-04 | Email con mayúsculas distintas | App arriba | `POST /auth/login` | `ADMIN@energia.local` / `admin123` | Decisión documentada: el email no distingue mayúsculas (RFC 5321 en la práctica) → 200 | 200 | Pasa |
| CN-05 | Rutas protegidas sin token o con token alterado **[auto]** | — | `GET /auth/me` y `POST /meter/getAll` sin header; `GET /auth/me` con `Bearer abc.def.ghi`. UI: abrir `/medidores` sin sesión | — | 401 en todos (BR §Login). UI redirige a `/login` | 401 en los tres. UI redirige a `/login` | Pasa |
| CN-06 | Límites de paginación en la API **[auto]** | Token válido | `POST /meter/getAll` con cada valor de la tabla de límites | `page` −1, 0, 1, 2, 3, 12 (size 1); `size` 0, 1, 12, 101 | Valores válidos devuelven la página; valores fuera de rango responden 400 con el formato de error (BR §Errores), como ya hace `size: 101` | `page 1/2/3/12`, `size 1/12`: correctos (`page 3` → `rows: []`). `size 101` → 400 "pagination.size debe estar entre 1 y 100". **`page −1` → 500 "Error interno del servidor"**. `page 0` y `size 0` se corrigen en silencio a 1 y 10 | **Falla** (DEF-05) |
| CN-07 | Paginación en la UI: llegar a la página 2 **[auto]** | Sesión iniciada | Abrir `/medidores` (orden por defecto). Clic en "Siguiente" | 12 medidores, 10 por página | "1–10 de 12 medidores" y "Siguiente" habilitado; al pulsarlo aparecen M-111 y M-112 (FR: libro paginado) | "1–10 de 12 medidores", **"Siguiente" deshabilitado**. M-111 y M-112 (crítico) solo son alcanzables editando la URL a `?pagina=2` | **Falla** (DEF-03) |
| CN-08 | Filtro por estado en la API **[auto]** | Token válido | `POST /meter/getAll` con cada `status` | `NORMAL`, `ALERT`, `CRITICAL`, `WARNING`, `critical` | Según la tabla de decisión: NORMAL = 9 (8 sanos + M-106), ALERT = 1 (M-104), CRITICAL = 2 (M-109, M-112). `WARNING` → 400 | NORMAL = 8, **ALERT = 2 (M-104 y M-106)**, CRITICAL = 2. `WARNING` → 400 con mensaje claro. `critical` → 200 (acepta minúsculas; aceptable) | **Falla** (DEF-01) |
| CN-09 | Filtro "Alertas" en la UI **[auto]** | Sesión iniciada | `/medidores` → clic en "Alertas" | — | Solo M-104; la URL guarda el filtro (FR: "los filtros viven en la URL") | URL `?estado=ALERT` (correcto), pero lista **M-104 y M-106** | **Falla** (DEF-01) |
| CN-10 | Búsqueda por `meter_id` en la API **[auto]** | Token válido | `POST /meter/getAll` con `filter.meter_id` | `M-109`, `109`, `m-109`, `X-999` | `M-109`, `109` y `m-109` → solo M-109 (BR: "parcial, sin importar mayúsculas"). `X-999` → 0 filas | `M-109` → 1, `109` → 1, **`m-109` → 0**, `X-999` → 0 | **Falla** (DEF-04) |
| CN-11 | Búsqueda por medidor en la UI **[auto]** | Sesión iniciada | `/medidores` → escribir en "Medidor" → Enter | `M-109`, `109`, `m-109`, `M-11`, `X-999` | Igual que CN-10; `M-11` → M-110, M-111, M-112. `X-999` → estado vacío | `M-109` → M-109; `109` → M-109; `M-11` → M-110, M-111, M-112; `X-999` → "Ningún medidor coincide con los filtros". **`m-109` → "Ningún medidor coincide con los filtros"** (la UI envía bien el texto; la API devuelve 0) | **Falla** (DEF-04) |
| CN-12 | Orden por consumo, variación y severidad (API) | Token válido | `POST /meter/getAll` con `sort_by` y `sort_order: DESC`, `size 12`; luego valores inválidos | `consumption`, `variation`, `severity`; `name`; `UP` | Lista ordenada por el campo. Inválidos → 400 | Consumo: M-109 2.207,6 → M-107 474,66. Variación: +109,82 → −1,13. Severidad: HIGH, HIGH, MEDIUM, LOW, sin severidad. `name` y `UP` → 400 con mensaje | Pasa |
| CN-13 | Filtros y orden persisten en la URL (UI) **[auto]** | Sesión iniciada | Abrir directamente `/medidores?estado=CRITICAL`; cambiar "Ordenar por" a Consumo | — | La URL reconstruye el filtro al recargar (FR) | `?estado=CRITICAL` → M-109, M-112. "Ordenar por: Consumo" → `?orden=consumption` y la petición lleva `sort_by: consumption` | Pasa |
| CN-14 | Tabla de decisión a nivel de anomalía (tipo, severidad, prioridad, acción) **[auto]** | Token válido | `GET /anomaly/getAll`; UI `/anomalias` | Reglas R1–R4 | M-109 REAL/HIGH/1/0,95/Investigar · M-112 DATA_QUALITY/HIGH/2/0,95/Validar · M-104 EXPLAINABLE/MEDIUM/3/0,86/Validar operación · M-106 FALSE_POSITIVE/LOW/4/0,86/No escalar (README) | Coinciden las 4 filas en API y UI. `anomaly: false` en M-106 | Pasa |
| CN-15 | Tabla de decisión a nivel de medidor (tipo → estado) **[auto]** | Token válido | `GET /meter/getById/{id}` para M-109, M-112, M-104, M-106, M-101 | Reglas R1–R5 | CRITICAL, CRITICAL, ALERT, **NORMAL**, NORMAL (BR §Estado: "Sin anomalía, o `FALSE_POSITIVE` → `NORMAL`") | CRITICAL, CRITICAL, ALERT, **ALERT**, NORMAL | **Falla** (DEF-01) |
| CN-16 | KPIs del Despacho = API = documentación **[auto]** | Sesión iniciada | `GET /dashboard/getSummary`; UI `/` tarjeta "Medidores" | — | `status_counts` = {normal 9, alert 1, critical 2}; "4 anomalías · 2 requieren atención" (README) | API {normal 8, alert 2, critical 2}; UI "8 normales · 2 alerta · 2 críticas". "4" y "2 requieren atención" correctos. UI y API son coherentes entre sí; ambas contradicen la regla | **Falla** (DEF-01) |
| CN-17 | Cifras del detalle de M-109 en API, UI y README **[auto]** | Sesión iniciada | `GET /meter/getById/M-109`; UI `/medidores/M-109` | README y BR | Consumo 24 h 2.207,6 kWh; baseline 1.052,15 kWh; variación +109,8 %; estado Crítica; explicación con +110,5 % (ventana de 58 h, otro dato a propósito) | API 2207.6 / 1052.15 / 109.82 / CRITICAL. UI "2.207,6 kWh", "1.052,2 kWh", "+109,8 %", "Crítica" y la explicación con +110,5 %. El baseline se redondea a 1 decimal en la UI (observación, no defecto) | Pasa |
| CN-18 | Horas de planta sin convertir a la zona del navegador **[auto]** | Sesión iniciada, navegador en `America/Bogota` | Abrir `/anomalias` y `/medidores/M-109`; repetir con `timezoneId UTC` | API `detected_at` M-109 `2026-09-12T14:00:00Z`, M-112 `2026-09-13T00:00:00Z`, `last_reading_at` `2026-09-14T23:00:00Z` | Se muestran tal cual: 12/09 14:00, 13/09 00:00, 14/09 23:00 (PR: "never convert them to the browser's time zone"; FR §Diseño) | En Bogotá: **12/09 09:00, 12/09 19:00 (cambia el día), 14/09 18:00**. En UTC se ven bien. En la misma pantalla, el texto del motor dice "desde 12/09 14:00" y la UI "Detectada 12/09 09:00" | **Falla** (DEF-02) |
| CN-19 | Detalle de un medidor inexistente **[auto]** | Sesión iniciada | `GET /meter/getById/M-999`; UI `/medidores/M-999` | `M-999`, `m-109` | 404 con formato de error; UI con mensaje y salida | 404 "Medidor no encontrado". UI: "No existe el medidor M-999" + "Ir al libro de medidores". `m-109` → 200 (acepta minúsculas) | Pasa |
| CN-20 | Run AI Analysis: progreso y exclusión mutua **[auto]** | Token válido | Dos `POST /ai/analyze` simultáneos; sondear `GET /ai/analysis/{id}`. UI: clic en "Run AI Analysis" | — | 202 y un solo análisis activo ("Nunca corren dos análisis a la vez", BR). Los 7 pasos terminan en DONE y el resumen dice 4 / 2 | 1.º 202 `AN-0002`; 2.º 200 con el mismo `AN-0002` `RUNNING`. Termina en `COMPLETED` con 7 pasos DONE. UI: los 7 pasos "Hecho" y "4 anomalías · 2 prioritarias". Observación: la hoja no expone `role="dialog"` (accesibilidad) | Pasa |
