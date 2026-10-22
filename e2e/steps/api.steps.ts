import { expect } from '@playwright/test'
import type { DataTable } from 'playwright-bdd'
import { env } from '../config/env'
import { allMeterIds, m109 } from '../data/expected'
import { newAnonymousApi, type AnomalyDto, type GetAllBody, type MeterPageDto } from '../fixtures/api'
import type { APIResponse, TestInfo } from '@playwright/test'
import { Then, When, meterList, required, type ScenarioContext } from './fixtures'

interface SentRequest {
  method: 'GET' | 'POST'
  path: string
  data?: unknown
}

function trimmed(body: unknown): unknown {
  return JSON.parse(
    JSON.stringify(body ?? null, (key, value) => {
      if (key === 'hourly_history' && Array.isArray(value)) return `<${value.length} filas>`
      if (key === 'access_token' && typeof value === 'string') return `${value.slice(0, 20)}…`
      return value
    }),
  )
}

async function keep(ctx: ScenarioContext, testInfo: TestInfo, request: SentRequest, response: APIResponse) {
  ctx.path = request.path
  ctx.response = response
  ctx.body = (await response.json().catch(() => undefined)) as Record<string, unknown> | undefined
  await testInfo.attach(`${request.method} ${request.path}`, {
    contentType: 'application/json',
    body: JSON.stringify({ request: request.data ?? null, status: response.status(), response: trimmed(ctx.body) }, null, 2),
  })
}

const GET_ALL = '/api/v1/meter/getAll'
const getAllRequest = (data: GetAllBody): SentRequest => ({ method: 'POST', path: GET_ALL, data })

When('consulto el estado de salud de la API', async ({ ctx, $testInfo }) => {
  const anon = await newAnonymousApi()
  await keep(ctx, $testInfo, { method: 'GET', path: '/health' }, await anon.get('/health'))
  await anon.dispose()
})

When('inicio sesión en la API con las credenciales de demo', async ({ ctx, $testInfo }) => {
  const anon = await newAnonymousApi()
  const request: SentRequest = { method: 'POST', path: '/api/v1/auth/login', data: { email: env.email, password: env.password } }
  await keep(ctx, $testInfo, request, await anon.post(request.path, { data: request.data }))
  ctx.token = ctx.body?.access_token as string | undefined
  await anon.dispose()
})

When('consulto la lista de medidores sin token', async ({ ctx, $testInfo }) => {
  const anon = await newAnonymousApi()
  await keep(ctx, $testInfo, getAllRequest({}), await anon.post(GET_ALL, { data: {} }))
  await anon.dispose()
})

Then('recibo un token JWT de tipo {string}', async ({ ctx }, type: string) => {
  expect(ctx.body?.token_type).toBe(type)
  expect(required(ctx.token, 'el token').split('.')).toHaveLength(3)
})

Then('con ese token la API identifica al operador de demo', async ({ ctx }) => {
  const anon = await newAnonymousApi()
  const me = await anon.get('/api/v1/auth/me', { headers: { Authorization: `Bearer ${required(ctx.token, 'el token')}` } })
  expect(me.status()).toBe(200)
  expect(await me.json()).toMatchObject({ email: env.email })
  await anon.dispose()
})

Then('la API responde con código {int}', async ({ ctx }, status: number) => {
  expect(required(ctx.response, 'una respuesta').status()).toBe(status)
})

Then('el error tiene el formato común con código {int}', async ({ ctx }, status: number) => {
  expect(ctx.body).toMatchObject({ status_code: status, path: ctx.path })
})

Then('el mensaje de error es {string}', async ({ ctx }, message: string) => {
  expect(ctx.body).toMatchObject({ message })
})

Then('el error de validación dice {string}', async ({ ctx }, error: string) => {
  expect(ctx.body).toMatchObject({ status_code: 400, errors: [error] })
})

When('consulto todos los medidores', async ({ api, ctx, $testInfo }) => {
  const data: GetAllBody = { pagination: { page: 1, size: 100 } }
  await keep(ctx, $testInfo, getAllRequest(data), await api.getAll(data))
  ctx.meters = meterPage(ctx).rows
})

When('pido la página {int} con {int} medidores por página', async ({ api, ctx, $testInfo }, page: number, size: number) => {
  const data: GetAllBody = { pagination: { page, size } }
  await keep(ctx, $testInfo, getAllRequest(data), await api.getAll(data))
})

When('busco medidores con el texto {string}', async ({ api, ctx, $testInfo }, text: string) => {
  const data: GetAllBody = { pagination: { page: 1, size: 100 }, filter: { meter_id: text } }
  await keep(ctx, $testInfo, getAllRequest(data), await api.getAll(data))
})

When('filtro los medidores por estado {string}', async ({ api, ctx, $testInfo }, status: string) => {
  const data: GetAllBody = { pagination: { page: 1, size: 100 }, filter: { status } }
  await keep(ctx, $testInfo, getAllRequest(data), await api.getAll(data))
})

