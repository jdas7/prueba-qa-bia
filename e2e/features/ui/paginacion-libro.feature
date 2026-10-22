# language: es
@ui @CN-07 @DEF-03
Característica: Recorrer el libro de medidores página por página
  Como operador quiero llegar a todos los medidores con los botones de la
  paginación.

  Antecedentes:
    Dado que el operador tiene la sesión iniciada

  @fail
  Escenario: Con "Siguiente" el operador llega a M-112
    Cuando abre el libro de medidores
    Entonces la paginación indica "1–10 de 12"
    Cuando pasa a la página siguiente
    Entonces el libro muestra solo los medidores "M-111, M-112"

  Escenario: Control: la página 2 existe si se abre directamente
    Cuando abre la página 2 del libro de medidores
    Entonces la paginación indica "11–12 de 12"
    Y el libro muestra solo los medidores "M-111, M-112"
    Y no hay página siguiente
