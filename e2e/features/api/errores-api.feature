# language: es
@api
Característica: Errores claros ante pedidos inválidos
  Como integrador quiero que la API rechace los pedidos inválidos con el mismo
  formato de error en todos los casos.

  @CN-08
  Escenario: Un estado que no existe se rechaza indicando los válidos
    Cuando filtro los medidores por estado "BROKEN"
    Entonces la API responde con código 400
    Y el mensaje de error es "Filtros inválidos"
    Y el error de validación dice "filter.status debe ser NORMAL, ALERT o CRITICAL"

  @CN-12
  Escenario: Un criterio de orden que no existe se rechaza
    Cuando ordeno los medidores por "name"
    Entonces la API responde con código 400

  @CN-19
  Escenario: Un medidor que no existe responde "no encontrado"
    Cuando consulto el detalle del medidor "M-999"
    Entonces la API responde con código 404
    Y el error tiene el formato común con código 404
