import { useState } from 'react'
import { useSavingsGoals, useCreateSavingsGoal, useUpdateSavingsGoal, useDeleteSavingsGoal } from '../hooks'
import { useCategories } from '../hooks'
import { Plus, Pencil, Trash2, Target } from 'lucide-react'
import type { SavingsGoal } from '../types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function SavingsGoals() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SavingsGoal | null>(null)
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '0', deadline: '', category_id: '', notes: '' })

  const { data: goals, isLoading } = useSavingsGoals()
  const { data: categories } = useCategories()
  const createGoal = useCreateSavingsGoal()
  const updateGoal = useUpdateSavingsGoal()
  const deleteGoal = useDeleteSavingsGoal()

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', target_amount: '', current_amount: '0', deadline: new Date().toISOString().split('T')[0], category_id: '', notes: '' })
    setShowModal(true)
  }

  const openEdit = (goal: SavingsGoal) => {
    setEditing(goal)
    setForm({
      name: goal.name,
      target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount),
      deadline: goal.deadline,
      category_id: goal.category_id ? String(goal.category_id) : '',
      notes: goal.notes ?? '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const payload = {
      name: form.name,
      target_amount: parseFloat(form.target_amount) || 0,
      current_amount: parseFloat(form.current_amount) || 0,
      deadline: form.deadline,
      category_id: form.category_id ? parseInt(form.category_id) : null,
      notes: form.notes || null,
    }
    if (editing) {
      await updateGoal.mutateAsync({ id: editing.id, data: payload })
    } else {
      await createGoal.mutateAsync(payload)
    }
    setShowModal(false)
    setEditing(null)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      await deleteGoal.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Metas de Economia</h1>
        <button onClick={openCreate} className="card-header-btn">
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Carregando...</div>
      ) : !goals || goals.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Target className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma meta de economia cadastrada</p>
            <button onClick={openCreate} className="btn btn-primary mt-4">
              <Plus className="w-4 h-4" />
              Criar meta
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <div key={goal.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                    {goal.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{goal.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(goal)} className="btn-icon" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="btn-icon text-red-500 hover:text-red-700" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Meta:</span>
                    <span className="ml-1 text-gray-900 dark:text-white font-medium">{formatCurrency(goal.target_amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Guardado:</span>
                    <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(goal.current_amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Faltam:</span>
                    <span className="ml-1 text-amber-600 dark:text-amber-400 font-medium">{formatCurrency(goal.remaining_amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Prazo:</span>
                    <span className="ml-1 text-gray-900 dark:text-white font-medium">{new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${goal.progress >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Progresso</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{goal.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => { setShowModal(false); setEditing(null) }}>
          <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? 'Editar' : 'Nova'} Meta</h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="label">Nome da meta</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Fundo de emergência" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Valor alvo</label>
                  <input type="number" step="0.01" min="0.01" className="input" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Já guardado</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.current_amount} onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Prazo</label>
                  <input type="date" className="input" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Categoria (opcional)</label>
                  <select className="input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                    <option value="">Sem categoria</option>
                    {categories?.filter(c => c.type === 'expense').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Observações</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setShowModal(false); setEditing(null) }} className="btn btn-secondary">Cancelar</button>
                <button onClick={handleSave} className="btn btn-primary" disabled={createGoal.isPending || updateGoal.isPending}>
                  {editing ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
