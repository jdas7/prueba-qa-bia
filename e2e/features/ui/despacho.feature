# language: es
@ui @CN-16 @DEF-01
Característica: El Despacho cuenta los medidores según la regla de estado
  Como operador quiero que la tarjeta Medidores coincida con la documentación:
  9 normales, 1 en alerta y 2 críticos.

  Antecedentes:
    Dado que el operador tiene la sesión iniciada

  @fail
  Escenario: El Despacho cuenta 9 normales, 1 en alerta y 2 críticos
    Entonces está en el Despacho
    Y el estado de la planta cuenta "9 normales · 1 alerta · 2 críticas"