When('ordeno los medidores por {string}', async ({ api, ctx, $testInfo }, sortBy: string) => {
  const data: GetAllBody = { filter: { sort_by: sortBy } }
  await keep(ctx, $testInfo, getAllRequest(data), await api.getAll(data))
})

When('consulto el detalle del medidor {string}', async ({ api, ctx, $testInfo }, meterId: string) => {
  const path = `/api/v1/meter/getById/${meterId}`
  await keep(ctx, $testInfo, { method: 'GET', path }, await api.raw.get(path))
})

Then('el libro tiene los 12 medidores del dataset', async ({ ctx }) => {
  expect(required(ctx.meters, 'los medidores').map((m) => m.meter_id)).toEqual(allMeterIds)
})

Then('el estado del medidor {string} es {string}', async ({ ctx }, meterId: string, status: string) => {
  const meter = required(ctx.meters, 'los medidores').find((m) => m.meter_id === meterId)
  expect(meter?.status, `estado de ${meterId}`).toBe(status)
})

Then('estos medidores están en estado {string} y sin anomalía:', async ({ ctx }, status: string, table: DataTable) => {
  const meters = required(ctx.meters, 'los medidores')
  for (const [id] of table.raw()) {
    const meter = meters.find((m) => m.meter_id === id)
    expect.soft(meter?.status, id).toBe(status)
    expect.soft(meter?.anomaly_type ?? null, id).toBeNull()
  }
})

function meterPage(ctx: ScenarioContext): MeterPageDto {
  expect(required(ctx.response, 'una respuesta').status()).toBe(200)
  return ctx.body as unknown as MeterPageDto
}

Then('el resultado son los medidores {string}', async ({ ctx }, list: string) => {
  const page = meterPage(ctx)
  const expected = meterList(list)
  expect(page.rows.map((m) => m.meter_id)).toEqual(expected)
  expect(page.count).toBe(expected.length)
})

Then('la respuesta indica página {int}, tamaño {int} y total {int}', async ({ ctx }, page: number, size: number, count: number) => {
  expect(meterPage(ctx)).toMatchObject({ page, size, count })
})

Then('las filas son los medidores {string}', async ({ ctx }, list: string) => {
  expect(meterPage(ctx).rows.map((m) => m.meter_id)).toEqual(meterList(list))
})

Then('todas las filas tienen estado {string} y el total coincide', async ({ ctx }, status: string) => {
  const page = meterPage(ctx)
  expect(page.rows.length).toBeGreaterThan(0)
  expect(page.rows.every((m) => m.status === status)).toBe(true)
  expect(page.count).toBe(page.rows.length)
})

Then('la API devuelve para M-109 las mismas cifras del README', async ({ api }) => {
  const meter = (await api.meters()).find((m) => m.meter_id === m109.id)
  expect(meter).toMatchObject({
    status: 'CRITICAL',
    consumption_kwh: m109.api.consumptionKwh,
    baseline_kwh: m109.api.baselineKwh,
    anomaly_type: 'REAL_ANOMALY',
    severity: 'HIGH',
  })
  expect(meter?.variation_pct).toBeCloseTo(m109.api.variationPct, 2)
})

When('consulto las anomalías detectadas', async ({ api, ctx, $testInfo }) => {
  const path = '/api/v1/anomaly/getAll'
  await keep(ctx, $testInfo, { method: 'GET', path }, await api.raw.get(path))
  expect(required(ctx.response, 'una respuesta').status()).toBe(200)
  ctx.anomalies = ctx.body as unknown as AnomalyDto[]
})

Then('las anomalías están en este orden de prioridad:', async ({ ctx }, table: DataTable) => {
  const actual = required(ctx.anomalies, 'las anomalías').map((a) => ({ prioridad: String(a.priority), medidor: a.meter_id }))
  expect(actual).toEqual(table.hashes())
})

Then(
  'la anomalía de {string} es {string} con severidad {string}, prioridad {int} y confianza {float}',
  async ({ ctx }, meterId: string, type: string, severity: string, priority: number, confidence: number) => {
    const anomaly = required(ctx.anomalies, 'las anomalías').find((a) => a.meter_id === meterId)
    expect(anomaly, `anomalía de ${meterId}`).toMatchObject({ type, severity, priority, confidence })
  },
)

Then('la API confirma para {string} una ventana de {int} horas', async ({ api }, meterId: string, hours: number) => {
  expect((await api.anomaly(meterId)).evidence.change.hours).toBe(hours)
})

When('consulto el resumen del Despacho', async ({ api, ctx, $testInfo }) => {
  const path = '/api/v1/dashboard/getSummary'
  await keep(ctx, $testInfo, { method: 'GET', path }, await api.raw.get(path))
})

Then(
  'el resumen cuenta {int} normales, {int} en alerta y {int} críticos',
  async ({ ctx }, normal: number, alert: number, critical: number) => {
    expect(ctx.body?.status_counts).toEqual({ normal, alert, critical })
  },
)