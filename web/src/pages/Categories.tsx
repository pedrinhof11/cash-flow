import { useState } from 'react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks'
import { Plus, Pencil, Trash2, Hash } from 'lucide-react'
import type { Category } from '../types'

export default function Categories() {
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', type: 'expense' as 'income' | 'expense' })

  const handleSave = async () => {
    if (editing) {
      await updateCategory.mutateAsync({ id: editing.id, data: form })
    } else {
      await createCategory.mutateAsync(form)
    }
    setShowModal(false)
    setEditing(null)
    setForm({ name: '', type: 'expense' })
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', type: 'expense' })
    setShowModal(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, type: cat.type })
    setShowModal(true)
  }

  const income = categories?.filter((c) => c.type === 'income') || []
  const expenses = categories?.filter((c) => c.type === 'expense') || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categorias</h1>
          <p className="text-gray-500 dark:text-gray-400">{categories?.length} categorias</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-brand-700 dark:text-brand-400 mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Receitas ({income.length})
          </h3>
          <div className="card divide-y divide-gray-100 dark:divide-gray-800">
            {income.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                {!c.is_default && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-1">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteCategory.mutate(c.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {!income.length && <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Nenhuma categoria de receita</p>}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Despesas ({expenses.length})
          </h3>
          <div className="card divide-y divide-gray-100 dark:divide-gray-800">
            {expenses.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                {!c.is_default && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-1">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteCategory.mutate(c.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {!expenses.length && <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Nenhuma categoria de despesa</p>}
          </div>
        </div>
      </div>

      {isLoading && <p className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</p>}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{editing ? 'Editar' : 'Nova'} Categoria</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome da categoria" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
              <div className="flex gap-2">
                <button onClick={() => setForm({ ...form, type: 'income' })} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${form.type === 'income' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>Receita</button>
                <button onClick={() => setForm({ ...form, type: 'expense' })} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${form.type === 'expense' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>Despesa</button>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowModal(false); setEditing(null) }} className="flex-1 py-2 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={(editing ? updateCategory : createCategory).isPending || !form.name} className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{editing ? 'Salvar' : 'Criar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
