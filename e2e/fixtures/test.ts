import { test as base } from 'playwright-bdd'
import { AnomaliesPage } from '../pages/AnomaliesPage'
import { DashboardPage } from '../pages/DashboardPage'
import { InvestigationPage } from '../pages/InvestigationPage'
import { LoginPage } from '../pages/LoginPage'
import { MeterDetailPage } from '../pages/MeterDetailPage'
import { MeterLedgerPage } from '../pages/MeterLedgerPage'
import { EnergiaApi } from './api'

interface Pages {
  loginPage: LoginPage
  dashboard: DashboardPage
  ledger: MeterLedgerPage
  meterDetail: MeterDetailPage
  anomaliesPage: AnomaliesPage
  investigation: InvestigationPage
}

interface Workers {
  /** Cliente de API autenticado, un login por worker. */
  api: EnergiaApi
}

export const test = base.extend<Pages, Workers>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboard: async ({ page }, use) => use(new DashboardPage(page)),
  ledger: async ({ page }, use) => use(new MeterLedgerPage(page)),
  meterDetail: async ({ page }, use) => use(new MeterDetailPage(page)),
  anomaliesPage: async ({ page }, use) => use(new AnomaliesPage(page)),
  investigation: async ({ page }, use) => use(new InvestigationPage(page)),
  api: [
    async ({}, use) => {
      const api = await EnergiaApi.create()
      await use(api)
      await api.dispose()
    },
    { scope: 'worker' },
  ],
})

export { expect } from '@playwright/test'
