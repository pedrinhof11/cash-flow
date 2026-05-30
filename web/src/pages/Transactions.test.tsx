import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import Transactions from '../pages/Transactions'
import userEvent from '@testing-library/user-event'

describe('Página de Transações', () => {
  it('renderiza o título da página', () => {
    render(<Transactions />, { initialEntries: ['/transactions'] })
    expect(screen.getByRole('heading', { name: /transações/i })).toBeInTheDocument()
  })

  it('renderiza botão de nova transação', () => {
    render(<Transactions />, { initialEntries: ['/transactions'] })
    expect(screen.getByRole('button', { name: /nova transação/i })).toBeInTheDocument()
  })

  it('exibe lista de transações', async () => {
    render(<Transactions />, { initialEntries: ['/transactions'] })
    expect(await screen.findByText(/salário mensal/i)).toBeInTheDocument()
    expect(screen.getByText(/mercado/i)).toBeInTheDocument()
  })

  it('mostra transação de receita com sinal positivo', async () => {
    render(<Transactions />, { initialEntries: ['/transactions'] })
    expect(await screen.findByText('R$ 5.000,00')).toBeInTheDocument()
  })

  it('mostra transação de despesa', async () => {
    render(<Transactions />, { initialEntries: ['/transactions'] })
    expect(await screen.findByText('R$ 150,00')).toBeInTheDocument()
  })

  it('abre modal de nova transação', async () => {
    const user = userEvent.setup()
    render(<Transactions />, { initialEntries: ['/transactions'] })
    await user.click(screen.getByRole('button', { name: /nova transação/i }))
    expect(await screen.findByRole('heading', { name: /nova transação/i })).toBeInTheDocument()
  })

  it('mostra seleção de conta no modal', async () => {
    const user = userEvent.setup()
    render(<Transactions />, { initialEntries: ['/transactions'] })
    await user.click(screen.getByRole('button', { name: /nova transação/i }))
    expect(await screen.findByText(/selecionar conta/i)).toBeInTheDocument()
  })

  it('mostra seleção de categoria no modal', async () => {
    const user = userEvent.setup()
    render(<Transactions />, { initialEntries: ['/transactions'] })
    await user.click(screen.getByRole('button', { name: /nova transação/i }))
    expect(await screen.findByText(/selecionar categoria/i)).toBeInTheDocument()
  })

  it('tem botões de receita e despesa', async () => {
    const user = userEvent.setup()
    render(<Transactions />, { initialEntries: ['/transactions'] })
    await user.click(screen.getByRole('button', { name: /nova transação/i }))
    expect(await screen.findByRole('button', { name: /receita/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /despesa/i })).toBeInTheDocument()
  })
})
