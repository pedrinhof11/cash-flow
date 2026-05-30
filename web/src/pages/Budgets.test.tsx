import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import Budgets from '../pages/Budgets'
import userEvent from '@testing-library/user-event'

describe('Página de Orçamentos', () => {
  it('renderiza o título da página', () => {
    render(<Budgets />, { initialEntries: ['/budgets'] })
    expect(screen.getByRole('heading', { name: /orçamentos/i })).toBeInTheDocument()
  })

  it('renderiza botão de novo orçamento', () => {
    render(<Budgets />, { initialEntries: ['/budgets'] })
    expect(screen.getByRole('button', { name: /novo orçamento/i })).toBeInTheDocument()
  })

  it('exibe itens de orçamento', async () => {
    render(<Budgets />, { initialEntries: ['/budgets'] })
    expect(await screen.findByText(/alimentação/i)).toBeInTheDocument()
  })

  it('mostra limite do orçamento', async () => {
    render(<Budgets />, { initialEntries: ['/budgets'] })
    expect(await screen.findByText(/limite:/i)).toBeInTheDocument()
  })

  it('mostra status dentro do limite', async () => {
    render(<Budgets />, { initialEntries: ['/budgets'] })
    expect(await screen.findByText(/dentro do limite/i)).toBeInTheDocument()
  })

  it('mostra porcentagem utilizada', async () => {
    render(<Budgets />, { initialEntries: ['/budgets'] })
    expect(await screen.findByText('30%')).toBeInTheDocument()
  })

  it('abre modal de novo orçamento', async () => {
    const user = userEvent.setup()
    render(<Budgets />, { initialEntries: ['/budgets'] })
    await user.click(screen.getByRole('button', { name: /novo orçamento/i }))
    expect(await screen.findByRole('heading', { name: /novo orçamento/i })).toBeInTheDocument()
  })

  it('mostra seleção de período no modal', async () => {
    const user = userEvent.setup()
    render(<Budgets />, { initialEntries: ['/budgets'] })
    await user.click(screen.getByRole('button', { name: /novo orçamento/i }))
    await screen.findByRole('heading', { name: /novo orçamento/i })
    expect(screen.getByText(/mensal/i)).toBeInTheDocument()
    expect(screen.getByText(/semanal/i)).toBeInTheDocument()
    expect(screen.getByText(/anual/i)).toBeInTheDocument()
  })
})
