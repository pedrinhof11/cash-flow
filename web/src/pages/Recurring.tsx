import { useState } from 'react'
import {
  useRecurringTransactions,
  useCreateRecurringTransaction,
  useDeleteRecurringTransaction,
  useSkipRecurringTransaction,
  useAccounts,
  useCategories,
} from '../hooks'
import { Plus, Trash2, SkipForward, ArrowUpRight, ArrowDownRight } from 'lucide-react'

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

const frequencyLabels: Record<string, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  yearly: 'Anual',
}

export default function Recurring() {
  const { data: recurring, isLoading } = useRecurringTransactions()
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const createRecurring = useCreateRecurringTransaction()
  const deleteRecurring = useDeleteRecurringTransaction()
  const skipRecurring = useSkipRecurringTransaction()

  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  const resetForm = () => {
    setType('expense')
    setAmount('')
    setDescription('')
    setFrequency('monthly')
    setAccountId('')
    setCategoryId('')
    setStartDate(new Date().toISOString().split('T')[0])
  }

  const handleSave = async () => {
    if (!amount || !accountId) return
    await createRecurring.mutateAsync({
      account_id: Number(accountId),
      category_id: categoryId ? Number(categoryId) : undefined,
      type,
      amount: String(parseFloat(amount)),
      description: description || undefined,
      frequency: frequency as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly',
      start_date: startDate,
    } as any)
    setShowModal(false)
    resetForm()
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Deseja excluir esta transação recorrente?')) {
      deleteRecurring.mutate(id)
    }
  }

  const filteredCategories = categories?.filter((c) => c.type === type) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recorrentes</h1>
          <p className="text-gray-500 dark:text-gray-400">{recurring?.length} transações agendadas</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Recorrência
        </button>
      </div>

      <div className="space-y-3">
        {recurring?.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'income' ? 'bg-brand-100 dark:bg-brand-950' : 'bg-red-100 dark:bg-red-950'}`}>
                  {item.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.description || 'Sem descrição'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {item.category?.name && `${item.category.name} • `}{item.account?.name}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-semibold ${item.type === 'income' ? 'text-brand-600 dark:text-brand-400' : 'text-red-600 dark:text-red-400'}`}>
                  {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">{frequencyLabels[item.frequency] || item.frequency}</span>
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span className="text-gray-500 dark:text-gray-400">Próxima: {item.next_due ? new Date(item.next_due).toLocaleDateString('pt-BR') : '—'}</span>
                {!item.is_active && (
                  <>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-gray-400 dark:text-gray-500 italic">Inativa</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => skipRecurring.mutate(item.id)}
                  disabled={skipRecurring.isPending || !item.is_active}
                  className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Pular próxima ocorrência"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteRecurring.isPending}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</p>}
      {!recurring?.length && !isLoading && (
        <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma transação recorrente. Crie uma para começar.</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Nova Transação Recorrente</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'income' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                  Receita
                </button>
                <button
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'expense' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                  Despesa
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descrição</label>
                <input
                  type="text"
                  placeholder="Descrição (opcional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Frequência</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  {Object.entries(frequencyLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Conta</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="">Selecionar conta</option>
                  {accounts?.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Categoria</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="">Sem categoria</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Data de Início</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={createRecurring.isPending || !amount || !accountId}
                  className="flex-1 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createRecurring.isPending ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
