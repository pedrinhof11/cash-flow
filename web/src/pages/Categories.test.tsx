import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import Categories from '../pages/Categories'
import userEvent from '@testing-library/user-event'

describe('Página de Categorias', () => {
  it('renderiza o título da página', () => {
    render(<Categories />, { initialEntries: ['/categories'] })
    expect(screen.getByRole('heading', { name: /categorias/i })).toBeInTheDocument()
  })

  it('renderiza botão de nova categoria', () => {
    render(<Categories />, { initialEntries: ['/categories'] })
    expect(screen.getByRole('button', { name: /nova categoria/i })).toBeInTheDocument()
  })

  it('exibe seção de receitas', async () => {
    render(<Categories />, { initialEntries: ['/categories'] })
    expect(await screen.findByText(/receitas/i)).toBeInTheDocument()
    expect(screen.getByText(/salário/i)).toBeInTheDocument()
  })

  it('exibe seção de despesas', async () => {
    render(<Categories />, { initialEntries: ['/categories'] })
    expect(await screen.findByText(/despesas/i)).toBeInTheDocument()
    expect(screen.getByText(/alimentação/i)).toBeInTheDocument()
    expect(screen.getByText(/transporte/i)).toBeInTheDocument()
  })

  it('mostra contagem de categorias nos cabeçalhos', async () => {
    render(<Categories />, { initialEntries: ['/categories'] })
    expect(await screen.findByText(/receitas \(1\)/i)).toBeInTheDocument()
    expect(screen.getByText(/despesas \(2\)/i)).toBeInTheDocument()
  })

  it('abre modal de nova categoria', async () => {
    const user = userEvent.setup()
    render(<Categories />, { initialEntries: ['/categories'] })
    await user.click(screen.getByRole('button', { name: /nova categoria/i }))
    expect(await screen.findByRole('heading', { name: /nova categoria/i })).toBeInTheDocument()
  })

  it('tem botões de receita e despesa no modal', async () => {
    const user = userEvent.setup()
    render(<Categories />, { initialEntries: ['/categories'] })
    await user.click(screen.getByRole('button', { name: /nova categoria/i }))
    await screen.findByRole('heading', { name: /nova categoria/i })
    expect(screen.getByRole('button', { name: /receita/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /despesa/i })).toBeInTheDocument()
  })
})
