<?php

namespace Tests\Unit\Actions;

use App\Actions\CreateDebtAction;
use App\Contracts\DebtRepositoryInterface;
use App\DTOs\CreateDebtDTO;
use App\DTOs\DebtResponseDTO;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class CreateDebtActionTest extends TestCase
{
    public function test_execute_with_valid_data_creates_debt(): void
    {
        $dto = new CreateDebtDTO(
            userId: 1,
            creditor: 'Bank XYZ',
            totalAmount: 10000.00,
            interestRate: 5.5,
            minimumPayment: 300.00,
            dueDay: 15,
            startDate: '2026-01-01',
        );

        $expectedDTO = new DebtResponseDTO(
            id: 1,
            userId: 1,
            creditor: 'Bank XYZ',
            totalAmount: 10000.00,
            interestRate: 5.5,
            minimumPayment: 300.00,
            paidAmount: 0,
            remainingAmount: 10000.00,
            progress: 0,
            dueDay: 15,
            startDate: '2026-01-01',
            notes: null,
            createdAt: '2026-05-29T00:00:00.000000Z',
            updatedAt: '2026-05-29T00:00:00.000000Z',
        );

        $repo = Mockery::mock(DebtRepositoryInterface::class);
        $repo->shouldReceive('save')
            ->once()
            ->with(Mockery::type(CreateDebtDTO::class))
            ->andReturn($expectedDTO);

        $action = new CreateDebtAction($repo);
        $result = $action->execute($dto);

        $this->assertInstanceOf(DebtResponseDTO::class, $result);
        $this->assertEquals('Bank XYZ', $result->creditor);
        $this->assertEquals(10000.0, $result->totalAmount);
    }
}
