export type MeterStatus = 'NORMAL' | 'ALERT' | 'CRITICAL'
export type AnomalyType = 'REAL_ANOMALY' | 'EXPLAINABLE_ANOMALY' | 'FALSE_POSITIVE' | 'DATA_QUALITY'
export type Severity = 'HIGH' | 'MEDIUM' | 'LOW'

export interface ExpectedAnomaly {
  meterId: string
  priority: number
  type: AnomalyType
  severity: Severity
  confidence: number
  status: MeterStatus
  actionLabel: string
}

export const anomalies: ExpectedAnomaly[] = [
  { meterId: 'M-109', priority: 1, type: 'REAL_ANOMALY', severity: 'HIGH', confidence: 0.95, status: 'CRITICAL', actionLabel: 'Investigar' },
  { meterId: 'M-112', priority: 2, type: 'DATA_QUALITY', severity: 'HIGH', confidence: 0.95, status: 'CRITICAL', actionLabel: 'Validar medidor' },
  { meterId: 'M-104', priority: 3, type: 'EXPLAINABLE_ANOMALY', severity: 'MEDIUM', confidence: 0.86, status: 'ALERT', actionLabel: 'Validar operación' },
  { meterId: 'M-106', priority: 4, type: 'FALSE_POSITIVE', severity: 'LOW', confidence: 0.86, status: 'NORMAL', actionLabel: 'No escalar' },
]

export const normalMeters = ['M-101', 'M-102', 'M-103', 'M-105', 'M-107', 'M-108', 'M-110', 'M-111']
export const allMeterIds = Array.from({ length: 12 }, (_, i) => `M-${101 + i}`)

export const statusCounts = { normal: 9, alert: 1, critical: 2 }

export const m109 = {
  id: 'M-109',
  api: {
    consumptionKwh: 2207.6,
    baselineKwh: 1052.15,
    variationPct: 109.82,
    detectedAt: '2026-09-12T14:00:00Z',
    windowHours: 58,
  },
}
