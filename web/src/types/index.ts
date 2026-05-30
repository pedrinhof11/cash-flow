export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: 'bank' | 'cash' | 'credit_card' | 'investment' | 'other';
  initial_balance: string;
  current_balance: string;
  currency: string;
  color: string | null;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  parent_id: number | null;
  color: string | null;
  icon: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number | null;
  type: 'income' | 'expense' | 'transfer';
  amount: string;
  description: string | null;
  date: string;
  transfer_to_account_id: number | null;
  recurring_transaction_id: number | null;
  is_recurring_generated: boolean;
  account?: Account;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string | null;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface RecurringTransaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number | null;
  type: 'income' | 'expense';
  amount: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  day_of_month: number | null;
  start_date: string;
  end_date: string | null;
  next_due: string;
  occurrences: number | null;
  occurrences_left: number | null;
  is_active: boolean;
  account?: Account;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface TransactionsSummary {
  period: {
    start_date: string;
    end_date: string;
  };
  total_income: number;
  total_expense: number;
  balance: number;
  total_transfers: number;
  by_category: { category_id: number; total: string }[];
}

export interface Debt {
  id: number;
  user_id: number;
  creditor: string;
  total_amount: number;
  interest_rate: number;
  minimum_payment: number;
  paid_amount: number;
  remaining_amount: number;
  progress: number;
  due_day: number;
  start_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtSimulationResult {
  strategy: 'snowball' | 'avalanche';
  total_months: number;
  total_interest_paid: number;
  debts_paid_off: number;
  total_debts: number;
  remaining_total: number;
  schedule: { month: number; creditor: string; paid_off: boolean; interest_paid: number }[];
}

export interface BudgetCurrent {
  id: number;
  category: Category;
  amount: string;
  spent: number;
  remaining: number;
  percentage_used: number;
  is_over_budget: boolean;
  period: string;
  start_date: string;
  end_date: string | null;
}
