import api from '../lib/api'
import type { Account } from '../types'

export const accountService = {
  list: async (params?: { type?: string; active_only?: boolean }) => {
    const { data } = await api.get<{ accounts: Account[] }>('/accounts', { params })
    return data
  },
  get: async (id: number) => {
    const { data } = await api.get<{ account: Account }>(`/accounts/${id}`)
    return data
  },
  create: async (payload: { name: string; type: string; initial_balance?: number; currency?: string }) => {
    const { data } = await api.post<{ account: Account }>('/accounts', payload)
    return data
  },
  update: async (id: number, payload: Partial<Account>) => {
    const { data } = await api.put<{ account: Account }>(`/accounts/${id}`, payload)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete<{ message: string }>(`/accounts/${id}`)
    return data
  },
}
