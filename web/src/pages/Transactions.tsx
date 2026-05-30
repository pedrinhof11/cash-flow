import { useState } from 'react'
import { useTransactions, useAccounts, useCategories, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../hooks'
import { format } from 'date-fns'
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react'
import type { Transaction } from '../types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function Transactions() {
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form, setForm] = useState({ type: 'expense' as 'income' | 'expense', amount: '', description: '', date: new Date().toISOString().split('T')[0], account_id: '', category_id: '' })

  const [filterType, setFilterType] = useState('')
  const [filterAccountId, setFilterAccountId] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  const filters = {
    ...(filterType && { type: filterType }),
    ...(filterAccountId && { account_id: Number(filterAccountId) }),
    ...(filterCategoryId && { category_id: Number(filterCategoryId) }),
    ...(filterStartDate && { start_date: filterStartDate }),
    ...(filterEndDate && { end_date: filterEndDate }),
    page,
  }

  const { data, isLoading } = useTransactions(filters)
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const createTx = useCreateTransaction()
  const updateTx = useUpdateTransaction()
  const deleteTx = useDeleteTransaction()

  const handleSave = async () => {
    const payload = { ...form, account_id: Number(form.account_id), category_id: form.category_id ? Number(form.category_id) : null, amount: String(parseFloat(form.amount) || 0) }
    if (editing) {
      await updateTx.mutateAsync({ id: editing.id, data: payload })
    } else {
      await createTx.mutateAsync(payload)
    }
    setShowModal(false)
    setEditing(null)
    setForm({ type: 'expense', amount: '', description: '', date: new Date().toISOString().split('T')[0], account_id: '', category_id: '' })
  }

  const openNew = () => {
    setEditing(null)
    setForm({ type: 'expense', amount: '', description: '', date: new Date().toISOString().split('T')[0], account_id: '', category_id: '' })
    setShowModal(true)
  }

  const openEdit = (t: Transaction) => {
    setEditing(t)
    setForm({
      type: t.type === 'transfer' ? 'expense' : t.type,
      amount: t.amount,
      description: t.description || '',
      date: t.date,
      account_id: String(t.account_id),
      category_id: t.category_id ? String(t.category_id) : '',
    })
    setShowModal(true)
  }

  const clearFilters = () => {
    setFilterType('')
    setFilterAccountId('')
    setFilterCategoryId('')
    setFilterStartDate('')
    setFilterEndDate('')
    setPage(1)
  }

  const hasFilters = filterType || filterAccountId || filterCategoryId || filterStartDate || filterEndDate

  const expenseCategories = categories?.filter((c) => c.type === 'expense') || []
  const incomeCategories = categories?.filter((c) => c.type === 'income') || []
  const cats = form.type === 'income' ? incomeCategories : expenseCategories

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transações</h1>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tipo</label>
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1) }} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
              <option value="">Todos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Conta</label>
            <select value={filterAccountId} onChange={(e) => { setFilterAccountId(e.target.value); setPage(1) }} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
              <option value="">Todas</option>
              {accounts?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Categoria</label>
            <select value={filterCategoryId} onChange={(e) => { setFilterCategoryId(e.target.value); setPage(1) }} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
              <option value="">Todas</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Data início</label>
            <input type="date" value={filterStartDate} onChange={(e) => { setFilterStartDate(e.target.value); setPage(1) }} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Data fim</label>
            <input type="date" value={filterEndDate} onChange={(e) => { setFilterEndDate(e.target.value); setPage(1) }} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <RotateCcw className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descrição</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Categoria</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Conta</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valor</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data?.data?.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{format(new Date(t.date), 'dd MMM yyyy')}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{t.description || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t.category?.name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t.account?.name || '-'}</td>
                <td className={`px-4 py-3 text-sm font-semibold text-right ${t.type === 'income' ? 'text-brand-600 dark:text-brand-400' : 'text-red-600 dark:text-red-400'}`}>
                  <span className="inline-flex items-center gap-1">
                    {t.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {formatCurrency(parseFloat(t.amount))}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-1">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteTx.mutate(t.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</p>}
        {!data?.data?.length && !isLoading && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma transação encontrada</p>}
        {data && data.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Página {data.current_page} de {data.last_page}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 dark:text-gray-300">Anterior</button>
              <button disabled={page >= data.last_page} onClick={() => setPage(page + 1)} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50 dark:text-gray-300">Próxima</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{editing ? 'Editar' : 'Nova'} Transação</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button onClick={() => setForm({ ...form, type: 'income' })} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${form.type === 'income' ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>Receita</button>
                <button onClick={() => setForm({ ...form, type: 'expense' })} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${form.type === 'expense' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>Despesa</button>
              </div>
              <input type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 dark:text-gray-100" />
              <input type="text" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 dark:text-gray-100" />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 dark:text-gray-100" />
              <select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 dark:text-gray-100">
                <option value="">Selecionar Conta</option>
                {accounts?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 dark:text-gray-100">
                <option value="">Selecionar Categoria</option>
                {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowModal(false); setEditing(null) }} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-medium dark:text-gray-300">Cancelar</button>
                <button onClick={handleSave} disabled={(editing ? updateTx : createTx).isPending || !form.amount || !form.account_id} className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-brand-700 transition-colors">{editing ? 'Salvar' : 'Criar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
