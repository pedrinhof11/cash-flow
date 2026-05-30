import api from '../lib/api'
import type { Transaction, TransactionsSummary, PaginatedResponse } from '../types'

export const transactionService = {
  list: async (params?: {
    type?: string
    account_id?: number
    category_id?: number
    start_date?: string
    end_date?: string
    search?: string
    per_page?: number
    page?: number
  }) => {
    const { data } = await api.get<PaginatedResponse<Transaction>>('/transactions', { params })
    return data
  },
  create: async (payload: {
    account_id: number
    category_id?: number
    type: string
    amount: number
    description?: string
    date: string
  }) => {
    const { data } = await api.post<{ transaction: Transaction }>('/transactions', payload)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete<{ message: string }>(`/transactions/${id}`)
    return data
  },
  summary: async (params?: { start_date?: string; end_date?: string }) => {
    const { data } = await api.get<TransactionsSummary>('/transactions/summary', { params })
    return data
  },
}
