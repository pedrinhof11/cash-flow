<?php

namespace Tests\Unit\Actions;

use App\Actions\CalculateDebtStrategyAction;
use Tests\TestCase;

class CalculateDebtStrategyActionTest extends TestCase
{
    private CalculateDebtStrategyAction $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = new CalculateDebtStrategyAction();
    }

    public function test_snowball_sorts_by_lowest_balance_first(): void
    {
        $debts = [
            [
                'creditor' => 'Big Debt',
                'total_amount' => 50000,
                'remaining_amount' => 50000,
                'interest_rate' => 5.0,
                'minimum_payment' => 500,
            ],
            [
                'creditor' => 'Small Debt',
                'total_amount' => 2000,
                'remaining_amount' => 2000,
                'interest_rate' => 15.0,
                'minimum_payment' => 100,
            ],
            [
                'creditor' => 'Medium Debt',
                'total_amount' => 10000,
                'remaining_amount' => 10000,
                'interest_rate' => 10.0,
                'minimum_payment' => 200,
            ],
        ];

        $result = $this->action->execute($debts, 1000, 'snowball');

        $this->assertEquals('snowball', $result['strategy']);
        $this->assertGreaterThan(0, $result['total_months']);
        $this->assertGreaterThan(0, $result['total_interest_paid']);
    }

    public function test_avalanche_sorts_by_highest_interest_first(): void
    {
        $debts = [
            [
                'creditor' => 'Low Interest',
                'total_amount' => 10000,
                'remaining_amount' => 10000,
                'interest_rate' => 5.0,
                'minimum_payment' => 200,
            ],
            [
                'creditor' => 'High Interest',
                'total_amount' => 5000,
                'remaining_amount' => 5000,
                'interest_rate' => 25.0,
                'minimum_payment' => 150,
            ],
        ];

        $result = $this->action->execute($debts, 800, 'avalanche');

        $this->assertEquals('avalanche', $result['strategy']);
        $this->assertGreaterThan(0, $result['total_months']);
    }

    public function test_returns_result_structure(): void
    {
        $debts = [
            [
                'creditor' => 'Test Debt',
                'total_amount' => 5000,
                'remaining_amount' => 5000,
                'interest_rate' => 10.0,
                'minimum_payment' => 100,
            ],
        ];

        $result = $this->action->execute($debts, 500, 'snowball');

        $this->assertArrayHasKey('strategy', $result);
        $this->assertArrayHasKey('total_months', $result);
        $this->assertArrayHasKey('total_interest_paid', $result);
        $this->assertArrayHasKey('debts_paid_off', $result);
        $this->assertArrayHasKey('total_debts', $result);
        $this->assertArrayHasKey('remaining_total', $result);
        $this->assertArrayHasKey('schedule', $result);
    }
}
