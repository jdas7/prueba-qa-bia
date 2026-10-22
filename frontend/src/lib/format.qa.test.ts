import { formatPlantDay, formatPlantTime } from './format'

// QA · DEF-02. vite.config.ts fija TZ=UTC para los tests, y en UTC leer la hora
// local o la UTC da lo mismo: por eso format.test.ts pasa con el bug. Aquí se
// fija la zona de los operadores. `it.fails` pasa mientras el defecto exista;
// cuando se corrija, este test fallará y hay que cambiarlo a `it`.
describe('hora de planta con el navegador en America/Bogota', () => {
  beforeAll(() => {
    vi.stubEnv('TZ', 'America/Bogota')
  })
  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it('la zona de prueba quedó aplicada', () => {
    expect(new Date('2026-09-12T14:00:00Z').getHours()).toBe(9)
  })

  it.fails('14:00 de planta sigue siendo 14:00', () => {
    expect(formatPlantTime('2026-09-12T14:00:00Z')).toBe('12/09 14:00')
  })

  it.fails('medianoche de planta no cambia de día', () => {
    expect(formatPlantTime('2026-09-13T00:00:00Z')).toBe('13/09 00:00')
  })

  it('el día de planta ya usa partes UTC y no cambia', () => {
    expect(formatPlantDay('2026-09-13T00:00:00Z')).toBe('13/09')
  })
})
