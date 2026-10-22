import type { Locator, Page } from '@playwright/test'
import { AppShell } from './AppShell'

type KeyFigure = 'Consumo actual · 24 h' | 'Baseline diario' | 'Variación' | 'Severidad'

/** Pantalla /medidores/:id: encabezado con las 4 cifras clave y la orden de trabajo. */
export class MeterDetailPage extends AppShell {
  constructor(page: Page) {
    super(page)
  }

  async goto(meterId: string) {
    await this.page.goto(`/medidores/${meterId}`)
  }

  header(meterId: string): Locator {
    return this.page.getByRole('region', { name: meterId, exact: true })
  }

  heading(meterId: string): Locator {
    return this.page.getByRole('heading', { level: 1, name: meterId, exact: true })
  }

  keyFigure(meterId: string, label: KeyFigure): Locator {
    return this.header(meterId)
      .locator('div')
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .last()
  }

  workOrder(): Locator {
    return this.page.getByRole('region', { name: /^Orden \d/ })
  }

  confidence(): Locator {
    return this.workOrder().getByRole('meter')
  }

  async openInvestigation() {
    await this.workOrder().getByRole('link', { name: 'Abrir investigación' }).click()
  }

  missing(meterId: string): Locator {
    return this.page.getByRole('heading', { level: 1, name: `No existe el medidor ${meterId}` })
  }

  backToLedger(): Locator {
    return this.page.getByRole('link', { name: 'Ir al libro de medidores' })
  }
}
