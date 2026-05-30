import { useTransactionSummary, useAccounts, useTransactions } from '../hooks'
import { Wallet, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function Dashboard() {
  const now = new Date()
  const summary = useTransactionSummary({ period: 'month' })
  const accounts = useAccounts()
  const transactions = useTransactions({ page: 1 })

  const totalBalance = accounts.data?.reduce((sum, a) => sum + parseFloat(a.current_balance), 0) || 0

  const summaryData = summary.data
    ? [
        { name: 'Receitas', value: summary.data.total_income, color: '#10b981' },
        { name: 'Despesas', value: summary.data.total_expense, color: '#ef4444' },
      ]
    : []

  const monthName = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][now.getMonth()]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Visão Geral</h1>
        <p className="text-gray-500 dark:text-gray-400 capitalize">{monthName} de {now.getFullYear()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Saldo Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalBalance)}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Receitas</span>
          </div>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {formatCurrency(summaryData[0]?.value || 0)}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Despesas</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(summaryData[1]?.value || 0)}
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Contas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{accounts.data?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Receitas vs Despesas</h3>
          {summary.data ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summaryData}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {summaryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400 dark:text-gray-600">
              Carregando...
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Transações Recentes</h3>
          <div className="space-y-1">
            {transactions.data?.data?.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-brand-100 dark:bg-brand-950' : 'bg-red-100 dark:bg-red-950'}`}>
                    {t.type === 'income' ? (
                      <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.description || 'Sem descrição'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(t.date), 'dd/MM/yyyy')}
                      {t.category && <span> &middot; {t.category.name}</span>}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-brand-600 dark:text-brand-400' : 'text-red-600 dark:text-red-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount))}
                </span>
              </div>
            ))}
            {!transactions.data?.data?.length && (
              <p className="text-gray-400 dark:text-gray-600 text-sm text-center py-8">
                Nenhuma transação ainda
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
