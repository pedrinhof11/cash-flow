export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface Account {
  id: number
  user_id: number
  name: string
  type: 'bank' | 'cash' | 'credit_card' | 'investment' | 'other'
  initial_balance: string
  current_balance: string
  currency: string
  color: string | null
  icon: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  transactions_count?: number
}

export interface Category {
  id: number
  user_id: number
  name: string
  type: 'income' | 'expense'
  parent_id: number | null
  color: string | null
  icon: string | null
  is_default: boolean
  created_at: string
  updated_at: string
  children?: Category[]
}

export interface Transaction {
  id: number
  user_id: number
  account_id: number
  category_id: number | null
  type: 'income' | 'expense' | 'transfer'
  amount: string
  description: string | null
  date: string
  transfer_to_account_id: number | null
  recurring_transaction_id: number | null
  is_recurring_generated: boolean
  created_at: string
  updated_at: string
  account?: Account
  category?: Category
}

export interface Budget {
  id: number
  user_id: number
  category_id: number
  amount: string
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface BudgetCurrent extends Budget {
  spent: number
  remaining: number
  percentage_used: number
  is_over_budget: boolean
}

export interface RecurringTransaction {
  id: number
  user_id: number
  account_id: number
  category_id: number | null
  type: 'income' | 'expense'
  amount: string
  description: string | null
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  day_of_month: number | null
  start_date: string
  end_date: string | null
  next_due: string
  occurrences: number | null
  occurrences_left: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  account?: Account
  category?: Category
}

export interface TransactionsSummary {
  period: { start_date: string; end_date: string }
  total_income: number
  total_expense: number
  balance: number
  total_transfers: number
  by_category: { category_id: number; total: string }[]
}

export interface AuthResponse {
  user: User
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  total: number
}
