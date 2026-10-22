import { expect } from '@playwright/test'
import type { DataTable } from 'playwright-bdd'
import { env } from '../config/env'
import { plantTime } from '../data/plant-time'
import type { MeterDetailPage } from '../pages/MeterDetailPage'
import { Given, Then, When, meterList, test } from './fixtures'

type Section = 'Despacho' | 'Medidores' | 'Anomalías IA'
type StatusTab = 'Todos' | 'Normales' | 'Alertas' | 'Críticas'
type KeyFigure = Parameters<MeterDetailPage['keyFigure']>[1]

const statusParam: Record<StatusTab, string> = { Todos: '', Normales: 'NORMAL', Alertas: 'ALERT', Críticas: 'CRITICAL' }

Given('que el operador tiene la sesión iniciada', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible()
})

Then('está en el Despacho', async ({ dashboard }) => {
  await expect(dashboard.heading).toBeVisible()
})

Then('el estado de la planta cuenta {string}', async ({ dashboard }, text: string) => {
  await expect(dashboard.meterCounts()).toHaveText(text)
})

When('intenta entrar como el operador de demo con la clave {string}', async ({ loginPage }, password: string) => {
  await loginPage.goto()
  await loginPage.login(env.email, password)
})

When('intenta entrar sin escribir el email', async ({ loginPage }) => {
  await loginPage.goto()
  await loginPage.submit.click()
})

Then('el acceso avisa {string}', async ({ loginPage }, message: string) => {
  await expect(loginPage.error).toContainText(message)
})

Then('sigue en la pantalla de acceso', async ({ page, loginPage }) => {
  await expect(page).toHaveURL(/\/login$/)
  await expect(loginPage.submit).toBeVisible()
})

When('abre {string} sin haber iniciado sesión', async ({ page }, path: string) => {
  await page.goto(path)
})

When('abre {string} desde el menú principal', async ({ ledger }, section: string) => {
  await ledger.openSection(section as Section)
})

When('abre el libro de medidores', async ({ ledger }) => {
  await ledger.goto()
})

When('abre la página {int} del libro de medidores', async ({ page, ledger }, pageNumber: number) => {
  await page.goto(`/medidores?pagina=${pageNumber}`)
  await expect(ledger.heading).toBeVisible()
})

Then('ve el libro de medidores', async ({ ledger }) => {
  await expect(ledger.heading).toBeVisible()
})

When('filtra el libro por estado {string}', async ({ page, ledger }, tab: string) => {
  await ledger.filterByStatus(tab as StatusTab)
  await expect(page).toHaveURL(new RegExp(`estado=${statusParam[tab as StatusTab]}`))
})

When('busca el medidor {string}', async ({ page, ledger }, meterId: string) => {
  await ledger.search(meterId)
  await expect(page).toHaveURL(new RegExp(`medidor=${meterId}`))
})

Then('el libro muestra solo los medidores {string}', async ({ ledger }, list: string) => {
  expect(await ledger.visibleMeterIds()).toEqual(meterList(list))
})

When('abre el libro con la consulta {string}', async ({ ledger }, query: string) => {
  await ledger.gotoWithQuery(query)
})

When('ordena el libro por {string}', async ({ ledger }, label: string) => {
  await ledger.sortBy(label)
})

Then('la dirección contiene {string}', async ({ page }, fragment: string) => {
  await expect.poll(() => page.url()).toContain(fragment)
})

Then('{string} aparece en estado {string}', async ({ ledger }, meterId: string, status: string) => {
  await expect(ledger.row(meterId)).toContainText(status)
})

Then('la fila de {string} muestra:', async ({ ledger }, meterId: string, table: DataTable) => {
  const row = ledger.row(meterId)
  for (const { valor } of table.hashes()) {
    await expect(row).toContainText(valor)
  }
})

Then('la paginación indica {string}', async ({ ledger }, text: string) => {
  await expect(ledger.pagination).toContainText(text)
})

When('pasa a la página siguiente', async ({ page, ledger }) => {
  await expect(ledger.nextPage).toBeEnabled()
  await ledger.nextPage.click()
  await expect(page).toHaveURL(/pagina=2/)
})

