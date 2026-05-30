<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_income_transaction()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id, 'current_balance' => 0]);

        $response = $this->postJson('/api/transactions', [
            'account_id' => $account->id,
            'type' => 'income',
            'amount' => 5000.00,
            'date' => now()->toDateString(),
            'description' => 'Salary',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('transaction.type', 'income')
            ->assertJsonPath('transaction.amount', '5000.00');

        $account->refresh();
        $this->assertEquals('5000.00', $account->current_balance);
    }

    public function test_user_can_create_expense_transaction()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id, 'current_balance' => 5000]);

        $response = $this->postJson('/api/transactions', [
            'account_id' => $account->id,
            'type' => 'expense',
            'amount' => 200.00,
            'date' => now()->toDateString(),
            'description' => 'Groceries',
        ]);

        $response->assertStatus(201);

        $account->refresh();
        $this->assertEquals('4800.00', $account->current_balance);
    }

    public function test_user_can_create_transfer_transaction()
    {
        $user = $this->authenticatedUser();
        $fromAccount = Account::factory()->create(['user_id' => $user->id, 'current_balance' => 5000]);
        $toAccount = Account::factory()->create(['user_id' => $user->id, 'current_balance' => 1000]);

        $response = $this->postJson('/api/transactions', [
            'account_id' => $fromAccount->id,
            'type' => 'transfer',
            'amount' => 1000.00,
            'date' => now()->toDateString(),
            'transfer_to_account_id' => $toAccount->id,
        ]);

        $response->assertStatus(201);

        $fromAccount->refresh();
        $toAccount->refresh();
        $this->assertEquals('4000.00', $fromAccount->current_balance);
        $this->assertEquals('2000.00', $toAccount->current_balance);
    }

    public function test_deleting_transaction_reverses_balance()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id, 'current_balance' => 5000]);
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'type' => 'income',
            'amount' => 1000,
            'date' => now()->toDateString(),
        ]);

        $account->refresh();
        $this->assertEquals('5000.00', $account->current_balance);

        $response = $this->deleteJson("/api/transactions/{$transaction->id}");

        $response->assertStatus(200);
        $account->refresh();
        $this->assertEquals('4000.00', $account->current_balance);
    }

    public function test_user_can_get_transactions_summary()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);
        $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'type' => 'income',
            'amount' => 10000,
            'date' => now()->toDateString(),
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 3000,
            'date' => now()->toDateString(),
        ]);

        $response = $this->getJson('/api/transactions/summary');

        $response->assertStatus(200)
            ->assertJsonPath('total_income', 10000)
            ->assertJsonPath('total_expense', 3000)
            ->assertJsonPath('balance', 7000);
    }

    public function test_user_can_list_transactions_with_filters()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);
        $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'type' => 'income',
            'amount' => 5000,
            'date' => now()->toDateString(),
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'type' => 'expense',
            'amount' => 200,
            'date' => now()->toDateString(),
            'category_id' => $category->id,
        ]);

        $response = $this->getJson('/api/transactions?type=income');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_transaction_validation()
    {
        $this->authenticatedUser();

        $response = $this->postJson('/api/transactions', [
            'account_id' => 999,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type', 'amount', 'date']);
    }
}
