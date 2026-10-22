# language: es
@api @CN-10
Característica: Búsqueda de medidores por código
  Como operador quiero encontrar un medidor escribiendo parte de su código,
  sin importar mayúsculas ("109 o m-109 encuentra M-109").

  Esquema del escenario: Buscar "<busqueda>" (<particion>)
    Cuando busco medidores con el texto "<busqueda>"
    Entonces el resultado son los medidores "<esperados>"

    Ejemplos:
      | particion                | busqueda | esperados           |
      | ID exacto                | M-109    | M-109               |
      | fragmento numérico       | 109      | M-109               |
      | fragmento común a varios | M-11     | M-110, M-111, M-112 |
      | sin coincidencias        | M-999    | ninguno             |

    @fail @DEF-04
    Ejemplos: Defecto abierto (hoy no encuentra nada)
      | particion     | busqueda | esperados |
      | en minúsculas | m-109    | M-109     |
