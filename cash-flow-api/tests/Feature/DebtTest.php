<?php

namespace Tests\Feature;

use App\Models\Debt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebtTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_debt()
    {
        $user = $this->authenticatedUser();

        $response = $this->postJson('/api/debts', [
            'creditor' => 'Bank XYZ',
            'total_amount' => 15000.00,
            'interest_rate' => 8.5,
            'minimum_payment' => 450.00,
            'due_day' => 15,
            'start_date' => '2026-01-15',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('debt.creditor', 'Bank XYZ')
            ->assertJsonPath('debt.total_amount', 15000)
            ->assertJsonPath('debt.remaining_amount', 15000)
            ->assertJsonPath('debt.progress', 0);
    }

    public function test_user_can_list_debts()
    {
        $user = $this->authenticatedUser();

        Debt::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->getJson('/api/debts');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'debts');
    }

    public function test_user_can_show_debt()
    {
        $user = $this->authenticatedUser();
        $debt = Debt::factory()->create(['user_id' => $user->id]);

        $response = $this->getJson("/api/debts/{$debt->id}");

        $response->assertStatus(200)
            ->assertJsonPath('debt.id', $debt->id);
    }

    public function test_user_can_update_debt()
    {
        $user = $this->authenticatedUser();
        $debt = Debt::factory()->create([
            'user_id' => $user->id,
            'paid_amount' => 0,
        ]);

        $response = $this->putJson("/api/debts/{$debt->id}", [
            'paid_amount' => 5000.00,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('debt.paid_amount', 5000);
    }

    public function test_user_can_delete_debt()
    {
        $user = $this->authenticatedUser();
        $debt = Debt::factory()->create(['user_id' => $user->id]);

        $response = $this->deleteJson("/api/debts/{$debt->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('debts', ['id' => $debt->id]);
    }

    public function test_user_cannot_access_other_users_debt()
    {
        $user = $this->authenticatedUser();
        $otherUser = $this->createUser();
        $debt = Debt::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->getJson("/api/debts/{$debt->id}");

        $response->assertStatus(404);
    }

    public function test_user_can_calculate_debt_strategy()
    {
        $this->authenticatedUser();

        $response = $this->postJson('/api/debts/calculate', [
            'debts' => [
                [
                    'creditor' => 'Credit Card A',
                    'total_amount' => 5000,
                    'remaining_amount' => 5000,
                    'interest_rate' => 15.0,
                    'minimum_payment' => 150,
                ],
                [
                    'creditor' => 'Loan B',
                    'total_amount' => 10000,
                    'remaining_amount' => 10000,
                    'interest_rate' => 8.0,
                    'minimum_payment' => 300,
                ],
            ],
            'monthly_payment' => 1000,
            'strategy' => 'snowball',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('strategy', 'snowball')
            ->assertJsonStructure([
                'strategy',
                'total_months',
                'total_interest_paid',
                'debts_paid_off',
                'total_debts',
                'remaining_total',
                'schedule',
            ]);
    }

    public function test_create_debt_validation()
    {
        $this->authenticatedUser();

        $response = $this->postJson('/api/debts', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'creditor', 'total_amount', 'interest_rate',
                'minimum_payment', 'due_day', 'start_date',
            ]);
    }
}
