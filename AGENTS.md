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

### Padrões de desenvolvimento da API

Toda nova funcionalidade deve seguir os padrões abaixo. O objetivo é ter código testável, desacoplado e aderente aos princípios SOLID.

#### Arquitetura em camadas

```
Controller  →  UseCase  →  Action(s)  →  Repository  →  Model (Eloquent)
    │
    ├── Request (DTO / FormRequest com validação)
    └── Resource (API Resource para resposta)
```

#### SOLID

- **S** — Cada classe tem uma única responsabilidade (ex: `CreateTransactionAction` só cria transação)
- **O** — Aberto para extensão, fechado para modificação (use interfaces para repositories)
- **L** — Subtipos devem ser substituíveis por seus tipos base
- **I** — Interfaces segregadas por contexto (ex: `TransactionRepositoryInterface`, `AccountRepositoryInterface`)
- **D** — Dependa de abstrações, não de concreções (injeção de dependência via interfaces)

#### Actions

- Uma classe por ação atômica de negócio
- Exemplos: `CreateTransactionAction`, `CalculateBudgetSpentAction`, `ProcessRecurringAction`
- Não dependem diretamente de Eloquent, Request, ou outras camadas do Laravel
- Recebem DTOs como entrada e retornam DTOs ou valores primitivos
- Contém **apenas regra de negócio pura**, sem efeitos colaterais de framework
- São injectadas nos UseCases via construtor

```php
class CreateTransactionAction
{
    public function __construct(
        private TransactionRepositoryInterface $repository,
        private UpdateAccountBalanceAction $updateBalance,
    ) {}

    public function execute(CreateTransactionDTO $dto): TransactionDTO { … }
}
```

#### Use Cases

- Orquestram múltiplas Actions para completar um fluxo de negócio
- Exemplos: `RegisterUserUseCase`, `TransferBetweenAccountsUseCase`
- Fazem a coordenação, transações de banco e logging
- São a camada que o Controller chama

#### DTOs (Data Transfer Objects)

- Imutáveis (readonly properties ou `__construct` com propriedades tipadas)
- Representam dados de entrada e saída de Actions/UseCases
- Exemplos: `CreateTransactionDTO`, `TransactionResponseDTO`, `DebtSimulationDTO`
- Não têm dependências de framework
- Podem ser construídos a partir de FormRequests ou arrays

```php
class CreateTransactionDTO
{
    public function __construct(
        public readonly int $accountId,
        public readonly string $type,
        public readonly float $amount,
        public readonly ?int $categoryId,
        public readonly ?string $description,
        public readonly string $date,
    ) {}
}
```

#### Repositories

- Interface + Implementação concreta (ex: `TransactionRepositoryInterface` + `EloquentTransactionRepository`)
- **Interface** define o contrato (agnóstica à implementação)
- **Implementação** usa Eloquent internamente, mas expõe DTOs/Model apenas dentro da camada de dados
- São registrados no container via `AppServiceProvider` com `$this->app->bind(Interface::class, Concrete::class)`

```php
interface TransactionRepositoryInterface
{
    public function findById(int $id): ?TransactionDTO;
    public function findByUser(int $userId, array $filters = []): array;
    public function save(CreateTransactionDTO $dto): TransactionDTO;
    public function delete(int $id): void;
    public function sumByCategory(int $userId, int $categoryId, string $start, string $end): float;
}
```

```php
class EloquentTransactionRepository implements TransactionRepositoryInterface
{
    public function save(CreateTransactionDTO $dto): TransactionDTO
    {
        $model = Transaction::create([…]);
        return TransactionDTO::fromModel($model);
    }
}
```

#### API Resources

- Toda controller retorna dados via **API Resource** (Laravel `JsonResource`)
- Resources transformam modelos/DTOs em JSON padronizado
- Exemplos: `TransactionResource`, `AccountResource`, `BudgetResource`
- Usar `Resource::collection()` para listas

```php
class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'amount' => $this->amount,
            'description' => $this->description,
            'date' => $this->date,
            'account' => new AccountResource($this->whenLoaded('account')),
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}
```

#### Controllers

