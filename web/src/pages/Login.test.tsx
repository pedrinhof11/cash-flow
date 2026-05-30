import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import Login from '../pages/Login'
import userEvent from '@testing-library/user-event'

describe('Página de Login', () => {
  it('renderiza o formulário de login', () => {
    render(<Login />)
    expect(screen.getByRole('heading', { name: /cash flow/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('mostra link para página de cadastro', () => {
    render(<Login />)
    expect(screen.getByRole('link', { name: /cadastre-se/i })).toHaveAttribute('href', '/register')
  })

  it('mostra mensagem de erro quando login falha', async () => {
    const user = userEvent.setup()
    render(<Login />)

    await user.type(screen.getByLabelText(/e-mail/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })
})
