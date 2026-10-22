import { defineConfig, devices } from '@playwright/test'
import { cucumberReporter, defineBddConfig } from 'playwright-bdd'
import { env } from './config/env'

const OPERATOR_TIMEZONE = 'America/Bogota'

const bdd = { language: 'es', steps: 'steps/**/*.ts', featuresRoot: 'features' }

const apiTests = defineBddConfig({ ...bdd, features: 'features/api/**/*.feature', outputDir: '.features-gen/api' })
const uiTests = defineBddConfig({
  ...bdd,
  features: 'features/ui/**/*.feature',
  outputDir: '.features-gen/ui',
  tags: 'not @utc',
})

const uiUtcTests = defineBddConfig({
  ...bdd,
  features: 'features/ui/**/*.feature',
  outputDir: '.features-gen/ui-utc',
  tags: '@utc',
})

const desktopViewport = { viewport: { width: 1440, height: 900 } }
const desktop = { ...desktopViewport, storageState: env.storageStatePath }

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    cucumberReporter('html', {
      outputFile: '../qa/evidencias/index.html',
      skipAttachments: ['video/webm', 'application/zip'],
    }),
  ],
  expect: { timeout: 10_000 },
  use: {
    baseURL: env.baseUrl,
    locale: 'es-CO',
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testDir: './setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'api',
      testDir: apiTests,
    },
    {
      name: 'chromium',
      testDir: uiTests,
      grepInvert: /@anon/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], ...desktop, timezoneId: OPERATOR_TIMEZONE },
    },
    {
      name: 'firefox',
      testDir: uiTests,
      grepInvert: /@anon|@mutate/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], ...desktop, timezoneId: OPERATOR_TIMEZONE },
    },
    {
      name: 'chromium-utc',
      testDir: uiUtcTests,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], ...desktop, timezoneId: 'UTC' },
    },
    {
      name: 'chromium-anon',
      testDir: uiTests,
      grep: /@anon/,
      use: { ...devices['Desktop Chrome'], ...desktopViewport, timezoneId: OPERATOR_TIMEZONE },
    },
  ],
})