- **Magras**: só recebem a request, delegam para o UseCase e retornam Resource
- Fazem validação via FormRequest
- Não contêm regra de negócio

```php
class TransactionController extends Controller
{
    public function __construct(private CreateTransactionUseCase $useCase) {}

    public function store(StoreTransactionRequest $request): TransactionResource
    {
        $dto = CreateTransactionDTO::fromRequest($request);
        $result = $this->useCase->execute($dto);
        return new TransactionResource($result);
    }
}
```

#### Testes

- **Unit tests**: testam Actions, UseCases, Repositories e DTOs isoladamente
- Usar `Mockery` ou `PHPUnit mocks` para simular dependências (repositories, actions)
- **Feature tests**: testam a integração Controller → UseCase → Action → Repository
- Utilizar `RefreshDatabase` ou `DatabaseTransactions` nos tests de integração
- Nomear testes no padrão: `method_scenario_expectedResult` ou Gherkin descritivo

```php
class CreateTransactionActionTest extends TestCase
{
    public function test_execute_with_valid_data_creates_transaction(): void
    {
        $repo = Mockery::mock(TransactionRepositoryInterface::class);
        $repo->shouldReceive('save')->once()->andReturn($expectedDTO);
        $action = new CreateTransactionAction($repo, $this->mockBalanceUpdate());
        $result = $action->execute($dto);
        $this->assertEquals($expectedDTO, $result);
    }
}
```

#### Estrutura de diretórios esperada

```
app/
├── Actions/
│   ├── CreateTransactionAction.php
│   ├── UpdateAccountBalanceAction.php
│   └── CalculateBudgetSpentAction.php
├── UseCases/
│   ├── CreateTransactionUseCase.php
│   ├── TransferBetweenAccountsUseCase.php
│   └── RegisterUserUseCase.php
├── DTOs/
│   ├── CreateTransactionDTO.php
│   ├── TransactionResponseDTO.php
│   └── DebtSimulationDTO.php
├── Contracts/ (ou Interfaces/ ou Repositories/)
│   ├── TransactionRepositoryInterface.php
│   └── AccountRepositoryInterface.php
├── Repositories/
│   ├── EloquentTransactionRepository.php
│   └── EloquentAccountRepository.php
├── Http/
│   ├── Controllers/Api/
│   ├── Requests/       (FormRequests)
│   └── Resources/      (API Resources)
├── Models/
└── Services/           (apenas se fizer sentido ter serviços que Actions/UseCases compartilham)

tests/
├── Unit/
│   ├── Actions/
│   ├── UseCases/
│   ├── DTOs/
│   └── Repositories/
└── Feature/
    └── Controllers/
```

#### Regras gerais

- Actions/UseCases **nunca** devem estender classes do Laravel (são classes Puras/POPO)
- Repositories **nunca** devem ser injetados diretamente em Controllers — sempre passe por UseCase
- DTOs são imutáveis (`readonly` properties)
- Evite `Facades` e `Helpers` dentro de Actions/UseCases (injetar dependências explicitamente)
- Toda nova funcionalidade deve vir acompanhada de testes unitários da sua Action/UseCase principal
- Para criar uma nova feature: DTO → Interface → Repository → Action → UseCase → Resource → Request → Controller → Route → Test

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

Consulte [PLANNING.md](./PLANNING.md) para o roadmap completo.

### Fase 1 — Fortalecer a base (✅ concluído)
- UI de Transações Recorrentes
- Editar transações/contas/categorias/orçamentos
- Filtros na listagem de transações

### Fase 2 — Dívidas (✅ concluído)
- Modelo de dívidas + Snowball/Avalanche + simulador

### Fase 3 — Saúde financeira (📅 planejado)
- Metas, indicadores, score financeiro

### Fase 4 — Analytics (📅 planejado)
- Patrimônio líquido, projeções, categorização inteligente

## Decisões de arquitetura

- `darkMode: 'class'` no Tailwind para controle via JS
- Zustand para tema e auth (em vez de Context)
- Sidebar colapsável (64px / 240px)
- Autenticação Sanctum SPA com cookies de sessão
- Login sem `window.location.href` — usa React Router + estado do TanStack Query
