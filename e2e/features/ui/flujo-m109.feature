# language: es
@ui @CN-17
Característica: El operador atiende la anomalía real de M-109
  Como operador de planta quiero ir del Despacho al medidor crítico, entender
  qué pasó y abrir la orden de investigación.
  Las cifras esperadas salen del README y del backend/README, en formato es-CO.

  Antecedentes:
    Dado que el operador tiene la sesión iniciada

  Escenario: Del Despacho a la investigación de M-109
    Entonces está en el Despacho

    Cuando abre "Medidores" desde el menú principal
    Entonces ve el libro de medidores

    Cuando filtra el libro por estado "Críticas"
    Entonces el libro muestra solo los medidores "M-109, M-112"
    Y "M-109" aparece en estado "Crítica"

    Cuando busca el medidor "M-109"
    Entonces el libro muestra solo los medidores "M-109"
    Y la fila de "M-109" muestra:
      | dato       | valor         |
      | consumo    | 2.207,6 kWh   |
      | baseline   | 1.052,2 kWh   |
      | variación  | +109,8 %      |
      | severidad  | Alta          |
      | anomalía   | Anomalía real |

    Cuando abre el detalle de "M-109" desde el libro
    Entonces el encabezado de "M-109" muestra el estado "Crítica"
    Y las cifras clave de "M-109" son:
      | cifra                 | valor       |
      | Consumo actual · 24 h | 2.207,6 kWh |
      | Baseline diario       | 1.052,2 kWh |
      | Variación             | +109,8 %    |
      | Severidad             | Alta        |
    Y la API devuelve para M-109 las mismas cifras del README
    Y la orden de trabajo es "Orden 1 · Anomalía real · Investigar"
    Y la explicación de la orden dice "Consumo +110,5% frente al baseline durante 58 h (desde 12/09 14:00)"
    Y la confianza de la orden es "0,95 (Alta)"

    Cuando abre la investigación de "M-109"
    Entonces la acción recomendada empieza por "Investigar en sitio la instalación de M-109"
    Y la energía en juego es "+2.825,0 kWh"
    Y la duración del cambio es "58 h"
    Y la API confirma para "M-109" una ventana de 58 horas
