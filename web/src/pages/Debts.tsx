import { useState } from 'react'
import { useDebts, useCreateDebt, useUpdateDebt, useDeleteDebt, useDebtSimulation } from '../hooks'
import { Plus, Pencil, Trash2, TrendingDown, Zap } from 'lucide-react'
import type { Debt, DebtSimulationResult } from '../types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function Debts() {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Debt | null>(null)
  const [showSimulator, setShowSimulator] = useState(false)
  const [form, setForm] = useState({ creditor: '', total_amount: '', interest_rate: '', minimum_payment: '', due_day: '', start_date: new Date().toISOString().split('T')[0], notes: '', paid_amount: '0' })

  const [simForm, setSimForm] = useState({ monthly_payment: '1000', strategy: 'snowball' as 'snowball' | 'avalanche' })

  const { data: debts, isLoading } = useDebts()
  const createDebt = useCreateDebt()
  const updateDebt = useUpdateDebt()
  const deleteDebt = useDeleteDebt()
  const simulate = useDebtSimulation()
  const [simResult, setSimResult] = useState<DebtSimulationResult | null>(null)

  const openCreate = () => {
    setEditing(null)
    setForm({ creditor: '', total_amount: '', interest_rate: '', minimum_payment: '', due_day: '', start_date: new Date().toISOString().split('T')[0], notes: '', paid_amount: '0' })
    setShowModal(true)
  }

  const openEdit = (debt: Debt) => {
    setEditing(debt)
    setForm({
      creditor: debt.creditor,
      total_amount: String(debt.total_amount),
      interest_rate: String(debt.interest_rate),
      minimum_payment: String(debt.minimum_payment),
      due_day: String(debt.due_day),
      start_date: debt.start_date,
      notes: debt.notes ?? '',
      paid_amount: String(debt.paid_amount),
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const payload = {
      creditor: form.creditor,
      total_amount: parseFloat(form.total_amount) || 0,
      interest_rate: parseFloat(form.interest_rate) || 0,
      minimum_payment: parseFloat(form.minimum_payment) || 0,
      due_day: parseInt(form.due_day) || 1,
      start_date: form.start_date,
      notes: form.notes || null,
      paid_amount: parseFloat(form.paid_amount) || 0,
    }
    if (editing) {
      await updateDebt.mutateAsync({ id: editing.id, data: payload })
    } else {
      await createDebt.mutateAsync(payload)
    }
    setShowModal(false)
    setEditing(null)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta dívida?')) {
      await deleteDebt.mutateAsync(id)
    }
  }

  const handleSimulate = async () => {
    if (!debts || debts.length === 0) return
    const result = await simulate.mutateAsync({
      debts: debts.map(d => ({
        creditor: d.creditor,
        total_amount: d.total_amount,
        remaining_amount: d.remaining_amount,
        interest_rate: d.interest_rate,
        minimum_payment: d.minimum_payment,
      })),
      monthly_payment: parseFloat(simForm.monthly_payment) || 0,
      strategy: simForm.strategy,
    })
    setSimResult(result)
  }

  const totalDebt = debts?.reduce((s, d) => s + d.total_amount, 0) ?? 0
  const totalPaid = debts?.reduce((s, d) => s + d.paid_amount, 0) ?? 0
  const totalRemaining = debts?.reduce((s, d) => s + d.remaining_amount, 0) ?? 0
  const overallProgress = totalDebt > 0 ? Math.round((totalPaid / totalDebt) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dívidas</h1>
        <div className="flex gap-2">
          {debts && debts.length > 0 && (
            <button onClick={() => setShowSimulator(!showSimulator)} className="card-header-btn">
              <Zap className="w-4 h-4" />
              Simulador
            </button>
          )}
          <button onClick={openCreate} className="card-header-btn">
            <Plus className="w-4 h-4" />
            Nova Dívida
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total devido</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalDebt)}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total pago</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid)}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-gray-500 dark:text-gray-400">Restante</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalRemaining)}</p>
          </div>
        </div>
      </div>

      {overallProgress > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Progresso geral</span>
              <span className="text-gray-900 dark:text-white font-medium">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Carregando...</div>
      ) : !debts || debts.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <TrendingDown className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma dívida cadastrada</p>
            <button onClick={openCreate} className="btn btn-primary mt-4">
              <Plus className="w-4 h-4" />
              Cadastrar dívida
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map(debt => (
            <div key={debt.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{debt.creditor}</h3>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                        Vence dia {debt.due_day}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Total: <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(debt.total_amount)}</span>
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Juros: <span className="text-gray-900 dark:text-white font-medium">{debt.interest_rate}%</span>
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Mínimo: <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(debt.minimum_payment)}</span>
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Pago: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(debt.paid_amount)}</span>
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Restante: <span className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(debt.remaining_amount)}</span>
                      </span>
                    </div>
                    {debt.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{debt.notes}</p>
                    )}
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${debt.progress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${debt.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button onClick={() => openEdit(debt)} className="btn-icon" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(debt.id)} className="btn-icon text-red-500 hover:text-red-700" title="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? 'Editar' : 'Nova'} Dívida</h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="label">Credor</label>
                <input className="input" value={form.creditor} onChange={e => setForm(f => ({ ...f, creditor: e.target.value }))} placeholder="Ex: Banco XYZ" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Valor total</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.total_amount} onChange={e => setForm(f => ({ ...f, total_amount: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Taxa de juros (%)</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Pagamento mínimo</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.minimum_payment} onChange={e => setForm(f => ({ ...f, minimum_payment: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Dia de vencimento</label>
                  <input type="number" min="1" max="31" className="input" value={form.due_day} onChange={e => setForm(f => ({ ...f, due_day: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Data de início</label>
                  <input type="date" className="input" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Valor já pago</label>
                  <input type="number" step="0.01" min="0" className="input" value={form.paid_amount} onChange={e => setForm(f => ({ ...f, paid_amount: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Observações</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setShowModal(false); setEditing(null) }} className="btn btn-secondary">Cancelar</button>
                <button onClick={handleSave} className="btn btn-primary" disabled={createDebt.isPending || updateDebt.isPending}>
                  {editing ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSimulator && debts && debts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Simulador de quitação</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Valor mensal disponível</label>
                <input type="number" step="100" min="0" className="input" value={simForm.monthly_payment} onChange={e => setSimForm(f => ({ ...f, monthly_payment: e.target.value }))} />
              </div>
              <div>
                <label className="label">Estratégia</label>
                <select className="input" value={simForm.strategy} onChange={e => setSimForm(f => ({ ...f, strategy: e.target.value as 'snowball' | 'avalanche' }))}>
                  <option value="snowball">Snowball (menor saldo)</option>
                  <option value="avalanche">Avalanche (maior juros)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={handleSimulate} className="btn btn-primary w-full" disabled={simulate.isPending}>
                  {simulate.isPending ? 'Calculando...' : 'Simular'}
                </button>
              </div>
            </div>

            {simResult && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="card">
                    <div className="card-body text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{simResult.total_months}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">meses para quitar</p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body text-center">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(simResult.total_interest_paid)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">total em juros</p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body text-center">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{simResult.debts_paid_off}/{simResult.total_debts}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">dívidas quitadas</p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body text-center">
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(simResult.remaining_total)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">restante após {simResult.total_months} meses</p>
                    </div>
                  </div>
                </div>

                {simResult.schedule.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cronograma de quitação</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 text-gray-500 dark:text-gray-400">Mês</th>
                            <th className="text-left py-2 text-gray-500 dark:text-gray-400">Credor</th>
                            <th className="text-right py-2 text-gray-500 dark:text-gray-400">Juros pagos</th>
                            <th className="text-right py-2 text-gray-500 dark:text-gray-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {simResult.schedule.map((s, i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 text-gray-900 dark:text-white">{s.month}º</td>
                              <td className="py-2 text-gray-900 dark:text-white">{s.creditor}</td>
                              <td className="py-2 text-right text-gray-900 dark:text-white">{formatCurrency(s.interest_paid)}</td>
                              <td className="py-2 text-right">
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
                                  Quitada
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
