import { expect, request, type APIRequestContext } from '@playwright/test'
import { env } from '../config/env'

export interface MeterSummaryDto {
  meter_id: string
  status: string
  consumption_kwh: number
  baseline_kwh: number
  variation_pct: number
  anomaly_type?: string | null
  severity?: string | null
  last_reading_at: string
}

export interface MeterPageDto {
  page: number
  size: number
  count: number
  rows: MeterSummaryDto[]
}

export interface AnomalyDto {
  meter_id: string
  type: string
  severity: string
  priority: number
  confidence: number
  detected_at: string
  reason: string
  evidence: { last_day_kwh: number; baseline_daily_kwh: number; change: { hours: number } }
}

export interface GetAllBody {
  pagination?: { page?: number; size?: number }
  filter?: { meter_id?: string; status?: string; sort_by?: string; sort_order?: string }
}

/** Contexto de API sin sesión, apuntando al backend. */
export function newAnonymousApi(): Promise<APIRequestContext> {
  return request.newContext({ baseURL: env.apiUrl })
}

export async function loginToken(api: APIRequestContext): Promise<string> {
  const res = await api.post('/api/v1/auth/login', { data: { email: env.email, password: env.password } })
  expect(res.status(), 'login con las credenciales del README').toBe(200)
  const body = (await res.json()) as { access_token: string }
  return body.access_token
}

export class EnergiaApi {
  constructor(readonly raw: APIRequestContext) {}

  static async create(): Promise<EnergiaApi> {
    const anon = await newAnonymousApi()
    const token = await loginToken(anon)
    await anon.dispose()
    const raw = await request.newContext({
      baseURL: env.apiUrl,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    })
    return new EnergiaApi(raw)
  }

  getAll(body: GetAllBody) {
    return this.raw.post('/api/v1/meter/getAll', { data: body })
  }

  async getAllOk(body: GetAllBody): Promise<MeterPageDto> {
    const res = await this.getAll(body)
    expect(res.status(), `getAll ${JSON.stringify(body)}`).toBe(200)
    return (await res.json()) as MeterPageDto
  }

  async meters(): Promise<MeterSummaryDto[]> {
    return (await this.getAllOk({ pagination: { page: 1, size: 100 } })).rows
  }

  async anomalies(): Promise<AnomalyDto[]> {
    const res = await this.raw.get('/api/v1/anomaly/getAll')
    expect(res.status()).toBe(200)
    return (await res.json()) as AnomalyDto[]
  }

  async anomaly(meterId: string): Promise<AnomalyDto> {
    const found = (await this.anomalies()).find((a) => a.meter_id === meterId)
    if (!found) throw new Error(`La API no devuelve anomalía para ${meterId}`)
    return found
  }

  dispose() {
    return this.raw.dispose()
  }
}
