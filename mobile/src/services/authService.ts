import api from '../lib/api'
import type { AuthResponse, User } from '../types'

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    return data
  },
  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
      password_confirmation,
    })
    return data
  },
  logout: async () => {
    const { data } = await api.post<{ message: string }>('/auth/logout')
    return data
  },
  me: async () => {
    const { data } = await api.get<{ user: User | null }>('/auth/me')
    return data
  },
}
