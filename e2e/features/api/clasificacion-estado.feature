# language: es
@api @CN-14 @CN-15
Característica: Clasificación de anomalías y estado de cada medidor
  Como operador quiero que cada medidor tenga el estado que corresponde a su
  anomalía, para atender solo lo que de verdad requiere atención.

  Esquema del escenario: <medidor> con <tipo> queda en estado <estado>
    Cuando consulto las anomalías detectadas
    Y consulto todos los medidores
    Entonces la anomalía de "<medidor>" es "<tipo>" con severidad "<severidad>", prioridad <prioridad> y confianza <confianza>
    Y el estado del medidor "<medidor>" es "<estado>"

    Ejemplos: Anomalías que requieren atención
      | medidor | tipo                | severidad | prioridad | confianza | estado   |
      | M-109   | REAL_ANOMALY        | HIGH      | 1         | 0.95      | CRITICAL |
      | M-112   | DATA_QUALITY        | HIGH      | 2         | 0.95      | CRITICAL |
      | M-104   | EXPLAINABLE_ANOMALY | MEDIUM    | 3         | 0.86      | ALERT    |

    @fail @DEF-01
    Ejemplos: Falso positivo (defecto abierto: hoy queda en ALERT)
      | medidor | tipo           | severidad | prioridad | confianza | estado |
      | M-106   | FALSE_POSITIVE | LOW       | 4         | 0.86      | NORMAL |

  Escenario: Los medidores sin anomalía quedan en NORMAL
    Cuando consulto todos los medidores
    Entonces estos medidores están en estado "NORMAL" y sin anomalía:
      | M-101 |
      | M-102 |
      | M-103 |
      | M-105 |
      | M-107 |
      | M-108 |
      | M-110 |
      | M-111 |

  @fail @DEF-01 @CN-16
  Escenario: El Despacho cuenta 9 normales, 1 en alerta y 2 críticos
    Cuando consulto el resumen del Despacho
    Entonces la API responde con código 200
    Y el resumen cuenta 9 normales, 1 en alerta y 2 críticos

  @CN-08
  Esquema del escenario: El filtro por estado <estado> solo devuelve medidores en ese estado
    Cuando filtro los medidores por estado "<estado>"
    Entonces la API responde con código 200
    Y todas las filas tienen estado "<estado>" y el total coincide

    Ejemplos:
      | estado   |
      | NORMAL   |
      | ALERT    |
      | CRITICAL |
