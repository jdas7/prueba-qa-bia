import type { APIResponse } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import type { AnomalyDto, MeterSummaryDto } from '../fixtures/api'
import { test as base } from '../fixtures/test'

export interface ScenarioContext {
  response?: APIResponse
  body?: Record<string, unknown>
  path?: string
  token?: string
  meters?: MeterSummaryDto[]
  anomalies?: AnomalyDto[]
}

export const test = base.extend<{ ctx: ScenarioContext }>({
  ctx: async ({}, use) => use({}),
})

export const { Given, When, Then } = createBdd(test)

export function meterList(text: string): string[] {
  const value = text.trim()
  if (value === '' || value === 'ninguno') return []
  const range = /^M-(\d+) a M-(\d+)$/.exec(value)
  if (range) {
    const [from, to] = [Number(range[1]), Number(range[2])]
    return Array.from({ length: to - from + 1 }, (_, i) => `M-${from + i}`)
  }
  return value.split(',').map((id) => id.trim())
}

export function required<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Falta un paso previo que obtenga ${what}`)
  return value
}
