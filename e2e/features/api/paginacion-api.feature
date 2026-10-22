# language: es
@api @CN-06
Característica: Paginación del libro de medidores en la API
  Como operador quiero recorrer los 12 medidores por páginas sin perder ninguno.
  Contrato (Swagger): página >= 1 y tamaño entre 1 y 100; 0 equivale a no enviarlo
  (página 1, tamaño 10).

  Esquema del escenario: Página <pagina> de tamaño <tamano>
    Cuando pido la página <pagina> con <tamano> medidores por página
    Entonces la API responde con código 200
    Y la respuesta indica página <pagina>, tamaño <tamano> y total 12
    Y las filas son los medidores "<filas>"

    Ejemplos:
      | pagina | tamano | filas          |
      | 1      | 1      | M-101          |
      | 12     | 1      | M-112          |
      | 13     | 1      | ninguno        |
      | 1      | 10     | M-101 a M-110  |
      | 2      | 10     | M-111, M-112   |
      | 1      | 12     | M-101 a M-112  |
      | 1      | 100    | M-101 a M-112  |

  Escenario: Página y tamaño en 0 se tratan como no enviados
    Cuando pido la página 0 con 0 medidores por página
    Entonces la API responde con código 200
    Y la respuesta indica página 1, tamaño 10 y total 12

  Escenario: Un tamaño mayor a 100 se rechaza con un mensaje claro
    Cuando pido la página 1 con 101 medidores por página
    Entonces la API responde con código 400
    Y el error de validación dice "pagination.size debe estar entre 1 y 100"

  @fail @DEF-05
  Escenario: Una página negativa se rechaza con un mensaje claro (hoy: error 500)
    Cuando pido la página -1 con 10 medidores por página
    Entonces la API responde con código 400
    Y el mensaje de error es "Filtros inválidos"
