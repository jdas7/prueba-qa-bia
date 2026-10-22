# language: es
@ui @CN-13
Característica: Los filtros y el orden viven en la dirección
  Como operador quiero compartir un enlace del libro y que se abra con el
  mismo filtro y el mismo orden (frontend/README: los filtros viven en la URL).

  Antecedentes:
    Dado que el operador tiene la sesión iniciada

  Escenario: Un enlace directo abre solo los medidores críticos
    Cuando abre el libro con la consulta "estado=CRITICAL"
    Entonces el libro muestra solo los medidores "M-109, M-112"

  Escenario: Ordenar por consumo queda escrito en la dirección
    Cuando abre el libro de medidores
    Y ordena el libro por "Consumo"
    Entonces la dirección contiene "orden=consumption"
