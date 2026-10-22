# language: es
@ui @mutate @CN-20
Característica: El operador vuelve a correr el análisis de IA
  Como operador quiero lanzar Run AI Analysis y ver los 7 pasos terminados
  con el resumen del dataset: 4 anomalías, 2 prioritarias.
  Corre solo en Chromium: el motor no admite dos análisis a la vez.

  Antecedentes:
    Dado que el operador tiene la sesión iniciada

  Escenario: Run AI Analysis termina con 4 anomalías y 2 prioritarias
    Cuando corre el análisis de IA
    Entonces el análisis termina con 7 pasos hechos y el resumen "4 anomalías · 2 prioritarias"
