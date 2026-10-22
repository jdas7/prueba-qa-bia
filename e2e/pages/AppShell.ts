import type { Locator, Page } from '@playwright/test'

/** Navegación principal, común a todas las pantallas autenticadas. */
export class AppShell {
  readonly nav: Locator
  readonly logoutButton: Locator
  readonly runAnalysis: Locator
  readonly analysisSheet: Locator

  constructor(protected readonly page: Page) {
    this.nav = page.getByRole('navigation', { name: 'Principal' })
    this.logoutButton = page.getByRole('button', { name: 'Cerrar sesión' })
    this.runAnalysis = page.getByRole('button', { name: /Run AI Analysis|Analizando/ })
    this.analysisSheet = page.getByRole('region', { name: /Análisis de IA/ })
  }

  async openSection(name: 'Despacho' | 'Medidores' | 'Anomalías IA') {
    await this.nav.getByRole('link', { name, exact: true }).click()
  }

  async logout() {
    await this.logoutButton.click()
  }
}
