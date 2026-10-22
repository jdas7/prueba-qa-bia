/**
 * Formatea un timestamp de la API como hora de planta ("12/09 14:00") leyendo
 * el texto tal cual, sin pasar por Date: así no depende de la zona
 * horaria del runner.
 */
export function plantTime(iso: string): string {
  const [, month, day, hour, minute] = /^\d{4}-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso) ?? []
  if (!minute) throw new Error(`Timestamp inesperado: ${iso}`)
  return `${day}/${month} ${hour}:${minute}`
}
