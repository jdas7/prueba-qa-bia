import { render, screen } from '@testing-library/react'
import { Pagination } from './Pagination'

// QA · DEF-03. `it.fails` pasa mientras el defecto exista; cuando se corrija,
// este test fallará y hay que cambiarlo a `it`.
describe('paginación del libro de medidores', () => {
  it.fails('con 12 medidores y 10 por página, "Siguiente" está habilitado en la página 1', () => {
    render(<Pagination page={1} size={10} count={12} onPage={() => {}} />)
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeEnabled()
  })

  it('en la última página "Siguiente" está deshabilitado', () => {
    render(<Pagination page={2} size={10} count={12} onPage={() => {}} />)
    expect(screen.getByText('11–12')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled()
  })

  it('con un múltiplo exacto (20 de 10) hay 2 páginas', () => {
    render(<Pagination page={1} size={10} count={20} onPage={() => {}} />)
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeEnabled()
  })

  it('sin resultados muestra 0–0 y no deja avanzar', () => {
    render(<Pagination page={1} size={10} count={0} onPage={() => {}} />)
    expect(screen.getByText('0–0')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled()
  })
})
