import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authService } from '../services/authService'
import { accountService } from '../services/accountService'
import { categoryService } from '../services/categoryService'
import { transactionService } from '../services/transactionService'
import { budgetService } from '../services/budgetService'
import { recurringService } from '../services/recurringService'
import { useAuthStore } from '../store/authStore'
import { getCsrfCookie } from '../lib/api'

export function useCheckAuth() {
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data = await authService.me()
      return data.user
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  useEffect(() => {
    if (query.data !== undefined) {
      setUser(query.data)
      setLoading(false)
    }
  }, [query.data])

  useEffect(() => {
    if (query.isError) {
      setUser(null)
      setLoading(false)
    }
  }, [query.isError])

  return query
}

export function useAuth() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await getCsrfCookie()
      return authService.login(email, password)
    },
  })

  useEffect(() => {
    if (login.data) {
      setUser(login.data.user)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  }, [login.data])

  const register = useMutation({
    mutationFn: async ({
      name,
      email,
      password,
      password_confirmation,
    }: {
      name: string
      email: string
      password: string
      password_confirmation: string
    }) => {
      await getCsrfCookie()
      return authService.register(name, email, password, password_confirmation)
    },
  })

  useEffect(() => {
    if (register.data) {
      setUser(register.data.user)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    }
  }, [register.data])

  const logout = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      setUser(null)
      queryClient.clear()
    },
  })

  return { login, register, logout }
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.list({ active_only: true }),
  })
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => accountService.get(id),
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accountService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useTransactions(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.list(params),
  })
}

export function useTransactionSummary(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['transactions', 'summary', params],
    queryFn: () => transactionService.summary(params),
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transactionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetService.list(),
  })
}

export function useCurrentBudgets() {
  return useQuery({
    queryKey: ['budgets', 'current'],
    queryFn: () => budgetService.current(),
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: budgetService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets', 'current'] })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: budgetService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets', 'current'] })
    },
  })
}

export function useRecurringTransactions() {
  return useQuery({
    queryKey: ['recurring'],
    queryFn: () => recurringService.list(),
  })
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recurringService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
  })
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recurringService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
  })
}

export function useSkipRecurringTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recurringService.skip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
    },
  })
}
