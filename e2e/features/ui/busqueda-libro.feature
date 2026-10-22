# language: es
@ui @CN-11
Característica: Búsqueda de un medidor en el libro
  Como operador quiero encontrar un medidor escribiendo parte de su código,
  sin importar mayúsculas ("109 o m-109 encuentra M-109").

  Antecedentes:
    Dado que el operador tiene la sesión iniciada

  Esquema del escenario: Buscar "<busqueda>" muestra "<esperados>"
    Cuando abre el libro de medidores
    Y busca el medidor "<busqueda>"
    Entonces el libro muestra solo los medidores "<esperados>"

    Ejemplos:
      | busqueda | esperados           |
      | 109      | M-109               |
      | M-11     | M-110, M-111, M-112 |
      | X-999    | ninguno             |

    @fail @DEF-04
    Ejemplos: Defecto abierto (hoy el libro queda vacío)
      | busqueda | esperados |
      | m-109    | M-109     |
