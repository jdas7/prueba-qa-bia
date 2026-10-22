import { expect, type Locator, type Page } from '@playwright/test'
import { AppShell } from './AppShell'

/** Pantalla / (Despacho): órdenes y el estado de la planta. */
export class DashboardPage extends AppShell {
  readonly heading: Locator
  readonly plantStatus: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { level: 1, name: 'Despacho' })
    this.plantStatus = page.getByRole('region', { name: 'Estado de la planta' })
  }

  async goto() {
    await this.page.goto('/')
    await expect(this.heading).toBeVisible()
  }

  /** Nota bajo "Medidores": "8 normales · 2 alerta · 2 críticas". */
  meterCounts(): Locator {
    return this.plantStatus.getByText(/normales · .* alerta · .* críticas/)
  }
}
