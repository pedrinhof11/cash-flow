import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { User, Account, Category, Transaction, Budget, TransactionsSummary, BudgetCurrent } from '../../types'

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
}

const mockAccounts: Account[] = [
  {
    id: 1, user_id: 1, name: 'Conta Corrente', type: 'bank',
    initial_balance: '1000.00', current_balance: '1500.00',
    currency: 'BRL', color: null, icon: null, description: null,
    is_active: true, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 2, user_id: 1, name: 'Dinheiro', type: 'cash',
    initial_balance: '200.00', current_balance: '200.00',
    currency: 'BRL', color: null, icon: null, description: null,
    is_active: true, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
  },
]

const mockCategories: Category[] = [
  { id: 1, user_id: 1, name: 'Salário', type: 'income', parent_id: null, color: '#10b981', icon: null, is_default: true, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' },
  { id: 2, user_id: 1, name: 'Alimentação', type: 'expense', parent_id: null, color: '#ef4444', icon: null, is_default: true, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' },
  { id: 3, user_id: 1, name: 'Transporte', type: 'expense', parent_id: null, color: '#3b82f6', icon: null, is_default: false, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z' },
]

const mockTransactions: Transaction[] = [
  {
    id: 1, user_id: 1, account_id: 1, category_id: 1, type: 'income',
    amount: '5000.00', description: 'Salário Mensal', date: '2026-05-01',
    transfer_to_account_id: null, recurring_transaction_id: null, is_recurring_generated: false,
    account: mockAccounts[0], category: mockCategories[0],
    created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 2, user_id: 1, account_id: 1, category_id: 2, type: 'expense',
    amount: '150.00', description: 'Mercado', date: '2026-05-02',
    transfer_to_account_id: null, recurring_transaction_id: null, is_recurring_generated: false,
    account: mockAccounts[0], category: mockCategories[1],
    created_at: '2026-05-02T00:00:00Z', updated_at: '2026-05-02T00:00:00Z',
  },
]

const mockSummary: TransactionsSummary = {
  period: { start_date: '2026-05-01', end_date: '2026-05-31' },
  total_income: 5000,
  total_expense: 150,
  balance: 4850,
  total_transfers: 0,
  by_category: [{ category_id: 2, total: '150.00' }],
}

const mockBudgets: Budget[] = [
  {
    id: 1, user_id: 1, category_id: 2, amount: '500.00', period: 'monthly',
    start_date: '2026-05-01', end_date: '2026-05-31',
    category: mockCategories[1],
    created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
  },
]

const mockBudgetsCurrent: BudgetCurrent[] = [
  {
    id: 1, category: mockCategories[1], amount: '500.00',
    spent: 150, remaining: 350, percentage_used: 30,
    is_over_budget: false, period: 'monthly',
    start_date: '2026-05-01', end_date: '2026-05-31',
  },
]

export const handlers = [
  http.get('/api/sanctum/csrf-cookie', () => HttpResponse.json({ message: 'CSRF cookie set' })),

  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as Record<string, string>
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({ user: mockUser })
    }
    return new HttpResponse(JSON.stringify({ message: 'As credenciais informadas estão incorretas.' }), { status: 422 })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as Record<string, string>
    return HttpResponse.json({
      user: { ...mockUser, name: body.name, email: body.email },
    }, { status: 201 })
  }),

  http.post('/api/auth/logout', () => HttpResponse.json({ message: 'Desconectado com sucesso' })),

  http.get('/api/auth/me', () => HttpResponse.json({ user: mockUser })),

  http.get('/api/accounts', () => HttpResponse.json({ accounts: mockAccounts })),

  http.post('/api/accounts', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 3, user_id: 1, name: body.name, type: body.type,
      initial_balance: String(body.initial_balance), current_balance: String(body.initial_balance),
      currency: 'BRL', color: null, icon: null, description: null,
      is_active: true, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
    }, { status: 201 })
  }),

  http.delete('/api/accounts/:id', () => new HttpResponse(null, { status: 204 })),

  http.get('/api/categories', () => HttpResponse.json({ categories: mockCategories })),

  http.post('/api/categories', async ({ request }) => {
    const body = await request.json() as Record<string, string>
    return HttpResponse.json({
      id: 4, user_id: 1, name: body.name, type: body.type,
      parent_id: null, color: null, icon: null, is_default: false,
      created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
    }, { status: 201 })
  }),

  http.delete('/api/categories/:id', () => new HttpResponse(null, { status: 204 })),

  http.get('/api/transactions', () => {
    return HttpResponse.json({
      data: mockTransactions,
      current_page: 1,
      last_page: 1,
      total: mockTransactions.length,
    })
  }),

  http.post('/api/transactions', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 3, user_id: 1, account_id: body.account_id, category_id: body.category_id,
      type: body.type, amount: String(body.amount), description: body.description,
      date: body.date, transfer_to_account_id: null, recurring_transaction_id: null,
      is_recurring_generated: false,
      account: mockAccounts[0], category: mockCategories[1],
      created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
    }, { status: 201 })
  }),

  http.delete('/api/transactions/:id', () => new HttpResponse(null, { status: 204 })),

  http.get('/api/transactions/summary', () => HttpResponse.json(mockSummary)),

  http.get('/api/budgets', () => HttpResponse.json(mockBudgets)),

  http.get('/api/budgets/current', () => HttpResponse.json(mockBudgetsCurrent)),

  http.post('/api/budgets', async ({ request }) => {
    const body = await request.json() as Record<string, string>
    return HttpResponse.json({
      id: 2, user_id: 1, category_id: Number(body.category_id), amount: body.amount,
      period: body.period, start_date: body.start_date, end_date: body.end_date,
      category: mockCategories[1],
      created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
    }, { status: 201 })
  }),

  http.delete('/api/budgets/:id', () => new HttpResponse(null, { status: 204 })),

  http.get('/api/recurring', () => HttpResponse.json([])),
]

export const server = setupServer(...handlers)
