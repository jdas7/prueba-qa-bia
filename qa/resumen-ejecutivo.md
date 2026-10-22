# Resumen ejecutivo.

**No liberaría este build a producción.** La API, el motor y las pantallas funcionan, y el caso principal (M-109) se detecta, se clasifica y se prioriza bien. Pero hay tres defectos de severidad Alta en los riesgos 1 a 3, que cambian lo que el operador ve y hace:

1. **DEF-01. Un falso positivo aparece como alerta.** M-106 sale en "Alerta" y el Despacho cuenta 8/2/2 en lugar de 9/1/2. Es justo lo que el producto promete evitar: escalar un falso positivo.
2. **DEF-02. Todas las horas salen convertidas a la zona del navegador.** En Colombia se ven 5 h antes, y algunas cambian de día (M-112: 12/09 19:00 en vez de 13/09 00:00). En la misma pantalla la explicación dice "desde 12/09 14:00" y la columna "Detectada 12/09 09:00".
3. **DEF-03. Con 12 medidores, "Siguiente" está deshabilitado.** M-111 y M-112 (crítico) no se pueden alcanzar desde el libro sin editar la URL.

Hay dos defectos más de severidad Media en la API: la búsqueda distingue mayúsculas (DEF-04) y `page` negativo provoca un panic con 500 (DEF-05). Además queda una observación latente sobre los umbrales de severidad (OBS-01).

**Qué haría falta para liberar:** corregir DEF-01, DEF-02 y DEF-03 y volver a correr la suite. Sus tests (escenarios `@fail` en Playwright y los tests de Go y Vitest agregados) pasarán a verde y avisarán que hay que quitar la marca. Los dos defectos de severidad Media pueden ir en el siguiente ciclo, con la búsqueda documentada como sensible a mayúsculas mientras tanto.

## Observaciones de mejora

- La búsqueda de la UI se aplica con Enter, con el botón de lupa o al elegir una sugerencia exacta del datalist; escribir sin enviar no filtra. En mi primera pasada tecleé sin enviar y pareció que "109" no funcionaba; al repetir con Enter funciona. No hay indicación visible de que haga falta enviar (sugerencia de UX, no defecto).
- `page: 0` y `size: 0` se corrigen en silencio, mientras `size: 101` responde 400. lo dejo dentro de DEF-05.
- El baseline de M-109 se ve como 1.052,2 kWh y el README dice 1.052,15 kWh: redondeo de presentación a un decimal.
