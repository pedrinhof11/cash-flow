<?php

namespace App\Repositories;

use App\Contracts\RecurringTransactionRepositoryInterface;
use App\DTOs\CreateRecurringTransactionDTO;
use App\DTOs\RecurringTransactionResponseDTO;
use App\Models\RecurringTransaction;

class EloquentRecurringTransactionRepository implements RecurringTransactionRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): array
    {
        $query = RecurringTransaction::where('user_id', $userId)
            ->with(['account', 'category']);

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['frequency'])) {
            $query->where('frequency', $filters['frequency']);
        }

        if (!empty($filters['active_only'])) {
            $query->active();
        }

        return $query->orderBy('next_due', 'asc')
            ->get()
            ->map(fn (RecurringTransaction $rt) => RecurringTransactionResponseDTO::fromModel($rt))
            ->toArray();
    }

    public function findById(int $id): ?RecurringTransactionResponseDTO
    {
        $rt = RecurringTransaction::with(['account', 'category'])->find($id);
        return $rt ? RecurringTransactionResponseDTO::fromModel($rt) : null;
    }

    public function findModelById(int $id): ?RecurringTransaction
    {
        return RecurringTransaction::with(['account', 'category'])->find($id);
    }

    public function save(CreateRecurringTransactionDTO $dto): RecurringTransactionResponseDTO
    {
        $rt = RecurringTransaction::create([
            'user_id' => $dto->userId,
            'account_id' => $dto->accountId,
            'category_id' => $dto->categoryId,
            'type' => $dto->type,
            'amount' => $dto->amount,
            'description' => $dto->description,
            'frequency' => $dto->frequency,
            'day_of_month' => $dto->dayOfMonth,
            'start_date' => $dto->startDate,
            'end_date' => $dto->endDate,
            'next_due' => $dto->startDate,
            'occurrences' => $dto->occurrences,
            'occurrences_left' => $dto->occurrences,
            'is_active' => true,
        ]);

        return RecurringTransactionResponseDTO::fromModel($rt->load(['account', 'category']));
    }

    public function update(int $id, array $data): RecurringTransactionResponseDTO
    {
        $rt = RecurringTransaction::findOrFail($id);
        $rt->update($data);
        $rt->refresh();
        return RecurringTransactionResponseDTO::fromModel($rt->load(['account', 'category']));
    }

    public function delete(int $id): void
    {
        RecurringTransaction::where('id', $id)->delete();
    }
}
