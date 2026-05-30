import api from '../lib/api'
import type { Category } from '../types'

export const categoryService = {
  list: async (params?: { type?: string; parent_id?: number }) => {
    const { data } = await api.get<{ categories: Category[] }>('/categories', { params })
    return data
  },
  create: async (payload: { name: string; type: string }) => {
    const { data } = await api.post<{ category: Category }>('/categories', payload)
    return data
  },
  delete: async (id: number) => {
    const { data } = await api.delete<{ message: string }>(`/categories/${id}`)
    return data
  },
}
