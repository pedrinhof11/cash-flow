import api from '../lib/api'
import type { RecurringTransaction } from '../types'

export const recurringService = {
  list: async (params?: { type?: string; frequency?: string; active_only?: boolean }) => {
    const { data } = await api.get<{ recurring_transactions: RecurringTransaction[] }>('/recurring', { params })
    return data
  },
  create: async (payload: {
    account_id: number
    category_id?: number
    type: string
    amount: number
    description?: string
    frequency: string
    day_of_month?: number
    start_date: string
    end_date?: string
    occurrences?: number
  }) => {
    const { data } = await api.post<{ recurring_transaction: RecurringTransaction }>('/recurring', payload)
    return data
  },
  update: async (id: number, payload: Partial<RecurringTransaction>) => {
    const { data } = await api.put<{ recurring_transaction: RecurringTransaction }>(`/recurring/${id}`, payload)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete<{ message: string }>(`/recurring/${id}`)
    return data
  },
  skip: async (id: number) => {
    const { data } = await api.post<{ message: string; next_due: string }>(`/recurring/${id}/skip`)
    return data
  },
}
