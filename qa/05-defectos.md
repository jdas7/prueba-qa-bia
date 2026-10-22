# Parte E · Reporte de defectos

**5 defectos** y 1 observación latente. Todos se reprodujeron más de una vez.

## Entorno común

| Campo | Valor |
|---|---|
| Despliegue | `docker compose up -d --build` (Docker 29.7.2, Compose v5.3.1). UI en `http://localhost:3000` (nginx), API en `http://localhost:8080` |
| SO | Windows 11 Pro |
| Zona horaria | Equipo en `SA Pacific Standard Time` (UTC−5). Navegador de prueba con `timezoneId: America/Bogota`, que es la de los operadores según PRUEBA_QA.md |
| Navegador | Chromium (Playwright 1.64.1), `locale es-CO`, viewport 1440×900 |
| Usuario | `admin@energia.local` / `admin123` |

**Criterio de severidad y prioridad.** *Severidad* = impacto en la decisión del operador o en el sistema. *Prioridad* = urgencia de arreglarlo antes de liberar, considerando frecuencia, visibilidad y costo de corrección. Cuando difieren, lo explico en cada defecto.

## Resumen

| ID | Título | Capa | Severidad | Prioridad | Test que lo evidencia |
|---|---|---|---|---|---|
| DEF-01 | Un falso positivo (M-106) aparece como "Alerta" en vez de "Normal", y los conteos del Despacho quedan mal | API (afecta UI) | Alta | Alta | Playwright `clasificacion-estado.feature`, Go `TestQA_StatusOfFalsePositiveIsNormal` |
| DEF-02 | La UI convierte la hora de planta a la zona del navegador: en Colombia todas las horas salen 5 h antes y algunas cambian de día | UI | Alta | Alta | Playwright `hora-planta.feature`, Vitest `format.qa.test.ts` |
| DEF-03 | El botón "Siguiente" del Libro de medidores está deshabilitado con 12 medidores: M-111 y M-112 (crítico) no son alcanzables | UI | Alta | Alta | Playwright `paginacion-libro.feature`, Vitest `Pagination.qa.test.tsx` |
| DEF-04 | La búsqueda por medidor distingue mayúsculas: "m-109" no encuentra M-109 | API (afecta UI) | Media | Media | Playwright `busqueda-medidor.feature`, Go `TestQA_SearchIsCaseInsensitive` |
| DEF-05 | `pagination.page` negativo provoca un panic y responde 500 en vez de 400 | API | Media | Baja | Playwright `paginacion-api.feature`, Go `TestQA_PaginateNegativePageDoesNotPanic` |
| OBS-01 | La severidad de una anomalía real usa `>=` en los umbrales y el README dice "supera" | Motor | Baja (latente) | Baja | Go `TestQA_RealSeverityBoundaries` |

---

## DEF-01 · Un falso positivo (M-106) aparece como "Alerta" en vez de "Normal", y los conteos del Despacho quedan mal

- **Severidad: Alta.** Contradice el principio del producto ("Quiet when things are fine", PR) y la acción recomendada del propio motor ("No escalar"). El operador ve una alerta abierta que no debe atender, y el KPI del Despacho y el filtro "Alertas" muestran el doble de alertas reales (2 en vez de 1).
- **Prioridad: Alta.** Está en la primera pantalla y en uno de los 4 casos de la demo; el arreglo es una línea.
- **Casos:** CN-08, CN-09, CN-15, CN-16.

**Pasos para reproducir**

