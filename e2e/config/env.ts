import path from 'node:path'

export const env = {
  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
  apiUrl: process.env.API_URL ?? 'http://localhost:8080',
  email: process.env.E2E_EMAIL ?? process.env.AUTH_EMAIL ?? 'admin@energia.local',
  password: process.env.E2E_PASSWORD ?? process.env.AUTH_PASSWORD ?? 'admin123',
  storageStatePath: path.join(import.meta.dirname, '..', '.auth', 'operator.json'),
}
