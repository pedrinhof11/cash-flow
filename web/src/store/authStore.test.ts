import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import type { User } from '../types'

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true })
  })

  it('inicializa com usuário nulo', () => {
    const store = useAuthStore.getState()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isLoading).toBe(true)
  })

  it('define usuário e autenticação corretamente', () => {
    const { setUser } = useAuthStore.getState()
    setUser(mockUser)

    const store = useAuthStore.getState()
    expect(store.user).toEqual(mockUser)
    expect(store.isAuthenticated).toBe(true)
  })

  it('define usuário como nulo ao desautenticar', () => {
    const { setUser } = useAuthStore.getState()
    setUser(mockUser)
    setUser(null)

    const store = useAuthStore.getState()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('limpa autenticação no logout', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true })
    const { logout } = useAuthStore.getState()
    logout()

    const store = useAuthStore.getState()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('controla estado de loading', () => {
    const { setLoading } = useAuthStore.getState()
    setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
    setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
  })
})
