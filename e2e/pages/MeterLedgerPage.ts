import { expect, type Locator, type Page } from '@playwright/test'
import { AppShell } from './AppShell'

type StatusTab = 'Todos' | 'Normales' | 'Alertas' | 'Críticas'

/** Pantalla /medidores: filtros, libro de medidores y paginación. */
export class MeterLedgerPage extends AppShell {
  readonly heading: Locator
  readonly statusFilter: Locator
  readonly searchBox: Locator
  readonly searchButton: Locator
  readonly table: Locator
  readonly pagination: Locator
  readonly nextPage: Locator
  readonly previousPage: Locator
  readonly sortBySelect: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    super(page)
    this.heading = page.getByRole('heading', { level: 1, name: 'Libro de medidores' })
    this.statusFilter = page.getByRole('group', { name: 'Estado' })
    const search = page.getByRole('search')
    this.searchBox = search.getByRole('combobox', { name: 'Medidor' })
    this.searchButton = search.getByRole('button', { name: 'Buscar medidor' })
    this.table = page.getByRole('table', { name: 'Medidores filtrados' })
    this.pagination = page.getByRole('navigation', { name: 'Paginación' })
    this.nextPage = this.pagination.getByRole('button', { name: 'Siguiente' })
    this.previousPage = this.pagination.getByRole('button', { name: 'Anterior' })
    this.sortBySelect = page.getByLabel('Ordenar por')
    this.emptyState = page.getByText('Ningún medidor coincide con los filtros', { exact: true })
  }

  async goto() {
    await this.page.goto('/medidores')
    await expect(this.heading).toBeVisible()
  }

  async gotoWithQuery(query: string) {
    await this.page.goto(`/medidores?${query}`)
    await expect(this.heading).toBeVisible()
  }

  async sortBy(label: string) {
    await this.sortBySelect.selectOption({ label })
  }

  async filterByStatus(tab: StatusTab) {
    await this.statusFilter.getByText(tab, { exact: true }).click()
    await expect(this.statusFilter.getByRole('radio', { name: tab })).toBeChecked()
  }

  async search(meterId: string) {
    await this.searchBox.fill(meterId)
    await this.searchButton.click()
  }

  row(meterId: string): Locator {
    return this.table.getByRole('row').filter({ has: this.page.getByRole('link', { name: meterId, exact: true }) })
  }

  async visibleMeterIds(): Promise<string[]> {
    const ready = this.table.getByRole('rowheader').first().or(this.emptyState)
    await expect(ready).toBeVisible()
    if (await this.emptyState.isVisible()) return []
    const ids = await this.table.getByRole('rowheader').allInnerTexts()
    return ids.map((id) => id.trim())
  }

  async openMeter(meterId: string) {
    await this.row(meterId).getByRole('link', { name: meterId, exact: true }).click()
  }
}
