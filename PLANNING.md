# Cash Flow — Planejamento

## Missão

Ajudar o usuário no controle de finanças pessoais e ser uma ferramenta que auxilie na superação do super endividamento.

---

## Fases

### Fase 1 — Fortalecer a base ✅

#### 1.1 UI de Transações Recorrentes

- [x] Corrigir tipagem de `recurringTransactionService.list()` (API retorna `{ recurring_transactions: [...] }`)
- [x] Adicionar hook `useSkipRecurringTransaction` no `hooks/index.ts`
- [x] Criar `src/pages/Recurring.tsx`
- [x] Adicionar item "Recorrentes" na Sidebar (ícone `Repeat`)
- [x] Adicionar rota `/recurring` no `App.tsx`

#### 1.2 Editar registros

- [x] **Transactions**: botão editar por linha + modal preenchido com `useUpdateTransaction`
- [x] **Accounts**: botão editar por card + modal preenchido com `useUpdateAccount`
- [x] **Budgets**: botão editar + modal preenchido com `useUpdateBudget`
- [x] **Categories**: criar `useUpdateCategory` hook/service + botão editar

#### 1.3 Filtros na listagem de Transações

- [x] Barra de filtros acima da tabela: tipo (Todos/Receita/Despesa), conta, categoria, data início/fim
- [x] Botão "Limpar Filtros"
- [x] Passar filtros como params para `useTransactions()`

---

### Fase 2 — Dívidas (core anti-endividamento) ✅

**Backend (Laravel):**
- [x] Criar model `Debt` com migration: `creditor`, `total_amount`, `interest_rate`, `minimum_payment`, `due_day`, `start_date`, `paid_amount`, `user_id`
- [x] Criar `DebtController` com CRUD + endpoint `POST /debts/calculate`
- [x] Métodos de cálculo: Snowball (menor saldo primeiro) e Avalanche (maior juros primeiro)
- [x] Arquitetura completa: DTOs → Repository → Actions → UseCase → Resource → Requests → Tests

**Frontend (Web):**
- [x] Página `/debts` com lista de dívidas e progresso (pago / total)
- [x] Painel de resumo: total devido, total pago, % de progresso
- [x] Simulador: "Pagando R$ X/mês, quita em Y meses, paga R$ Z de juros"
- [x] Item "Dívidas" na Sidebar

---

### Fase 3 — Saúde financeira e metas ✅

- [x] Metas de economia (`savings_goals`) — CRUD completo backend + frontend
- [x] Indicadores: debt-to-income ratio, emergency fund, gasto por categoria como % da renda
- [x] Score de saúde financeira (0-100) com 4 componentes ponderados
- [x] Página `/financial-health` com score circular animado e cards de indicadores

---

### Fase 4 — Analytics e projeções ✅

- [x] Evolução do patrimônio líquido (ativos - passivos) ao longo do tempo
- [x] Projeção "Onde você estará em N meses" com cenários atual/otimista/pessimista
- [x] Categorização inteligente de gastos por descrição

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ⏳ | Em andamento / próximo a executar |
| 📅 | Planejado (futuro) |
| ✅ | Concluído |
