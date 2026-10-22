# language: es
@ui @CN-09 @DEF-01
Característica: El filtro Alertas muestra solo los medidores en alerta
  Como operador quiero ver únicamente los medidores en alerta. Según la regla
  de estado, un falso positivo queda Normal, así que Alertas es solo M-104.

  Antecedentes:
    Dado que el operador tiene la sesión iniciada

  @fail
  Escenario: La pestaña Alertas deja solo M-104
    Cuando abre el libro de medidores
    Y filtra el libro por estado "Alertas"
    Entonces el libro muestra solo los medidores "M-104"
