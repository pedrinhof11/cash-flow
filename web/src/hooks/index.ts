import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService, accountService, categoryService, transactionService, budgetService, recurringTransactionService, debtService, savingsGoalService, financialHealthService, analyticsService } from '../services'

export function useAuth() {
  const { setUser, logout: clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authService.login(email, password),
    onSuccess: (data) => {
      setUser(data.user)
      navigate('/dashboard')
    },
  })

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password, password_confirmation }: { name: string; email: string; password: string; password_confirmation: string }) =>
      authService.register(name, email, password, password_confirmation),
    onSuccess: (data) => {
      setUser(data.user)
      navigate('/dashboard')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth()
      navigate('/login')
    },
  })

  return { login: loginMutation, register: registerMutation, logout: logoutMutation }
}

export function useCheckAuth() {
  const { setUser, setLoading } = useAuthStore()

  const query = useQuery({
    queryKey: ['auth-me'],
    queryFn: authService.me,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (query.isSuccess) {
      setUser(query.data ?? null)
    }
    if (query.isSuccess || query.isError) {
      setLoading(false)
    }
  }, [query.isSuccess, query.isError, query.data, setUser, setLoading])

  return query
}

export function useAccounts() {
  return useQuery({ queryKey: ['accounts'], queryFn: accountService.list })
}

export function useAccount(id: number) {
  return useQuery({ queryKey: ['account', id], queryFn: () => accountService.get(id) })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: accountService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }) })
}

export function useUpdateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) => accountService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: accountService.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }) })
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: categoryService.list })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: categoryService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }) })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) => categoryService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: categoryService.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }) })
}

export function useTransactions(params?: { start_date?: string; end_date?: string; account_id?: number; category_id?: number; type?: string; page?: number }) {
  return useQuery({ queryKey: ['transactions', params], queryFn: () => transactionService.list(params) })
}

export function useTransactionSummary(params?: { period?: string }) {
  return useQuery({ queryKey: ['transaction-summary', params], queryFn: () => transactionService.summary(params) })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transaction-summary'] })
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) => transactionService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transaction-summary'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transaction-summary'] })
    },
  })
}

export function useBudgets() {
  return useQuery({ queryKey: ['budgets'], queryFn: budgetService.list })
}

export function useCurrentBudgets() {
  return useQuery({ queryKey: ['budgets-current'], queryFn: budgetService.current })
}

export function useCreateBudget() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: budgetService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', 'budgets-current'] }) })
}

export function useUpdateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) => budgetService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', 'budgets-current'] }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: budgetService.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', 'budgets-current'] }) })
}

export function useRecurringTransactions() {
  return useQuery({ queryKey: ['recurring'], queryFn: recurringTransactionService.list })
}

export function useCreateRecurringTransaction() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: recurringTransactionService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }) })
}

export function useUpdateRecurringTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) => recurringTransactionService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })
}

export function useDeleteRecurringTransaction() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: recurringTransactionService.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }) })
}

export function useSkipRecurringTransaction() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: recurringTransactionService.skip, onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }) })
}

export function useDebts() {
  return useQuery({ queryKey: ['debts'], queryFn: debtService.list })
}

export function useDebt(id: number) {
  return useQuery({ queryKey: ['debt', id], queryFn: () => debtService.get(id) })
}

export function useCreateDebt() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: debtService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }) })
}

export function useUpdateDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) => debtService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }),
  })
}

export function useDeleteDebt() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: debtService.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }) })
}

export function useDebtSimulation() {
  return useMutation({ mutationFn: debtService.calculate })
}

export function useSavingsGoals() {
  return useQuery({ queryKey: ['savings-goals'], queryFn: savingsGoalService.list })
}

export function useCreateSavingsGoal() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: savingsGoalService.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['savings-goals'] }) })
}

export function useUpdateSavingsGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) => savingsGoalService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings-goals'] }),
  })
}

export function useDeleteSavingsGoal() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: savingsGoalService.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['savings-goals'] }) })
}

export function useFinancialIndicators() {
  return useQuery({ queryKey: ['financial-indicators'], queryFn: financialHealthService.indicators })
}

export function useFinancialScore() {
  return useQuery({ queryKey: ['financial-score'], queryFn: financialHealthService.score })
}

export function useNetWorth(months = 12) {
  return useQuery({ queryKey: ['net-worth', months], queryFn: () => analyticsService.netWorth(months) })
}

export function useProjections() {
  return useMutation({ mutationFn: analyticsService.projections })
}

export function useCategorize() {
  return useMutation({ mutationFn: analyticsService.categorize })
}
