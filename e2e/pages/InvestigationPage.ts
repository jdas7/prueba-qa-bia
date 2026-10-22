import type { Locator, Page } from '@playwright/test'
import { AppShell } from './AppShell'

/** Pantalla /anomalias/:id: la orden de trabajo de la IA para un medidor. */
export class InvestigationPage extends AppShell {
  constructor(page: Page) {
    super(page)
  }

  heading(meterId: string): Locator {
    return this.page.getByRole('heading', { level: 1, name: meterId, exact: true })
  }

  section(name: string): Locator {
    return this.page.getByRole('region', { name })
  }
}