1. API: `POST /api/v1/auth/login` y guardar el token.
2. `GET /api/v1/meter/getById/M-106` con `Authorization: Bearer <token>`.
3. `POST /api/v1/meter/getAll` con `{"filter":{"status":"ALERT"}}`.
4. `GET /api/v1/dashboard/getSummary`.
5. UI: entrar, ver la tarjeta "Medidores" del Despacho; ir a Medidores → filtro "Alertas".

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@energia.local","password":"admin123"}' | jq -r .access_token)
curl -s http://localhost:8080/api/v1/meter/getById/M-106 -H "Authorization: Bearer $TOKEN" | jq '{meter_id,status,anomaly_type,severity}'
curl -s -X POST http://localhost:8080/api/v1/meter/getAll -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"filter":{"status":"ALERT"}}' | jq '[.rows[].meter_id]'
curl -s http://localhost:8080/api/v1/dashboard/getSummary -H "Authorization: Bearer $TOKEN" | jq .status_counts
```

**Resultado esperado**

- backend/README.md "Estado de alerta": "Sin anomalía, o `FALSE_POSITIVE` → `NORMAL`".
- README: "4 anomalías detectadas · 2 requieren atención prioritaria"; M-106 "Falso positivo · No escalar".
- El ejemplo del DTO (`dashboard/dto.go`) dice `normal 9, alert 1, critical 2`.
- Por lo tanto: M-106 `NORMAL`; filtro ALERT = [M-104]; `status_counts` = `{normal: 9, alert: 1, critical: 2}`; tarjeta "9 normales · 1 alerta · 2 críticas".

**Resultado obtenido**

```json
{ "meter_id": "M-106", "status": "ALERT", "anomaly_type": "FALSE_POSITIVE", "severity": "LOW" }
["M-104", "M-106"]
{ "normal": 8, "alert": 2, "critical": 2 }
```

UI: "8 normales · 2 alerta · 2 críticas" y M-106 con el sello "Alerta" en el Libro y en el Detalle.

**Evidencia:** [reporte de evidencias](evidencias/index.html), buscar `@DEF-01`: las respuestas de `getById/M-106`, `getAll` con `status: alert` y `getSummary` están adjuntas a cada paso.

---

## DEF-02 · La UI convierte la hora de planta a la zona del navegador: en Colombia todas las horas salen 5 h antes y algunas cambian de día

- **Severidad: Alta.** El operador ve una hora de detección incorrecta y contradictoria: en la misma tarjeta, "Detectada 12/09 09:00" y el texto del motor "desde 12/09 14:00". M-112 aparece detectada el 12/09 cuando ocurrió el 13/09. Ir a revisar un medidor con la hora equivocada lleva a buscar la causa en la ventana equivocada (por ejemplo, en los registros de turno). Afecta a todos los usuarios reales, porque todos están en Colombia.
- **Prioridad: Alta.** Afecta las cuatro pantallas principales y es el 100 % del uso real; el arreglo es trivial.
- **Casos:** CN-18.

**Pasos para reproducir**

1. Navegador con zona `America/Bogota` (cualquier equipo en Colombia; en Playwright `timezoneId: 'America/Bogota'`).
2. Entrar y abrir **Anomalías IA** (`/anomalias`). Mirar la columna "Detectada".
3. Abrir `/medidores/M-109`: mirar "Última lectura" y los eventos.
4. Repetir con el navegador en UTC.

**Datos:** API `detected_at` M-109 `2026-09-12T14:00:00Z`, M-112 `2026-09-13T00:00:00Z`, M-104 `2026-09-11T00:00:00Z`, M-106 `2026-09-08T00:00:00Z`; `last_reading_at` `2026-09-14T23:00:00Z`.

**Resultado esperado:** PR Operating Context: "Timestamps have no time zone (plant time). Show them exactly as received; never convert them to the browser's time zone." FR Diseño: "se muestran tal como vienen, sin convertirlas a la zona del navegador". La UI debe mostrar 12/09 14:00, 13/09 00:00, 11/09 00:00, 08/09 00:00 y 14/09 23:00.

**Resultado obtenido (Bogotá):**

| Dato | API | UI en Bogotá | UI en UTC |
|---|---|---|---|
| Detectada M-109 | 12/09 14:00 | **12/09 09:00** | 12/09 14:00 |
| Detectada M-112 | 13/09 00:00 | **12/09 19:00** (otro día) | 13/09 00:00 |
| Detectada M-104 | 11/09 00:00 | **10/09 19:00** | 11/09 00:00 |
| Detectada M-106 | 08/09 00:00 | **07/09 19:00** | 08/09 00:00 |
| Última lectura (todos) | 14/09 23:00 | **14/09 18:00** | 14/09 23:00 |
| Evento M-109 / "Desde" de la ventana | 12/09 14:00 | **12/09 09:00** | 12/09 14:00 |

**Evidencia:** [reporte de evidencias](evidencias/index.html), buscar `@DEF-02`: captura de Anomalías IA en Bogotá con "Detectada 12/09 09:00" junto a "desde 12/09 14:00". El control `@utc` muestra la misma pantalla con el navegador en UTC y las horas correctas.

---

## DEF-03 · El botón "Siguiente" del Libro de medidores está deshabilitado con 12 medidores: M-111 y M-112 (crítico) no son alcanzables

- **Severidad: Alta.** En la vista por defecto (orden por medidor, 10 por página), el contador dice "1–10 de 12 medidores" pero "Siguiente" está deshabilitado. M-112, un medidor **crítico** (calidad de datos, prioridad 2), queda fuera de la única vista paginada de la pantalla, y solo se ve cambiando el orden, filtrando o editando la URL a mano (`?pagina=2`).
- **Prioridad: Alta.** Ocurre siempre con el dataset del producto y bloquea navegar el libro completo.
- **Casos:** CN-07.

**Pasos para reproducir**

1. Entrar y abrir **Medidores** (`/medidores`), sin filtros.
2. Mirar el pie de la tabla.
3. Intentar pulsar "Siguiente".
4. Abrir `/medidores?pagina=2` directamente.

**Resultado esperado:** FR: "Libro de medidores … paginado"; con 12 medidores y 10 por página hay 2 páginas. "Siguiente" habilitado en la 1; la página 2 muestra M-111 y M-112.

**Resultado obtenido:** "1–10 de 12 medidores", "Anterior" y "Siguiente" deshabilitados. Por URL, `?pagina=2` muestra "11–12 de 12" con M-111 y M-112, así que los datos y la API están bien.

**Evidencia:** [reporte de evidencias](evidencias/index.html), buscar `@DEF-03`: captura del pie "1–10 de 12 medidores" con "Siguiente" deshabilitado. La API sí devuelve la página 2 (`@CN-06`, fila página 2 de tamaño 10).

---

## DEF-04 · La búsqueda por medidor distingue mayúsculas: "m-109" no encuentra M-109

- **Severidad: Media.** El operador que escribe en minúsculas recibe "Ningún medidor coincide con los filtros" para un medidor que existe y está crítico. Hay alternativa (escribir en mayúsculas o elegir la sugerencia), pero el mensaje induce a pensar que el medidor no existe.
- **Prioridad: Media.** Contradice el contrato documentado y el arreglo es simple, aunque no bloquea el flujo principal.
- **Casos:** CN-10, CN-11.

**Pasos para reproducir**

1. `POST /api/v1/meter/getAll` con `{"filter":{"meter_id":"m-109"}}` (y como control `"109"` y `"M-109"`).
2. UI: Medidores → escribir `m-109` en "Medidor" → Enter.

**Resultado esperado:** backend/README.md: "`meter_id` · Búsqueda parcial, sin importar mayúsculas (`109` encuentra `M-109`)". Se espera M-109 en las tres búsquedas.

**Resultado obtenido:** `"M-109"` → 1 fila, `"109"` → 1 fila, **`"m-109"` → `count: 0`**. UI: "Ningún medidor coincide con los filtros" con la URL `?medidor=m-109` (la UI envía bien el texto). Contraste: `GET /meter/getById/m-109` sí responde 200 y el filtro `status: "critical"` sí acepta minúsculas.

**Evidencia:** [reporte de evidencias](evidencias/index.html), buscar `@DEF-04`: la respuesta de `getAll` con `meter_id: "m-109"` (`count: 0`). Las búsquedas de control `"109"` y `"M-109"` (1 fila) están en `@CN-10`.

---

## DEF-05 · `pagination.page` negativo provoca un panic y responde 500 en vez de 400

- **Severidad: Media.** Una entrada inválida del cliente genera un panic en el servidor. El middleware lo recupera (el servicio sigue arriba), pero la respuesta es un 500 genérico, se rompe el contrato de errores (400 con `errors`) y queda ruido en los logs. Es una puerta para quien explore la API.
- **Prioridad: Baja.** La UI nunca envía páginas negativas (`useMeterFilters` normaliza `pagina=-1` a 1), así que el operador no lo ve; se puede corregir después de DEF-01 a DEF-03.
- **Por qué difieren:** el defecto es real en el servidor (severidad media), pero hoy solo lo alcanza un cliente directo de la API (prioridad baja).
- **Casos:** CN-06.

**Pasos para reproducir**

```bash
curl -s -X POST http://localhost:8080/api/v1/meter/getAll -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"pagination":{"page":-1,"size":10}}'
docker logs prueba-qa-bia-backend-1 2>&1 | grep panic
```

**Resultado esperado:** backend/README.md Errores (mismo formato para todos los errores) y el contrato Swagger (`Pagination.page` con `minimum: 1`). Se espera 400 `Filtros inválidos` con un error tipo "pagination.page debe ser mayor o igual a 1", como ya ocurre con `size: 101`.

**Resultado obtenido:**

```json
{ "status_code": 500, "message": "Error interno del servidor", "timestamp": "2026-10-22T01:06:17Z", "path": "/api/v1/meter/getAll" }
```

Log del backend: `ERROR panic error="runtime error: slice bounds out of range [:-10]" path=/api/v1/meter/getAll`.

Valores límite relacionados: `page: 0` y `size: 0` se corrigen en silencio a 1 y 10, mientras `size: 101` responde 400. La regla es inconsistente; conviene documentar que 0 significa "no enviado" o rechazarlo.

**Evidencia:** [reporte de evidencias](evidencias/index.html), buscar `@DEF-05`: la respuesta 500 a `page: -1`. Los valores límite `page: 0`, `size: 0` y `size: 101` están en `@CN-06`. La línea del log del backend está citada arriba.

---

## OBSERVACIÓN-01 · La severidad de una anomalía real usa `>=` en los umbrales y el README dice "supera"

No lo cuento como defecto porque no se manifiesta con el dataset (M-109 está en +110,5 %).

- **Severidad: Baja (latente).** **Prioridad: Baja.**
- **Esperado:** backend/README.md: "HIGH si la variación **supera** 50 % y sigue activa; MEDIUM si **supera** 20 %". Con 50,00 % exacto → MEDIUM; con 20,00 % → LOW.
- **Obtenido:** `backend/internal/analysis/classify/classify.go` líneas 222 y 224 usan `p >= 50` y `p >= 20`: 50,00 % → HIGH y 20,00 % → MEDIUM.
- **Evidencia:** salida de `go test -tags qa` en [04-caja-blanca.md](04-caja-blanca.md) (`realSeverity(50.00%, activa=true) = HIGH, esperaba MEDIUM`).
- **Acción sugerida:** decidir con producto cuál es la fuente de verdad (código o README) y fijarlo con `TestQA_RealSeverityBoundaries`.
