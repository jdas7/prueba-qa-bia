import { env } from '../config/env'
import { test as setup } from '../fixtures/test'

// Login por la UI una sola vez; los proyectos de UI reutilizan la sesión (JWT en localStorage).
setup('iniciar sesión como operador', async ({ page, loginPage }) => {
  await loginPage.goto()
  await loginPage.login(env.email, env.password)
  await loginPage.expectLoggedIn()
  await page.context().storageState({ path: env.storageStatePath })
})
