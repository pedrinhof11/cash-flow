import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TestApp } from './App'
import { useAuthStore } from './store/authStore'
import { http, HttpResponse } from 'msw'
import { server } from './test/mocks/handlers'

describe('Roteamento do App', () => {
  it('mostra página de login quando não autenticado na raiz', () => {
    server.use(
      http.get('/api/auth/me', () => HttpResponse.json({ user: null })),
    )
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false })
    render(
      <MemoryRouter initialEntries={['/']}>
        <TestApp />
      </MemoryRouter>,
    )
    expect(screen.getByText(/acesse sua conta/i)).toBeInTheDocument()
  })

  it('mostra página de login ao navegar para /login', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false })
    render(
      <MemoryRouter initialEntries={['/login']}>
        <TestApp />
      </MemoryRouter>,
    )
    expect(screen.getByText(/acesse sua conta/i)).toBeInTheDocument()
  })

  it('mostra página de cadastro ao navegar para /register', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false })
    render(
      <MemoryRouter initialEntries={['/register']}>
        <TestApp />
      </MemoryRouter>,
    )
    expect(screen.getByText(/crie sua conta/i)).toBeInTheDocument()
  })
})
