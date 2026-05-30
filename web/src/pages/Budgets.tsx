import { useState } from 'react'
import { useCurrentBudgets, useCategories, useCreateBudget, useUpdateBudget, useDeleteBudget } from '../hooks'
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import type { BudgetCurrent } from '../types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function Budgets() {
  const { data: budgets, isLoading } = useCurrentBudgets()
  const { data: categories } = useCategories()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<BudgetCurrent | null>(null)
  const [form, setForm] = useState({ category_id: '', amount: '', period: 'monthly' as string })

  const handleSave = async () => {
    const start = new Date()
    const end = new Date()
    if (form.period === 'monthly') end.setMonth(end.getMonth() + 1)
    else if (form.period === 'weekly') end.setDate(end.getDate() + 7)
    else end.setFullYear(end.getFullYear() + 1)

    const payload = {
      category_id: Number(form.category_id),
      amount: String(parseFloat(form.amount) || 0),
      period: form.period as 'weekly' | 'monthly' | 'yearly',
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    }

    if (editing) {
      await updateBudget.mutateAsync({ id: editing.id, data: payload })
    } else {
      await createBudget.mutateAsync(payload)
    }
    setShowModal(false)
    setEditing(null)
    setForm({ category_id: '', amount: '', period: 'monthly' })
  }

  const openNew = () => {
    setEditing(null)
    setForm({ category_id: '', amount: '', period: 'monthly' })
    setShowModal(true)
  }

  const openEdit = (b: BudgetCurrent) => {
    setEditing(b)
    setForm({ category_id: String(b.category.id), amount: b.amount, period: b.period })
    setShowModal(true)
  }

  const expenseCategories = categories?.filter((c) => c.type === 'expense') || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orçamentos</h1>
          <p className="text-gray-500 dark:text-gray-400">Acompanhe seus limites de gastos</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors">
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </button>
      </div>

      <div className="space-y-4">
        {budgets?.map((b) => (
          <div key={b.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{b.category?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Limite: {formatCurrency(parseFloat(b.amount))}</p>
              </div>
              <div className="flex items-center gap-2">
                {b.is_over_budget ? (
                  <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Acima do limite
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Dentro do limite
                  </span>
                )}
                <button onClick={() => openEdit(b)} className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 ml-2 p-1">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteBudget.mutate(b.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all ${b.is_over_budget ? 'bg-red-500' : b.percentage_used > 75 ? 'bg-amber-500' : 'bg-brand-500'}`}
                style={{ width: `${Math.min(b.percentage_used, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Gasto: {formatCurrency(b.spent)}</span>
              <span className={`font-medium ${b.is_over_budget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {b.percentage_used.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {isLoading && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</p>}
      {!budgets?.length && !isLoading && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum orçamento definido. Crie um para começar.</p>}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{editing ? 'Editar' : 'Novo'} Orçamento</h2>
            <div className="space-y-4">
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                <option value="">Selecionar Categoria</option>
                {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Valor do orçamento" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
              <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowModal(false); setEditing(null) }} className="flex-1 py-2 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={(editing ? updateBudget : createBudget).isPending || !form.category_id || !form.amount} className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{editing ? 'Salvar' : 'Criar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
