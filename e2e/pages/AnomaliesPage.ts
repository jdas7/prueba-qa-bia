import { expect, type Locator, type Page } from '@playwright/test'
import { AppShell } from './AppShell'

/** Pantalla /anomalias: órdenes de trabajo ordenadas por prioridad. */
export class AnomaliesPage extends AppShell {
  readonly table: Locator

  constructor(page: Page) {
    super(page)
    this.table = page.getByRole('table', { name: 'Anomalías detectadas por la IA, ordenadas por prioridad' })
  }

  async goto() {
    await this.page.goto('/anomalias')
    await expect(this.table).toBeVisible()
  }

  rows(): Locator {
    return this.table.getByRole('row').filter({ has: this.page.getByRole('cell') })
  }

  row(meterId: string): Locator {
    return this.rows().filter({ hasText: meterId })
  }

  async column(column: string): Promise<Record<string, string>> {
    await expect(this.rows().first()).toBeVisible()
    const headers = (await this.table.getByRole('columnheader').allInnerTexts()).map((h) => h.trim())
    const index = headers.indexOf(column)
    const meterIndex = headers.indexOf('Medidor')
    if (index < 0 || meterIndex < 0) throw new Error(`Columnas no encontradas en ${headers.join(', ')}`)
    const result: Record<string, string> = {}
    for (const row of await this.rows().all()) {
      const cells = (await row.getByRole('cell').or(row.getByRole('rowheader')).allInnerTexts()).map((c) => c.trim())
      result[cells[meterIndex]] = cells[index]
    }
    return result
  }
}
