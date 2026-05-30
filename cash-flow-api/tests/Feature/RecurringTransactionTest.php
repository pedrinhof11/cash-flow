<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\RecurringTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecurringTransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_recurring_transaction()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);
        $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);

        $response = $this->postJson('/api/recurring', [
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 100.00,
            'description' => 'Monthly Subscription',
            'frequency' => 'monthly',
            'start_date' => now()->toDateString(),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('recurring_transaction.description', 'Monthly Subscription')
            ->assertJsonPath('recurring_transaction.frequency', 'monthly')
            ->assertJsonPath('recurring_transaction.is_active', true);
    }

    public function test_user_can_list_recurring_transactions()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);

        RecurringTransaction::factory()->count(3)->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
        ]);

        $response = $this->getJson('/api/recurring');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'recurring_transactions');
    }

    public function test_user_can_update_recurring_transaction()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);
        $recurring = RecurringTransaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'amount' => 50,
        ]);

        $response = $this->putJson("/api/recurring/{$recurring->id}", [
            'amount' => 150.00,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('recurring_transaction.amount', '150.00');
    }

    public function test_user_can_skip_recurring_transaction()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);
        $recurring = RecurringTransaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'frequency' => 'monthly',
            'next_due' => now()->toDateString(),
        ]);

        $response = $this->postJson("/api/recurring/{$recurring->id}/skip");

        $response->assertStatus(200);

        $recurring->refresh();
        $this->assertEquals(now()->addMonth()->format('Y-m-d'), $recurring->next_due->format('Y-m-d'));
    }

    public function test_user_can_deactivate_recurring_transaction()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);
        $recurring = RecurringTransaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'is_active' => true,
        ]);

        $response = $this->putJson("/api/recurring/{$recurring->id}", [
            'is_active' => false,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('recurring_transaction.is_active', false);
    }

    public function test_user_can_delete_recurring_transaction()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);
        $recurring = RecurringTransaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
        ]);

        $response = $this->deleteJson("/api/recurring/{$recurring->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('recurring_transactions', ['id' => $recurring->id]);
    }

    public function test_frequency_validation()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);

        $response = $this->postJson('/api/recurring', [
            'account_id' => $account->id,
            'type' => 'expense',
            'amount' => 100,
            'frequency' => 'invalid',
            'start_date' => now()->toDateString(),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['frequency']);
    }

    public function test_cannot_skip_inactive_recurring()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);
        $recurring = RecurringTransaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'is_active' => false,
            'next_due' => now()->toDateString(),
        ]);

        $response = $this->postJson("/api/recurring/{$recurring->id}/skip");

        $response->assertStatus(422);
    }
}
