import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import Accounts from '../pages/Accounts'
import userEvent from '@testing-library/user-event'

describe('Página de Contas', () => {
  it('renderiza o título da página', () => {
    render(<Accounts />, { initialEntries: ['/accounts'] })
    expect(screen.getByRole('heading', { name: /contas/i })).toBeInTheDocument()
  })

  it('renderiza botão de nova conta', () => {
    render(<Accounts />, { initialEntries: ['/accounts'] })
    expect(screen.getByRole('button', { name: /nova conta/i })).toBeInTheDocument()
  })

  it('exibe cartões de conta', async () => {
    render(<Accounts />, { initialEntries: ['/accounts'] })
    expect(await screen.findByText('Conta Corrente')).toBeInTheDocument()
    expect(screen.getByText('Dinheiro', { selector: 'h3' })).toBeInTheDocument()
  })

  it('mostra saldos das contas', async () => {
    render(<Accounts />, { initialEntries: ['/accounts'] })
    expect(await screen.findByText('R$ 1.500,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 200,00')).toBeInTheDocument()
  })

  it('mostra saldo total no cabeçalho', async () => {
    render(<Accounts />, { initialEntries: ['/accounts'] })
    expect(await screen.findByText(/1\.700/i)).toBeInTheDocument()
  })

  it('abre modal de nova conta', async () => {
    const user = userEvent.setup()
    render(<Accounts />, { initialEntries: ['/accounts'] })
    await user.click(screen.getByRole('button', { name: /nova conta/i }))
    expect(await screen.findByRole('heading', { name: /nova conta/i })).toBeInTheDocument()
  })

  it('mostra seleção de tipo no modal', async () => {
    const user = userEvent.setup()
    render(<Accounts />, { initialEntries: ['/accounts'] })
    await user.click(screen.getByRole('button', { name: /nova conta/i }))
    await screen.findByRole('heading', { name: /nova conta/i })
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })
})
