# language: es
@api @smoke
Característica: smoke de la API
  Como equipo de QA quiero saber en segundos si el build se puede probar:
  la API responde, el login funciona, las rutas están protegidas.

  @SM-01
  Escenario: La API está viva
    Cuando consulto el estado de salud de la API
    Entonces la API responde con código 200

  @SM-03 @SM-05 @CN-01
  Escenario: El operador de demo inicia sesión y la API lo reconoce
    Cuando inicio sesión en la API con las credenciales de demo
    Entonces la API responde con código 200
    Y recibo un token JWT de tipo "Bearer"
    Y con ese token la API identifica al operador de demo

  @SM-05
  Escenario: Sin sesión no se pueden consultar los medidores
    Cuando consulto la lista de medidores sin token
    Entonces la API responde con código 401
    Y el error tiene el formato común con código 401

  @SM-06
  Escenario: El libro tiene los 12 medidores del dataset
    Cuando consulto todos los medidores
    Entonces el libro tiene los 12 medidores del dataset

  @SM-07
  Escenario: El motor detecta las 4 anomalías en el orden del README
    Cuando consulto las anomalías detectadas
    Entonces las anomalías están en este orden de prioridad:
      | prioridad | medidor |
      | 1         | M-109   |
      | 2         | M-112   |
      | 3         | M-104   |
      | 4         | M-106   |
