import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import Dashboard from '../pages/Dashboard'

describe('Página Visão Geral', () => {
  it('renderiza o título da página', () => {
    render(<Dashboard />, { initialEntries: ['/dashboard'] })
    expect(screen.getByRole('heading', { name: /visão geral/i })).toBeInTheDocument()
  })

  it('renderiza cards de resumo', () => {
    render(<Dashboard />, { initialEntries: ['/dashboard'] })
    expect(screen.getByText('Saldo Total')).toBeInTheDocument()
    expect(screen.getByText('Receitas')).toBeInTheDocument()
    expect(screen.getByText('Despesas')).toBeInTheDocument()
    expect(screen.getByText('Contas')).toBeInTheDocument()
  })

  it('exibe quantidade de contas', async () => {
    render(<Dashboard />, { initialEntries: ['/dashboard'] })
    const countEl = await screen.findByText('2', { exact: true })
    expect(countEl).toBeInTheDocument()
  })

  it('exibe valor de receita', async () => {
    render(<Dashboard />, { initialEntries: ['/dashboard'] })
    expect(await screen.findByText('R$ 5.000,00')).toBeInTheDocument()
  })

  it('exibe valor de despesa', async () => {
    render(<Dashboard />, { initialEntries: ['/dashboard'] })
    expect(await screen.findByText('R$ 150,00')).toBeInTheDocument()
  })

  it('mostra transações recentes', async () => {
    render(<Dashboard />, { initialEntries: ['/dashboard'] })
    expect(await screen.findByText(/salário mensal/i)).toBeInTheDocument()
    expect(screen.getByText(/mercado/i)).toBeInTheDocument()
  })

  it('mostra seção do gráfico', () => {
    render(<Dashboard />, { initialEntries: ['/dashboard'] })
    expect(screen.getByText(/receitas vs despesas/i)).toBeInTheDocument()
  })
})
