import { useFinancialIndicators, useFinancialScore } from '../hooks'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function getGradeColor(grade: string) {
  switch (grade) {
    case 'excellent': return 'text-emerald-600 dark:text-emerald-400'
    case 'good': return 'text-brand-600 dark:text-brand-400'
    case 'fair': return 'text-amber-600 dark:text-amber-400'
    case 'poor': return 'text-orange-600 dark:text-orange-400'
    case 'critical': return 'text-red-600 dark:text-red-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

function getGradeBg(grade: string) {
  switch (grade) {
    case 'excellent': return 'bg-emerald-500'
    case 'good': return 'bg-brand-500'
    case 'fair': return 'bg-amber-500'
    case 'poor': return 'bg-orange-500'
    case 'critical': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'good': return 'text-emerald-600 dark:text-emerald-400'
    case 'alert': return 'text-amber-600 dark:text-amber-400'
    case 'critical': return 'text-red-600 dark:text-red-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'good': return 'Bom'
    case 'alert': return 'Atenção'
    case 'critical': return 'Crítico'
    default: return status
  }
}

export default function FinancialHealth() {
  const { data: indicators, isLoading: loadingIndicators } = useFinancialIndicators()
  const { data: score, isLoading: loadingScore } = useFinancialScore()

  const isLoading = loadingIndicators || loadingScore

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saúde Financeira</h1>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Carregando...</div>
      ) : score && indicators ? (
        <>
          <div className="card">
            <div className="card-body flex flex-col items-center py-8">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="8" />
                  <circle
                    cx="64" cy="64" r="56" fill="none"
                    className={getGradeBg(score.grade)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(score.score / 100) * 352} 352`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-3xl font-bold ${getGradeColor(score.grade)}`}>{score.score}</span>
                </div>
              </div>
              <p className={`text-lg font-semibold capitalize ${getGradeColor(score.grade)}`}>
                {score.grade === 'excellent' ? 'Excelente' :
                 score.grade === 'good' ? 'Boa' :
                 score.grade === 'fair' ? 'Regular' :
                 score.grade === 'poor' ? 'Ruim' : 'Crítico'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Score de saúde financeira (0-100)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {score.components.map(comp => (
              <div key={comp.name} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{comp.label}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(comp.status)} bg-current/10`}>
                      {getStatusLabel(comp.status)}
                    </span>
                  </div>
                  <p className={`text-2xl font-bold ${getStatusColor(comp.status)}`}>
                    {comp.score}/{comp.max_score}
                  </p>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getGradeBg(
                        comp.score / comp.max_score >= 0.8 ? 'excellent' :
                        comp.score / comp.max_score >= 0.4 ? 'fair' : 'critical'
                      )}`}
                      style={{ width: `${(comp.score / comp.max_score) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500 dark:text-gray-400">Renda mensal</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(indicators.total_monthly_income)}</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500 dark:text-gray-400">Despesas mensais</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(indicators.total_monthly_expenses)}</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500 dark:text-gray-400">Saldo total</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(indicators.total_balance)}</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500 dark:text-gray-400">Dívida total</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(indicators.total_debt)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500 dark:text-gray-400">Relação Dívida/Renda</p>
                <p className={`text-2xl font-bold ${indicators.debt_to_income_ratio > 50 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {indicators.debt_to_income_ratio}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {indicators.debt_to_income_ratio <= 30 ? 'Saudável' :
                   indicators.debt_to_income_ratio <= 50 ? 'Atenção' : 'Crítico'}
                </p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500 dark:text-gray-400">Fundo de Emergência</p>
                <p className={`text-2xl font-bold ${indicators.emergency_fund_months >= 6 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {indicators.emergency_fund_months} meses
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {indicators.emergency_fund_months >= 6 ? 'Suficiente' :
                   indicators.emergency_fund_months >= 3 ? 'Mínimo' : 'Insuficiente'}
                </p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <p className="text-sm text-gray-500 dark:text-gray-400">Taxa de Economia</p>
                <p className={`text-2xl font-bold ${indicators.monthly_savings_rate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {indicators.monthly_savings_rate}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {indicators.monthly_savings_rate >= 20 ? 'Ótima' :
                   indicators.monthly_savings_rate >= 10 ? 'Boa' : 'Baixa'}
                </p>
              </div>
            </div>
          </div>

          {indicators.category_spending.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gastos por Categoria</h2>
              </div>
              <div className="card-body space-y-3">
                {indicators.category_spending.map((cat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{cat.category_name}</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(cat.amount)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Crie transações e dívidas para ver seus indicadores financeiros.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
