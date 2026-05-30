import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import Register from '../pages/Register'
import userEvent from '@testing-library/user-event'

describe('Página de Cadastro', () => {
  it('renderiza o formulário de cadastro', () => {
    render(<Register />)
    expect(screen.getByRole('heading', { name: /cash flow/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument()
  })

  it('mostra link para página de login', () => {
    render(<Register />)
    expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/login')
  })

  it('mostra erro quando senhas não coincidem', async () => {
    const user = userEvent.setup()
    render(<Register />)

    await user.type(screen.getByLabelText(/nome/i), 'Test User')
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'different')
    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(await screen.findByText(/as senhas não coincidem/i)).toBeInTheDocument()
  })

  it('submete formulário com dados válidos', async () => {
    const user = userEvent.setup()
    render(<Register />)

    await user.type(screen.getByLabelText(/nome/i), 'New User')
    await user.type(screen.getByLabelText(/e-mail/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /cadastrar/i }))
  })
})
