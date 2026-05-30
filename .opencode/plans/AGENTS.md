# Cash Flow

Monorepo com 3 pacotes: **API** (Laravel 13), **Web** (React 19 + Vite), **Mobile** (Expo SDK 54).

---

## Estrutura

| Diretório | Stack | Porta | Iniciar |
|---|---|---|---|
| `cash-flow-api/` | Laravel 13, PHP 8.3, MySQL, Redis | 8000 | `docker compose up -d` |
| `web/` | React 19, Vite, Tailwind v3, Zustand, TanStack Query | 3000 | `npm run dev` |
| `mobile/` | Expo SDK 54, React Native 0.81, expo-router | - | `npx expo start` |

## API (Laravel)

- **Setup inicial**: `composer run setup` (instala dependências, gera key, roda migrations, build assets)
- **Dev**: `composer run dev` (inicia server + queue + logs + Vite via `concurrently`)
- **Testes**: `php artisan test` ou `composer run test` (usa SQLite em memória)
- **Docker**: `docker compose up -d` (PHP 8.3 FPM + Nginx + MySQL 8 + Redis 7)
- **Auth**: Sanctum SPA (cookie-based). Middleware API inclui `EncryptCookies`, `StartSession`, `VerifyCsrfToken`, `EnsureFrontendRequestsAreStateful`
- **CSRF**: `GET /api/sanctum/csrf-cookie` antes de POST/PUT/DELETE
- **CORS**: configurado em `config/cors.php` via env `CORS_ALLOWED_ORIGINS`
- **Sanctum stateful**: configurado em `config/sanctum.php` via env `SANCTUM_STATEFUL_DOMAINS`
- **Rotas API**: prefixo `/api`, definidas em `routes/api.php`
- **Queue + Cache**: Redis (`QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`)

## Web (React SPA)

- **Dev**: `npm run dev` (porta 3000, proxy `/api` → `http://host.docker.internal:8000`)
- **Build**: `npm run build` (tsc + vite build)
- **Testes**: `npm run test` (Vitest + jsdom + @testing-library/react)
- **Path alias**: `@/` → `src/`
- **Alias do Vite**: `@` = `/src`
- **Serviços**: `src/services/index.ts` (axios + csrf cookie)
- **Store**: `src/store/authStore.ts` (Zustand)
- **Test setup**: `src/test/setup.ts` (inclui vitest-canvas-mock para recharts)
- **MSW**: disponível como devDependency para mock de API nos testes

## Mobile (Expo)

- **Start**: `npx expo start`
- **Plataformas**: `npx expo start --android` / `--ios` / `--web`
- **Entrypoint**: `expo-router/entry` (definido em `package.json`)
- **API URL**: `EXPO_PUBLIC_API_URL` no `.env`
- **CSRF**: gerenciado manualmente via `AsyncStorage` (salva/restaura token XSRF)

## Fluxo de dev local

1. API: `cd cash-flow-api && docker compose up -d` (MySQL + Redis + Nginx + PHP)
2. Web: `cd web && npm run dev` (porta 3000)
3. Mobile: `cd mobile && npx expo start`

## Observações

- CORS permite `localhost:3000` (web) e `localhost:8081` (expo web)
- `.env.docker` é template para Docker; `.env` é usado localmente
- Sanctum usa sessão + cookie, não token bearer
- `SESSION_DRIVER=cookie` no docker, `database` no .env local
- Testes da API sempre usam SQLite em memória (config em `phpunit.xml`)
- Web usa `withCredentials: true` e csrf-cookie antes de login/register

---

## Roadmap

### Fase 1 — Fortalecer a base (⏳ em andamento)

| Item | Status |
|---|---|
| UI de Transações Recorrentes | ⏳ Pendente |
| Editar transações/contas/categorias/orçamentos | ⏳ Pendente |
| Filtros na listagem de transações | ⏳ Pendente |

### Fase 2 — Dívidas (📅 planejado)

- Modelo de dívidas + CRUD
- Estratégias Snowball e Avalanche
- Simulador de quitação

### Fase 3 — Saúde financeira (📅 planejado)

- Metas de economia, indicadores (debt-to-income, emergency fund), score financeiro

### Fase 4 — Analytics (📅 planejado)

- Patrimônio líquido, projeções, categorização inteligente

---

## Decisões de arquitetura

- `darkMode: 'class'` no Tailwind para controle via JS
- Zustand para tema e auth (em vez de Context)
- Sidebar colapsável (64px / 240px)
- `animate-slide-up` no `<Outlet>` para transição suave
- Autenticação Sanctum SPA com cookies de sessão

## Arquivos de planejamento

- `PLANNING.md` — roadmap completo de funcionalidades
- `README.md` — documentação do projeto e instruções de dev
