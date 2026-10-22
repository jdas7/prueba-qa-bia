# language: es
@ui @CN-18 @DEF-02
Característica: Las horas se muestran como hora de planta
  Como operador en Colombia quiero ver las horas tal como las registró la planta,
  sin convertirlas a la zona horaria de mi computador.

  Antecedentes:
    Dado que el operador tiene la sesión iniciada

  @fail
  Escenario: La columna "Detectada" muestra la hora en que el motor detectó cada anomalía
    Cuando abre la lista de anomalías
    Entonces la columna "Detectada" muestra la hora de planta que envía la API

  @fail
  Escenario: La última lectura de M-109 es la hora de planta
    Cuando abre directamente el detalle de "M-109"
    Entonces la última lectura de "M-109" es la que envía la API, sin convertir

  # Control: el mismo escenario con el navegador en UTC (proyecto chromium-utc) pasa.
  # Demuestra que la falla de arriba la causa solo la zona horaria.
  @utc
  Escenario: Control con el navegador en UTC
    Cuando abre la lista de anomalías
    Entonces la columna "Detectada" muestra la hora de planta que envía la API
