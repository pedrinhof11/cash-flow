    # Cash Flow

Sistema de finanças pessoais para ajudar no controle financeiro e na superação do super endividamento.

Monorepo com 3 pacotes:

| Pacote | Stack | Porta |
|--------|-------|-------|
| **API** (`cash-flow-api/`) | Laravel 13, PHP 8.3, MySQL 8, Redis 7 | 8000 |
| **Web** (`web/`) | React 19, Vite 6, Tailwind CSS 3, Zustand, TanStack Query | 3000 |
| **Mobile** (`mobile/`) | Expo SDK 54, React Native 0.81, expo-router | — |

---

## Funcionalidades

- Gerenciamento de contas (bancária, dinheiro, cartão de crédito, investimento)
- Transações de receita, despesa e transferência com atualização automática de saldo
- Categorias hierárquicas (receita / despesa)
- Orçamentos por categoria com acompanhamento de limite (semanal, mensal, anual)
- Transações recorrentes (diária, semanal, quinzenal, mensal, anual)
- Dashboard com saldo total, receitas vs despesas, gráfico e transações recentes
- Dark mode
- Autenticação SPA via Sanctum (cookie-based)

---

## Requisitos

- PHP 8.3+
- Composer 2
- Docker + Docker Compose
- Node.js 22+
- npm 10+

---

## Configuração e execução

### 1. API (Laravel)

```bash
cd cash-flow-api

cp .env.example .env
# edite .env com suas configurações de banco e redis

composer run setup
# Instala dependências, gera key, roda migrations, build assets

docker compose up -d
# Sobe PHP 8.3 FPM + Nginx + MySQL 8 + Redis 7

composer run dev
# Inicia servidor (porta 8000) + queue worker + logs + Vite
```

**Testes:**
```bash
php artisan test
# ou
composer run test
# Usa SQLite em memória — não precisa de MySQL
```

### 2. Web (React SPA)

```bash
cd web

npm install

npm run dev
# Porta 3000 com proxy /api → http://host.docker.internal:8000
```

**Build:**
```bash
npm run build
# TypeScript check + Vite build
```

**Testes:**
```bash
npm run test
# Vitest + Testing Library + MSW
```

### 3. Mobile (Expo)

```bash
cd mobile

npm install

# Configure a URL da API no .env
echo "EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api" > .env

npx expo start
# Escaneie o QR Code com o app Expo Go
```

**Plataformas específicas:**
```bash
npx expo start --android
npx expo start --ios
npx expo start --web
```

---

## Fluxo de desenvolvimento local completo

```bash
# Terminal 1 — API
cd cash-flow-api
docker compose up -d
composer run dev

# Terminal 2 — Web
cd web
npm run dev

# Terminal 3 — Mobile (opcional)
cd mobile
npx expo start
```

Acesse:
- **API**: http://localhost:8000/api
- **Web**: http://localhost:3000
- **Mobile**: Expo Go (QR Code)

---

## Estrutura do projeto

```
cash-flow/
├── cash-flow-api/           # Backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/   # Auth, Account, Category, Transaction, Budget, RecurringTransaction
│   │   ├── Models/                # User, Account, Category, Transaction, Budget, RecurringTransaction
│   │   └── Services/              # TransactionService, RecurringTransactionService
│   ├── database/migrations/
│   └── routes/api.php
├── web/                      # Frontend React
│   ├── src/
│   │   ├── components/       # Layout (Sidebar), UI (Logo, PasswordInput)
│   │   ├── hooks/            # TanStack Query hooks
│   │   ├── pages/            # Login, Register, Dashboard, Transactions, Accounts, Budgets, Categories
│   │   ├── services/         # Axios service layer
│   │   ├── store/            # Zustand stores (auth, theme)
│   │   └── types/            # TypeScript interfaces
│   └── package.json
└── mobile/                   # App React Native
    └── app/                  # Expo Router pages
```

---

## Autenticação

O Cash Flow usa **Sanctum SPA** com cookies de sessão (sem token bearer).

1. Antes de qualquer POST/PUT/DELETE, o frontend chama `GET /api/sanctum/csrf-cookie`
2. O login usa sessão tradicional (`Auth::attempt`)
3. As requisições incluem `withCredentials: true`

**CORS** configurado para permitir:
- `localhost:3000` (web)
- `localhost:8081` (expo web)

---

## Ambiente de desenvolvimento

### Usuário de teste

Após rodar as migrations e seeders, um usuário de teste é criado automaticamente:

| Campo | Valor |
|---|---|
| **E-mail** | `test@example.com` |
| **Senha** | `password123` |

O seeder também cria:
- **4 contas**: Conta Corrente, Dinheiro, Cartão de Crédito, Investimentos
- **9 categorias**: Salário, Freelance, Investimentos, Alimentação, Transporte, Moradia, Saúde, Lazer, Assinaturas
- **9 transações** nos últimos 15 dias
- **1 orçamento** mensal para Alimentação (R$ 1.200)
- **1 transação recorrente** (Streaming, R$ 34,90/mês)

### Resetar dados

```bash
cd cash-flow-api
docker compose exec api php artisan migrate:fresh --seed
```

---

## Roadmap

Consulte [PLANNING.md](./PLANNING.md) para o roadmap completo de funcionalidades futuras.
