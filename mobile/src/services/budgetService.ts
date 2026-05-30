import api from '../lib/api'
import type { Budget, BudgetCurrent } from '../types'

export const budgetService = {
  list: async (params?: { category_id?: number; period?: string; current?: boolean }) => {
    const { data } = await api.get<{ budgets: Budget[] }>('/budgets', { params })
    return data
  },
  current: async () => {
    const { data } = await api.get<{ budgets: BudgetCurrent[] }>('/budgets/current')
    return data
  },
  create: async (payload: {
    category_id: number
    amount: number
    period: string
    start_date: string
    end_date?: string
  }) => {
    const { data } = await api.post<{ budget: Budget }>('/budgets', payload)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete<{ message: string }>(`/budgets/${id}`)
    return data
  },
}
