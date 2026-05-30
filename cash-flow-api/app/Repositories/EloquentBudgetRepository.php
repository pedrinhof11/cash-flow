<?php

namespace App\Repositories;

use App\Contracts\BudgetRepositoryInterface;
use App\DTOs\BudgetResponseDTO;
use App\DTOs\CreateBudgetDTO;
use App\Models\Budget;
use Illuminate\Database\QueryException;

class EloquentBudgetRepository implements BudgetRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): array
    {
        $query = Budget::where('user_id', $userId)->with('category');

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['period'])) {
            $query->where('period', $filters['period']);
        }

        if (!empty($filters['current'])) {
            $query->current();
        }

        return $query->orderBy('start_date', 'desc')
            ->get()
            ->map(fn (Budget $b) => BudgetResponseDTO::fromModel($b))
            ->toArray();
    }

    public function findById(int $id): ?BudgetResponseDTO
    {
        $budget = Budget::with('category')->find($id);
        return $budget ? BudgetResponseDTO::fromModel($budget) : null;
    }

    public function findModelById(int $id): ?Budget
    {
        return Budget::find($id);
    }

    public function save(CreateBudgetDTO $dto): BudgetResponseDTO
    {
        try {
            $budget = Budget::create([
                'user_id' => $dto->userId,
                'category_id' => $dto->categoryId,
                'amount' => $dto->amount,
                'period' => $dto->period,
                'start_date' => $dto->startDate,
                'end_date' => $dto->endDate,
            ]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                throw new \RuntimeException('Budget already exists for this category and period');
            }
            throw $e;
        }

        return BudgetResponseDTO::fromModel($budget->load('category'));
    }

    public function update(int $id, array $data): BudgetResponseDTO
    {
        $budget = Budget::findOrFail($id);
        $budget->update($data);
        $budget->refresh();
        return BudgetResponseDTO::fromModel($budget->load('category'));
    }

    public function delete(int $id): void
    {
        Budget::where('id', $id)->delete();
    }

    public function findCurrentByUser(int $userId): array
    {
        return Budget::where('user_id', $userId)
            ->with('category')
            ->current()
            ->get()
            ->map(fn (Budget $b) => BudgetResponseDTO::fromModel($b))
            ->toArray();
    }

    public function getSpentAmount(int $userId, int $categoryId, string $start, ?string $end): float
    {
        $query = \App\Models\Transaction::where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->where('type', 'expense')
            ->whereBetween('date', [$start, $end ?? now()]);

        return (float) $query->sum('amount');
    }
}
