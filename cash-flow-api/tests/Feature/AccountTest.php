<?php

namespace Tests\Feature;

use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_account()
    {
        $user = $this->authenticatedUser();

        $response = $this->postJson('/api/accounts', [
            'name' => 'Main Account',
            'type' => 'bank',
            'initial_balance' => 1000.00,
            'currency' => 'BRL',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('account.name', 'Main Account')
            ->assertJsonPath('account.current_balance', '1000.00');

        $this->assertDatabaseHas('accounts', ['name' => 'Main Account', 'user_id' => $user->id]);
    }

    public function test_user_can_list_their_accounts()
    {
        $user = $this->authenticatedUser();
        Account::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->getJson('/api/accounts');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'accounts');
    }

    public function test_user_cannot_see_other_users_accounts()
    {
        $this->authenticatedUser();
        $otherUser = $this->createUser();
        Account::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->getJson('/api/accounts');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'accounts');
    }

    public function test_user_can_update_account()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);

        $response = $this->putJson("/api/accounts/{$account->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('account.name', 'Updated Name');
    }

    public function test_user_cannot_update_other_users_account()
    {
        $this->authenticatedUser();
        $otherUser = $this->createUser();
        $account = Account::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->putJson("/api/accounts/{$account->id}", [
            'name' => 'Hacked',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_can_delete_account()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id]);

        $response = $this->deleteJson("/api/accounts/{$account->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('accounts', ['id' => $account->id]);
    }

    public function test_cannot_delete_account_with_transactions()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create(['user_id' => $user->id, 'current_balance' => 500]);

        $this->postJson('/api/transactions', [
            'account_id' => $account->id,
            'type' => 'income',
            'amount' => 100,
            'date' => now()->toDateString(),
        ]);

        $response = $this->deleteJson("/api/accounts/{$account->id}");

        $response->assertStatus(422);
    }

    public function test_can_get_account_balance()
    {
        $user = $this->authenticatedUser();
        $account = Account::factory()->create([
            'user_id' => $user->id,
            'current_balance' => 2500.50,
        ]);

        $response = $this->getJson("/api/accounts/{$account->id}/balance");

        $response->assertStatus(200)
            ->assertJsonPath('current_balance', '2500.50');
    }

    public function test_account_validation_requires_name_and_type()
    {
        $this->authenticatedUser();

        $response = $this->postJson('/api/accounts', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'type']);
    }
}
