<?php

namespace App\Repositories;

use App\Contracts\DebtRepositoryInterface;
use App\DTOs\CreateDebtDTO;
use App\DTOs\DebtResponseDTO;
use App\Models\Debt;

class EloquentDebtRepository implements DebtRepositoryInterface
{
    public function findById(int $id): ?DebtResponseDTO
    {
        $debt = Debt::find($id);
        return $debt ? DebtResponseDTO::fromModel($debt) : null;
    }

    public function findByUser(int $userId): array
    {
        return Debt::where('user_id', $userId)
            ->orderBy('due_day')
            ->get()
            ->map(fn (Debt $debt) => DebtResponseDTO::fromModel($debt))
            ->toArray();
    }

    public function save(CreateDebtDTO $dto): DebtResponseDTO
    {
        $debt = Debt::create([
            'user_id' => $dto->userId,
            'creditor' => $dto->creditor,
            'total_amount' => $dto->totalAmount,
            'interest_rate' => $dto->interestRate,
            'minimum_payment' => $dto->minimumPayment,
            'due_day' => $dto->dueDay,
            'start_date' => $dto->startDate,
            'notes' => $dto->notes,
            'paid_amount' => $dto->paidAmount,
        ]);

        return DebtResponseDTO::fromModel($debt);
    }

    public function update(int $id, array $data): DebtResponseDTO
    {
        $debt = Debt::findOrFail($id);
        $debt->update($data);
        $debt->refresh();
        return DebtResponseDTO::fromModel($debt);
    }

    public function delete(int $id): void
    {
        Debt::where('id', $id)->delete();
    }

    public function findModelById(int $id): ?Debt
    {
        return Debt::find($id);
    }
}
