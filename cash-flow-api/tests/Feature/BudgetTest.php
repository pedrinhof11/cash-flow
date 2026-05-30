<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_budget()
    {
        $user = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);

        $response = $this->postJson('/api/budgets', [
            'category_id' => $category->id,
            'amount' => 1000.00,
            'period' => 'monthly',
            'start_date' => now()->startOfMonth()->toDateString(),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('budget.amount', '1000.00');
    }

    public function test_user_can_list_budgets()
    {
        $user = $this->authenticatedUser();
        $category1 = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);
        $category2 = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);
        Budget::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category1->id,
            'period' => 'monthly',
            'start_date' => now()->startOfMonth()->toDateString(),
        ]);
        Budget::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category2->id,
            'period' => 'weekly',
            'start_date' => now()->startOfMonth()->toDateString(),
        ]);

        $response = $this->getJson('/api/budgets');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'budgets');
    }

    public function test_user_can_get_current_budgets_with_spent()
    {
        $user = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);
        $account = Account::factory()->create(['user_id' => $user->id]);

        $budget = Budget::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 1000.00,
            'period' => 'monthly',
            'start_date' => now()->startOfMonth()->toDateString(),
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 400.00,
            'date' => now()->toDateString(),
        ]);

        $response = $this->getJson('/api/budgets/current');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'budgets')
            ->assertJsonPath('budgets.0.spent', 400)
            ->assertJsonPath('budgets.0.remaining', 600)
            ->assertJsonPath('budgets.0.is_over_budget', false);
    }

    public function test_budget_detects_over_budget()
    {
        $user = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);
        $account = Account::factory()->create(['user_id' => $user->id]);

        Budget::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 100.00,
            'period' => 'monthly',
            'start_date' => now()->startOfMonth()->toDateString(),
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 150.00,
            'date' => now()->toDateString(),
        ]);

        $response = $this->getJson('/api/budgets/current');

        $response->assertStatus(200)
            ->assertJsonPath('budgets.0.is_over_budget', true)
            ->assertJsonPath('budgets.0.percentage_used', 100);
    }

    public function test_user_can_update_budget()
    {
        $user = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);
        $budget = Budget::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 500,
            'period' => 'monthly',
            'start_date' => now()->startOfMonth()->toDateString(),
        ]);

        $response = $this->putJson("/api/budgets/{$budget->id}", [
            'amount' => 2000.00,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('budget.amount', '2000.00');
    }

    public function test_user_can_delete_budget()
    {
        $user = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);
        $budget = Budget::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'period' => 'monthly',
            'start_date' => now()->startOfMonth()->toDateString(),
        ]);

        $response = $this->deleteJson("/api/budgets/{$budget->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('budgets', ['id' => $budget->id]);
    }

    public function test_budget_period_validation()
    {
        $user = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);

        $response = $this->postJson('/api/budgets', [
            'category_id' => $category->id,
            'amount' => 1000,
            'period' => 'invalid',
            'start_date' => now()->toDateString(),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['period']);
    }
}
