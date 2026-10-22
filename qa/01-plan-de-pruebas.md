# Parte A · Estrategia y plan de pruebas

**Producto:** EnergIA, monitoreo de 12 medidores con un motor que detecta, clasifica y prioriza anomalías de consumo.

## 1. Alcance

**Dentro:**

- Login (UI y API).
- Despacho: órdenes, KPIs y conteos por estado.
- Libro de medidores: filtro por estado, búsqueda, orden, paginación y estado en la URL.
- Detalle del medidor.
- Lista de anomalías e investigación.
- Run AI Analysis hasta `COMPLETED`, incluida la concurrencia.
- Contrato de errores de la API.
- Hora de planta.
- Los casos de medidores.

**Fuera, y por qué:**

| Fuera de alcance | Motivo |
| --- | --- |
| Carga y rendimiento | 12 medidores y 4.032 lecturas en memoria; no es el riesgo de este build |
| Pentest | Solo entrar pruebas funcionales: pruebas de autenticación |
| Auditoría WCAG completa | Auditoria para sitio web |
| Multiusuario y persistencia | El dataset es de solo lectura y hay un único usuario de demo |
| Navegadores móviles | Se usan Chromium y Firefox de escritorio |

## 2. Riesgos, en orden de prioridad

| # | Riesgo | Impacto si falla | Dónde se prueba |
| --- | --- | --- | --- |
| 1 | Clasificación, severidad, prioridad, estado y acción del motor | El operador va al medidor equivocado, o escala un falso positivo | Tabla de decisión en API y UI; caja blanca de `classify` y `meter` |
| 2 | Cifras y horas distintas entre API, UI y documentación | Decisiones con datos falsos; la hora equivocada manda a revisar otra ventana | Consistencia entre capas para M-109; hora de planta en `America/Bogota` |
| 3 | Filtros, búsqueda, orden y paginación que oculten un `CRITICAL` | Un medidor crítico queda fuera de la vista del operador | Partición de equivalencia y valores límite en API y UI |
| 4 | Autenticación | Datos de planta expuestos | Humo y negativos de login, token y rutas protegidas |
| 5 | Robustez de la API ante entradas inválidas | Errores 500 o caídas en lugar de un 400 claro | Negativos del contrato de errores |

## 3. Tipos de prueba por capa

| Tipo | Capa | Entregable |
| --- | --- | --- |
| Smoke | API y UI | [02-smoke.md](02-smoke.md): 9 verificaciones |
| Caja negra: partición de equivalencia, valores límite, tabla de decisión, negativos y consistencia entre capas | API (curl/fetch) y UI | [03-casos-caja-negra.md](03-casos-caja-negra.md): 20 casos |
| Caja blanca: revisión de código, cobertura, tests existentes y tests nuevos | Unitario (Go y Vitest) | [04-caja-blanca.md](04-caja-blanca.md) |
| Regresión automatizada | UI (Playwright en Chromium y Firefox) y API (Playwright `request`), con los casos escritos en Gherkin en español (playwright-bdd) | [e2e/](../e2e/README.md) |
| Reporte de defectos | Todas | [05-defectos.md](05-defectos.md) |

## 4. Criterios de entrada y salida

**Entrada:**

- `docker compose up` terminado.
- `GET /health` responde 200.
- El login de demo funciona.
- Swagger carga.
- La suite de smoke pasa completa. Si un caso de smoke falla, no se sigue: se reporta y se pide otro build.

**Salida:**

- Todos los casos diseñados están ejecutados, con evidencia guardada.
- Cada falla tiene un defecto con severidad, prioridad y causa probable.
- La suite Playwright se corre con un comando y queda en verde. Los escenarios de defectos conocidos quedan marcados con el tag `@fail` (playwright-bdd lo convierte en `test.fail()`).
- Ajuste de bug's para liberar ña versión (sección 7).

**Criterio para liberar:** ningún defecto abierto de severidad Alta en los riesgos 1 a 3.

## 5. Uso de IA

Usé el MCP de [playwright](https://playwright.dev/docs/getting-started-mcp) y el asistente de IA (Cursor) para:

- Realizar una prueba exploratoria a la pagina web y entender el funcionamiento de la web.
- Escribir los scripts de exploración.
- Leer el codigo para entender el producto.
- Redactar los reportes.
