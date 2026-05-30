import { useState } from 'react'
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '../hooks'
import { Plus, Pencil, Trash2, Wallet, Banknote, CreditCard, TrendingUp, MoreHorizontal } from 'lucide-react'
import type { Account } from '../types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const typeLabels: Record<string, string> = {
  bank: 'Conta Bancária',
  cash: 'Dinheiro',
  credit_card: 'Cartão de Crédito',
  investment: 'Investimento',
  other: 'Outro',
}

const typeIcons: Record<string, React.ElementType> = {
  bank: Banknote,
  cash: Wallet,
  credit_card: CreditCard,
  investment: TrendingUp,
  other: MoreHorizontal,
}

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [form, setForm] = useState({ name: '', type: 'bank' as 'bank' | 'cash' | 'credit_card' | 'investment' | 'other', initial_balance: '' })

  const handleSave = async () => {
    const payload = { ...form, initial_balance: String(parseFloat(form.initial_balance) || 0) }
    if (editing) {
      await updateAccount.mutateAsync({ id: editing.id, data: payload })
    } else {
      await createAccount.mutateAsync(payload)
    }
    setShowModal(false)
    setEditing(null)
    setForm({ name: '', type: 'bank', initial_balance: '' })
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', type: 'bank', initial_balance: '' })
    setShowModal(true)
  }

  const openEdit = (acc: Account) => {
    setEditing(acc)
    setForm({ name: acc.name, type: acc.type, initial_balance: acc.initial_balance })
    setShowModal(true)
  }

  const totalBalance = accounts?.reduce((sum, a) => sum + parseFloat(a.current_balance), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contas</h1>
          <p className="text-gray-500 dark:text-gray-400">{accounts?.length} contas • Total: {formatCurrency(totalBalance)}</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nova Conta
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts?.map((account) => {
          const Icon = typeIcons[account.type] || MoreHorizontal
          return (
            <div key={account.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(account)} className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-1">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteAccount.mutate(account.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{account.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{typeLabels[account.type] || account.type}</p>
              <p className="text-xl font-bold mt-2 text-gray-900 dark:text-gray-100">{formatCurrency(parseFloat(account.current_balance))}</p>
            </div>
          )
        })}
      </div>

      {isLoading && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</p>}
      {!accounts?.length && !isLoading && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma conta cadastrada. Crie uma para começar.</p>}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{editing ? 'Editar' : 'Nova'} Conta</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome da conta" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'bank' | 'cash' | 'credit_card' | 'investment' | 'other' })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                <option value="bank">Conta Bancária</option>
                <option value="cash">Dinheiro</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="investment">Investimento</option>
                <option value="other">Outro</option>
              </select>
              <input type="number" step="0.01" placeholder="Saldo inicial" value={form.initial_balance} onChange={(e) => setForm({ ...form, initial_balance: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowModal(false); setEditing(null) }} className="flex-1 py-2 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={(editing ? updateAccount : createAccount).isPending || !form.name} className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{editing ? 'Salvar' : 'Criar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
