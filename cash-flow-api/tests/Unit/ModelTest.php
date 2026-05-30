<?php

namespace Tests\Unit;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_relationships()
    {
        $user = User::factory()->create();
        Account::factory()->count(2)->create(['user_id' => $user->id]);

        $this->assertCount(2, $user->accounts);
        $this->assertInstanceOf(Account::class, $user->accounts->first());
    }

    public function test_account_belongs_to_user()
    {
        $user = User::factory()->create();
        $account = Account::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $account->user);
        $this->assertEquals($user->id, $account->user->id);
    }

    public function test_account_has_transactions()
    {
        $account = Account::factory()->create();
        Transaction::factory()->count(3)->create(['account_id' => $account->id]);

        $this->assertCount(3, $account->transactions);
    }

    public function test_category_has_parent_child_relationship()
    {
        $parent = Category::factory()->create();
        $child = Category::factory()->create(['parent_id' => $parent->id]);

        $this->assertInstanceOf(Category::class, $child->parent);
        $this->assertEquals($parent->id, $child->parent->id);
        $this->assertCount(1, $parent->children);
    }

    public function test_budget_calculates_spent_amount()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);
        $account = Account::factory()->create(['user_id' => $user->id]);

        $budget = Budget::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 1000,
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->endOfMonth()->toDateString(),
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 300,
            'date' => now()->toDateString(),
        ]);

        $this->assertEquals(300, $budget->getSpentAmount());
        $this->assertEquals(700, $budget->getRemainingAmount());
        $this->assertEquals(30, $budget->getPercentageUsed());
        $this->assertFalse($budget->isOverBudget());
    }

    public function test_budget_detects_over_budget()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create(['user_id' => $user->id, 'type' => 'expense']);
        $account = Account::factory()->create(['user_id' => $user->id]);

        $budget = Budget::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 100,
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->endOfMonth()->toDateString(),
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category->id,
            'type' => 'expense',
            'amount' => 150,
            'date' => now()->toDateString(),
        ]);

        $this->assertTrue($budget->isOverBudget());
    }

    public function test_recurring_transaction_calculates_next_due()
    {
        $recurring = RecurringTransaction::factory()->create([
            'frequency' => 'monthly',
            'next_due' => '2026-01-15',
        ]);

        $next = $recurring->calculateNextDue();
        $this->assertEquals('2026-02-15', $next->format('Y-m-d'));
    }

    public function test_recurring_transaction_weekly_frequency()
    {
        $recurring = RecurringTransaction::factory()->create([
            'frequency' => 'weekly',
            'next_due' => '2026-01-15',
        ]);

        $next = $recurring->calculateNextDue();
        $this->assertEquals('2026-01-22', $next->format('Y-m-d'));
    }

    public function test_recurring_transaction_stops_at_end_date()
    {
        $recurring = RecurringTransaction::factory()->create([
            'next_due' => '2026-06-01',
            'end_date' => '2026-05-01',
        ]);

        $this->assertTrue($recurring->shouldStopRecurring());
    }

    public function test_recurring_transaction_stops_when_occurrences_depleted()
    {
        $recurring = RecurringTransaction::factory()->create([
            'occurrences_left' => 0,
        ]);

        $this->assertTrue($recurring->shouldStopRecurring());
    }

    public function test_recurring_transaction_continues_when_not_depleted()
    {
        $recurring = RecurringTransaction::factory()->create([
            'occurrences_left' => 5,
            'end_date' => null,
        ]);

        $this->assertFalse($recurring->shouldStopRecurring());
    }

    public function test_transaction_scopes()
    {
        $user = User::factory()->create();
        $account = Account::factory()->create(['user_id' => $user->id]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'type' => 'income',
            'amount' => 1000,
            'date' => '2026-01-15',
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'type' => 'expense',
            'amount' => 500,
            'date' => '2026-02-15',
        ]);

        $this->assertCount(1, Transaction::income()->get());
        $this->assertCount(1, Transaction::expense()->get());
        $this->assertCount(1, Transaction::byDateRange('2026-01-01', '2026-01-31')->get());
    }

    public function test_soft_deletes_work_on_accounts()
    {
        $account = Account::factory()->create();
        $account->delete();

        $this->assertSoftDeleted('accounts', ['id' => $account->id]);
        $this->assertNull(Account::find($account->id));
        $this->assertNotNull(Account::withTrashed()->find($account->id));
    }
}