Then('no hay página siguiente', async ({ ledger }) => {
  await expect(ledger.nextPage).toBeDisabled()
})

When('abre el detalle de {string} desde el libro', async ({ page, ledger, meterDetail }, meterId: string) => {
  await ledger.openMeter(meterId)
  await expect(page).toHaveURL(`/medidores/${meterId}`)
  await expect(meterDetail.heading(meterId)).toBeVisible()
})

When('abre directamente el detalle de {string}', async ({ meterDetail }, meterId: string) => {
  await meterDetail.goto(meterId)
  await expect(meterDetail.heading(meterId)).toBeVisible()
})

When('abre el detalle del medidor inexistente {string}', async ({ page, meterDetail }, meterId: string) => {
  await meterDetail.goto(meterId)
  await expect(page).toHaveURL(new RegExp(`/medidores/${meterId}$`))
})

Then('ve que no existe el medidor {string}', async ({ meterDetail }, meterId: string) => {
  await expect(meterDetail.missing(meterId)).toBeVisible()
})

When('vuelve al libro desde el detalle', async ({ meterDetail, ledger }) => {
  await meterDetail.backToLedger().click()
  await expect(ledger.heading).toBeVisible()
})

Then('el encabezado de {string} muestra el estado {string}', async ({ meterDetail }, meterId: string, status: string) => {
  await expect(meterDetail.header(meterId)).toContainText(status)
})

Then('las cifras clave de {string} son:', async ({ meterDetail }, meterId: string, table: DataTable) => {
  for (const { cifra, valor } of table.hashes()) {
    await expect(meterDetail.keyFigure(meterId, cifra as KeyFigure)).toContainText(valor)
  }
})

Then('la orden de trabajo es {string}', async ({ meterDetail }, name: string) => {
  await expect(meterDetail.workOrder()).toHaveAccessibleName(name)
})

Then('la explicación de la orden dice {string}', async ({ meterDetail }, text: string) => {
  await expect(meterDetail.workOrder()).toContainText(text)
})

Then('la confianza de la orden es {string}', async ({ meterDetail }, text: string) => {
  await expect(meterDetail.confidence()).toHaveAttribute('aria-valuetext', text)
})

When('abre la investigación de {string}', async ({ page, meterDetail, investigation }, meterId: string) => {
  await meterDetail.openInvestigation()
  await expect(page).toHaveURL(`/anomalias/${meterId}`)
  await expect(investigation.heading(meterId)).toBeVisible()
})

Then('la acción recomendada empieza por {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible()
})

Then('la energía en juego es {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: true })).toBeVisible()
})

Then('la duración del cambio es {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: true })).toBeVisible()
})

When('abre la lista de anomalías', async ({ anomaliesPage }) => {
  await anomaliesPage.goto()
})

Then('la columna {string} muestra la hora de planta que envía la API', async ({ anomaliesPage, api }, column: string) => {
  const fromApi = Object.fromEntries((await api.anomalies()).map((a) => [a.meter_id, plantTime(a.detected_at)]))
  expect(await anomaliesPage.column(column)).toEqual(fromApi)
})

Then('la última lectura de {string} es la que envía la API, sin convertir', async ({ meterDetail, api }, meterId: string) => {
  const meter = (await api.meters()).find((m) => m.meter_id === meterId)
  if (!meter) throw new Error(`La API no devuelve ${meterId}`)
  await expect(meterDetail.header(meterId)).toContainText(`Última lectura ${plantTime(meter.last_reading_at)} (hora de planta)`)
})

When('corre el análisis de IA', async ({ dashboard }) => {
  test.setTimeout(120_000)
  await dashboard.runAnalysis.click()
  await expect(dashboard.runAnalysis).toContainText('Analizando')
})

Then('el análisis termina con {int} pasos hechos y el resumen {string}', async ({ dashboard }, steps: number, summary: string) => {
  const sheet = dashboard.analysisSheet
  await expect(sheet.getByText('Hecho', { exact: true })).toHaveCount(steps, { timeout: 90_000 })
  await expect(sheet.getByRole('status')).toContainText(summary)
})
