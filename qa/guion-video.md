# Guion del video (máx. 15 min)

Apoyo para grabar. No es un entregable pedido.

**Preparación:**

- `docker compose up -d --build`.
- Windows en zona `America/Bogota`.
- Pestañas abiertas: [README](../README.md), [01](01-plan-de-pruebas.md), [05](05-defectos.md), la UI en `http://localhost:3000` y una terminal en `e2e/`.
- Haber corrido `pnpm e2e` una vez, para no esperar descargas.

## 1. Estrategia y riesgos (2 min)

- El producto, el usuario (operador en Colombia) y el oráculo (los README, citados en cada caso; `expected_results.csv` no se usó).
- La tabla de riesgos de [01 2](01-plan-de-pruebas.md): primero la clasificación y la acción, después la consistencia entre capas y lo que puede ocultar un crítico.
- El orden de trabajo: humo, caja negra, defectos, caja blanca (el código solo para buscar la causa raíz) y automatización.
- Uso de IA y cómo se controló.

## 2. Casos de caja negra (3 min)

- **Tabla de decisión (CN-14/CN-15).** Mostrar las 5 reglas tipo → estado y la fila de M-106, que falla.
- **Valores límite de paginación (CN-06).** `size` 1, 12, 100 y 101 → 400; `page` 13 → vacío; `page` -1 → 500.
- **Consistencia entre capas de M-109 (CN-17).** 2.207,6 kWh, baseline y +109,8 % frente al +110,5 % de la ventana: son dos datos distintos, a propósito.

## 3. Reproducir los defectos (5 min)

| Defecto | Cómo mostrarlo |
| --- | --- |
| DEF-01 | Despacho: "8 normales · 2 alerta". Libro filtrado por Alertas: aparece M-106 (falso positivo). `curl` a `getById/M-106` → `"status": "ALERT"` |
| DEF-02 | `/anomalias`: M-109 "Detectada 12/09 09:00", con la explicación "desde 12/09 14:00" al lado. API `detected_at` 14:00Z. M-112 cambia de día |
| DEF-03 | `/medidores`: "1–10 de 12", "Siguiente" deshabilitado. Cambiar la URL a `?pagina=2`: aparecen M-111 y M-112 |
| DEF-04 | Buscar `m-109` + Enter → "Ningún medidor coincide". `M-109` sí lo encuentra |
| DEF-05 | `curl` con `"page": -1` → 500. Log del backend: `slice bounds out of range [:-10]` |

Para cada uno, mencionar la causa raíz (archivo y línea) y el test que lo detecta.

## 4. Playwright con Gherkin (3 min)

- Abrir `e2e/features/ui/flujo-m109.feature`: el caso se lee en español y en lenguaje de negocio (`Dado`, `Cuando`, `Entonces`), con las cifras esperadas en tablas. Los tags enlazan cada escenario con su caso (`@CN-17`) o defecto (`@DEF-02`).
- `pnpm e2e` en `e2e/`. Explicar la salida: `bddgen` genera los tests desde los `.feature`, los `x` son fallos esperados (escenarios `@fail`) y la suite termina en verde.
- Abrir `qa/evidencias/index.html`. Es el reporte de evidencias: se genera solo al correr `pnpm test`, sin scripts. Mostrar el flujo de M-109, que pasa: cada paso Gherkin aparece con su resultado, con la captura de la UI y el JSON de la API adjunto. Filtrar por `@DEF-02` para ver el fallo esperado de la hora de planta.
- Mostrar `hora-planta.feature`: en Bogotá falla como se espera y el control `@utc` pasa. Eso demuestra que la falla la causa la zona horaria y no el locator. El reporte de Playwright (`pnpm report`) queda para traces y video.
- Abrir `qa/evidencias/index.html`, el reporte de evidencias que la misma corrida genera sola. Filtrar por `@DEF-02` y mostrar la captura con la hora corrida. Filtrar por `@DEF-05` y abrir el JSON adjunto del paso: request con `page: -1` y status 500.
- Mencionar el código: pasos en TypeScript sobre Page Objects, datos separados en `data/expected.ts`, locators por rol, sin `waitForTimeout`, Chromium y Firefox, y el workflow de GitHub Actions.

## 5. Decisión (2 min)

- No liberar: DEF-01, DEF-02 y DEF-03 son de severidad Alta y cambian lo que hace el operador.
- Qué haría falta para liberar, y los riesgos abiertos: narración de OpenAI, pocos tests de frontend, accesibilidad y la cobertura de `classify`.
