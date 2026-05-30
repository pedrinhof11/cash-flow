import api, { getCsrfCookie } from '../lib/api'
import type { User, Account, Category, Transaction, Budget, RecurringTransaction, TransactionsSummary, BudgetCurrent, Debt, DebtSimulationResult } from '../types'

export const authService = {
  async register(name: string, email: string, password: string, password_confirmation: string) {
    await getCsrfCookie()
    const { data } = await api.post<{ user: User }>('/auth/register', { name, email, password, password_confirmation })
    return data
  },
  async login(email: string, password: string) {
    await getCsrfCookie()
    const { data } = await api.post<{ user: User }>('/auth/login', { email, password })
    return data
  },
  async logout() {
    await api.post('/auth/logout')
  },
  async me() {
    const { data } = await api.get<{ user: User | null }>('/auth/me')
    return data.user
  },
}

export const accountService = {
  list: () => api.get<Account[]>('/accounts').then((r) => r.data),
  get: (id: number) => api.get<Account>(`/accounts/${id}`).then((r) => r.data),
  create: (data: Partial<Account>) => api.post<Account>('/accounts', data).then((r) => r.data),
  update: (id: number, data: Partial<Account>) => api.put<Account>(`/accounts/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/accounts/${id}`),
}

export const categoryService = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),
  get: (id: number) => api.get<Category>(`/categories/${id}`).then((r) => r.data),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data).then((r) => r.data),
  update: (id: number, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/categories/${id}`),
}

export const transactionService = {
  list: (params?: { start_date?: string; end_date?: string; account_id?: number; category_id?: number; type?: string; page?: number }) =>
    api.get<{ data: Transaction[]; current_page: number; last_page: number; total: number }>('/transactions', { params }).then((r) => r.data),
  summary: (params?: { period?: string }) =>
    api.get<TransactionsSummary>('/transactions/summary', { params }).then((r) => r.data),
  get: (id: number) => api.get<Transaction>(`/transactions/${id}`).then((r) => r.data),
  create: (data: Partial<Transaction>) => api.post<Transaction>('/transactions', data).then((r) => r.data),
  update: (id: number, data: Partial<Transaction>) => api.put<Transaction>(`/transactions/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/transactions/${id}`),
}

export const budgetService = {
  list: () => api.get<Budget[]>('/budgets').then((r) => r.data),
  current: () => api.get<BudgetCurrent[]>('/budgets/current').then((r) => r.data),
  get: (id: number) => api.get<Budget>(`/budgets/${id}`).then((r) => r.data),
  create: (data: Partial<Budget>) => api.post<Budget>('/budgets', data).then((r) => r.data),
  update: (id: number, data: Partial<Budget>) => api.put<Budget>(`/budgets/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/budgets/${id}`),
}

export const recurringTransactionService = {
  list: () => api.get<{ recurring_transactions: RecurringTransaction[] }>('/recurring').then((r) => r.data.recurring_transactions),
  get: (id: number) => api.get<RecurringTransaction>(`/recurring/${id}`).then((r) => r.data),
  create: (data: Partial<RecurringTransaction>) => api.post<RecurringTransaction>('/recurring', data).then((r) => r.data),
  update: (id: number, data: Partial<RecurringTransaction>) => api.put<RecurringTransaction>(`/recurring/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/recurring/${id}`),
  skip: (id: number) => api.post<RecurringTransaction>(`/recurring/${id}/skip`).then((r) => r.data),
}

export const debtService = {
  list: () => api.get<{ debts: Debt[] }>('/debts').then((r) => r.data.debts),
  get: (id: number) => api.get<{ debt: Debt }>(`/debts/${id}`).then((r) => r.data.debt),
  create: (data: Partial<Debt>) => api.post<{ debt: Debt }>('/debts', data).then((r) => r.data.debt),
  update: (id: number, data: Partial<Debt>) => api.put<{ debt: Debt }>(`/debts/${id}`, data).then((r) => r.data.debt),
  delete: (id: number) => api.delete(`/debts/${id}`),
  calculate: (data: { debts: { creditor: string; total_amount: number; remaining_amount: number; interest_rate: number; minimum_payment: number }[]; monthly_payment: number; strategy: string }) =>
    api.post<DebtSimulationResult>('/debts/calculate', data).then((r) => r.data),
}
