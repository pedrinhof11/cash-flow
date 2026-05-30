import { useState } from 'react'
import { useNetWorth, useProjections } from '../hooks'
import { TrendingUp, TrendingDown, Zap } from 'lucide-react'
import type { ProjectionEntry } from '../types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function Analytics() {
  const [months, setMonths] = useState(12)
  const [showProjections, setShowProjections] = useState(false)
  const [projectionMonths, setProjectionMonths] = useState(12)
  const [projectionScenario, setProjectionScenario] = useState('current')

  const { data: netWorth, isLoading } = useNetWorth(months)
  const projectionsMutation = useProjections()
  const [projections, setProjections] = useState<ProjectionEntry[] | null>(null)

  const handleProject = async () => {
    const result = await projectionsMutation.mutateAsync({
      months: projectionMonths,
      scenario: projectionScenario,
    })
    setProjections(result)
  }

  const currentNetWorth = netWorth?.[netWorth.length - 1]?.net_worth ?? 0
  const firstNetWorth = netWorth?.[0]?.net_worth ?? 0
  const netWorthChange = currentNetWorth - firstNetWorth

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <button onClick={() => setShowProjections(!showProjections)} className="card-header-btn">
          <Zap className="w-4 h-4" />
          Projeções
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Carregando...</div>
      ) : netWorth && netWorth.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500 dark:text-gray-400">Patrimônio Líquido</p>
                <p className={`text-2xl font-bold ${currentNetWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(currentNetWorth)}
                </p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500 dark:text-gray-400">Variação no período</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${netWorthChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(netWorthChange)}
                  </p>
                  {netWorthChange >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500 dark:text-gray-400">Período</p>
                <select className="input mt-1" value={months} onChange={e => setMonths(Number(e.target.value))}>
                  <option value={6}>6 meses</option>
                  <option value={12}>12 meses</option>
                  <option value={24}>24 meses</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Evolução do Patrimônio</h2>
            </div>
            <div className="card-body">
              <div className="relative h-64">
                <svg className="w-full h-full" viewBox="0 0 800 250" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  <path
                    d={(() => {
                      const max = Math.max(...netWorth.map(d => d.net_worth), 1)
                      const min = Math.min(...netWorth.map(d => d.net_worth), 0)
                      const range = max - min || 1
                      const stepX = 800 / (netWorth.length - 1)

                      const points = netWorth.map((d, i) => {
                        const x = i * stepX
                        const y = 220 - ((d.net_worth - min) / range) * 190
                        return `${x},${y}`
                      })

                      return `M${points[0]} L${points.slice(1).join(' L')} L${800 - stepX},220 L0,220 Z`
                    })()}
                    fill="url(#netWorthGradient)"
                  />

                  <path
                    d={(() => {
                      const max = Math.max(...netWorth.map(d => d.net_worth), 1)
                      const min = Math.min(...netWorth.map(d => d.net_worth), 0)
                      const range = max - min || 1
                      const stepX = 800 / (netWorth.length - 1)

                      return netWorth.map((d, i) => {
                        const x = i * stepX
                        const y = 220 - ((d.net_worth - min) / range) * 190
                        return `${i === 0 ? 'M' : 'L'}${x},${y}`
                      }).join(' ')
                    })()}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                  />
                </svg>

                <div className="absolute top-0 right-0 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-brand-500" />
                    <span>Patrimônio Líquido</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>{netWorth[0].date}</span>
                <span className="text-center">{netWorth[Math.floor(netWorth.length / 3)]?.date}</span>
                <span className="text-center">{netWorth[Math.floor(netWorth.length * 2 / 3)]?.date}</span>
                <span className="text-right">{netWorth[netWorth.length - 1].date}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ativos totais</h2>
              </div>
              <div className="card-body">
                <svg className="w-full h-40" viewBox="0 0 800 160" preserveAspectRatio="none">
                  <path
                    d={(() => {
                      const max = Math.max(...netWorth.map(d => d.total_assets), 1)
                      const stepX = 800 / (netWorth.length - 1)
                      return netWorth.map((d, i) => {
                        const x = i * stepX
                        const y = 140 - (d.total_assets / max) * 120
                        return `${i === 0 ? 'M' : 'L'}${x},${y}`
                      }).join(' ')
                    })()}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dívidas totais</h2>
              </div>
              <div className="card-body">
                <svg className="w-full h-40" viewBox="0 0 800 160" preserveAspectRatio="none">
                  <path
                    d={(() => {
                      const max = Math.max(...netWorth.map(d => d.total_debts), 1)
                      const stepX = 800 / (netWorth.length - 1)
                      return netWorth.map((d, i) => {
                        const x = i * stepX
                        const y = 140 - (d.total_debts / max) * 120
                        return `${i === 0 ? 'M' : 'L'}${x},${y}`
                      }).join(' ')
                    })()}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Crie transações e dívidas para ver a evolução do seu patrimônio.
            </p>
          </div>
        </div>
      )}

      {showProjections && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projeções Financeiras</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Horizonte (meses)</label>
                <input type="number" min="1" max="60" className="input" value={projectionMonths} onChange={e => setProjectionMonths(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Cenário</label>
                <select className="input" value={projectionScenario} onChange={e => setProjectionScenario(e.target.value)}>
                  <option value="current">Atual</option>
                  <option value="optimistic">Otimista (+10% receita, -10% despesa)</option>
                  <option value="pessimistic">Pessimista (-10% receita, +10% despesa)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={handleProject} className="btn btn-primary w-full" disabled={projectionsMutation.isPending}>
                  {projectionsMutation.isPending ? 'Calculando...' : 'Simular'}
                </button>
              </div>
            </div>

            {projections && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="card">
                    <div className="card-body text-center">
                      <p className={`text-2xl font-bold ${projections[projections.length - 1].net_worth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(projections[projections.length - 1].net_worth)}
                      </p>
                      <p className="text-xs text-gray-500">Patrimônio em {projections.length} meses</p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body text-center">
                      <p className="text-2xl font-bold text-emerald-600">{formatCurrency(projections[projections.length - 1].total_assets)}</p>
                      <p className="text-xs text-gray-500">Ativos totais</p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body text-center">
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(projections[projections.length - 1].total_debts)}</p>
                      <p className="text-xs text-gray-500">Dívidas totais</p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(projections[0].monthly_income - projections[0].monthly_expenses)}</p>
                      <p className="text-xs text-gray-500">Economia mensal</p>
                    </div>
                  </div>
                </div>

                <svg className="w-full h-48" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="projNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="projAssets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="projDebts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {(['net_worth', 'total_assets', 'total_debts'] as const).map((field, fi) => {
                    const colors = ['#059669', '#3b82f6', '#ef4444']
                    const max = Math.max(...projections.map(d => d[field]), 1)
                    const stepX = 800 / (projections.length - 1)
                    const pathD = projections.map((d, i) => {
                      const x = i * stepX
                      const y = 180 - (d[field] / max) * 155
                      return `${i === 0 ? 'M' : 'L'}${x},${y}`
                    }).join(' ')

                    return (
                      <path key={field} d={pathD} fill="none" stroke={colors[fi]} strokeWidth="1.5" opacity="0.8" />
                    )
                  })}
                </svg>

                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 justify-center">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-emerald-600" />
                    <span>Patrimônio</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-blue-500" />
                    <span>Ativos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 bg-red-500" />
                    <span>Dívidas</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
