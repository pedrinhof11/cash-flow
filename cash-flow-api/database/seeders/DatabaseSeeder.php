<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Usuário Teste',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $categories = collect();
        $defaultCategories = [
            ['name' => 'Salário', 'type' => 'income', 'color' => '#059669', 'is_default' => true],
            ['name' => 'Freelance', 'type' => 'income', 'color' => '#10b981', 'is_default' => false],
            ['name' => 'Investimentos', 'type' => 'income', 'color' => '#3b82f6', 'is_default' => false],
            ['name' => 'Alimentação', 'type' => 'expense', 'color' => '#ef4444', 'is_default' => true],
            ['name' => 'Transporte', 'type' => 'expense', 'color' => '#f59e0b', 'is_default' => true],
            ['name' => 'Moradia', 'type' => 'expense', 'color' => '#8b5cf6', 'is_default' => false],
            ['name' => 'Saúde', 'type' => 'expense', 'color' => '#ec4899', 'is_default' => false],
            ['name' => 'Lazer', 'type' => 'expense', 'color' => '#06b6d4', 'is_default' => false],
            ['name' => 'Assinaturas', 'type' => 'expense', 'color' => '#6366f1', 'is_default' => false],
        ];

        foreach ($defaultCategories as $cat) {
            $categories->push(Category::factory()->create([
                'user_id' => $user->id,
                'name' => $cat['name'],
                'type' => $cat['type'],
                'color' => $cat['color'],
                'is_default' => $cat['is_default'],
            ]));
        }

        $accounts = collect();
        $defaultAccounts = [
            ['name' => 'Conta Corrente', 'type' => 'bank', 'initial_balance' => 5000, 'color' => '#059669'],
            ['name' => 'Dinheiro', 'type' => 'cash', 'initial_balance' => 800, 'color' => '#f59e0b'],
            ['name' => 'Cartão de Crédito', 'type' => 'credit_card', 'initial_balance' => 0, 'color' => '#ef4444'],
            ['name' => 'Investimentos', 'type' => 'investment', 'initial_balance' => 15000, 'color' => '#3b82f6'],
        ];

        foreach ($defaultAccounts as $acc) {
            $accounts->push(Account::factory()->create([
                'user_id' => $user->id,
                'name' => $acc['name'],
                'type' => $acc['type'],
                'initial_balance' => $acc['initial_balance'],
                'current_balance' => $acc['initial_balance'],
                'color' => $acc['color'],
            ]));
        }

        $incomeCategories = $categories->where('type', 'income');
        $expenseCategories = $categories->where('type', 'expense');

        $sampleTransactions = [
            ['type' => 'income', 'amount' => 5500, 'description' => 'Salário Maio', 'category' => 'Salário', 'days_ago' => 5],
            ['type' => 'income', 'amount' => 1200, 'description' => 'Projeto Freelance', 'category' => 'Freelance', 'days_ago' => 10],
            ['type' => 'income', 'amount' => 350, 'description' => 'Dividendos', 'category' => 'Investimentos', 'days_ago' => 15],
            ['type' => 'expense', 'amount' => 89.90, 'description' => 'Supermercado', 'category' => 'Alimentação', 'days_ago' => 2],
            ['type' => 'expense', 'amount' => 45.00, 'description' => 'Gasolina', 'category' => 'Transporte', 'days_ago' => 3],
            ['type' => 'expense', 'amount' => 1800, 'description' => 'Aluguel', 'category' => 'Moradia', 'days_ago' => 7],
            ['type' => 'expense', 'amount' => 250, 'description' => 'Plano de Saúde', 'category' => 'Saúde', 'days_ago' => 12],
            ['type' => 'expense', 'amount' => 120, 'description' => 'Jantar fora', 'category' => 'Lazer', 'days_ago' => 4],
            ['type' => 'expense', 'amount' => 34.90, 'description' => 'Streaming', 'category' => 'Assinaturas', 'days_ago' => 1],
        ];

        $checkingAccount = $accounts->firstWhere('name', 'Conta Corrente');

        foreach ($sampleTransactions as $tx) {
            $category = $categories->firstWhere('name', $tx['category']);
            Transaction::factory()->create([
                'user_id' => $user->id,
                'account_id' => $checkingAccount->id,
                'category_id' => $category->id,
                'type' => $tx['type'],
                'amount' => $tx['amount'],
                'description' => $tx['description'],
                'date' => now()->subDays($tx['days_ago'])->format('Y-m-d'),
            ]);
        }

        $alimentacao = $categories->firstWhere('name', 'Alimentação');
        Budget::factory()->create([
            'user_id' => $user->id,
            'category_id' => $alimentacao->id,
            'amount' => 1200,
            'period' => 'monthly',
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->endOfMonth()->toDateString(),
        ]);

        $assinaturas = $categories->firstWhere('name', 'Assinaturas');
        RecurringTransaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $checkingAccount->id,
            'category_id' => $assinaturas->id,
            'type' => 'expense',
            'amount' => 34.90,
            'description' => 'Streaming',
            'frequency' => 'monthly',
            'start_date' => now()->subMonths(6)->toDateString(),
            'next_due' => now()->addDays(5)->toDateString(),
            'is_active' => true,
        ]);
    }
}
