# language: es
@ui @CN-19
Característica: El detalle de un medidor que no existe
  Como operador quiero un mensaje claro si abro un código que no está en el libro,
  y una salida de vuelta.

  Antecedentes:
    Dado que el operador tiene la sesión iniciada

  Escenario: M-999 explica que no existe y vuelve al libro
    Cuando abre el detalle del medidor inexistente "M-999"
    Entonces ve que no existe el medidor "M-999"
    Cuando vuelve al libro desde el detalle
    Entonces ve el libro de medidores
