<?php

namespace App\UseCases;

use App\Actions\CreateBudgetAction;
use App\Actions\DeleteBudgetAction;
use App\Actions\UpdateBudgetAction;
use App\Contracts\BudgetRepositoryInterface;
use App\DTOs\BudgetResponseDTO;
use App\DTOs\CreateBudgetDTO;

class BudgetUseCase
{
    public function __construct(
        private BudgetRepositoryInterface $repository,
        private CreateBudgetAction $createAction,
        private UpdateBudgetAction $updateAction,
        private DeleteBudgetAction $deleteAction,
    ) {}

    public function list(int $userId, array $filters = []): array
    {
        return $this->repository->findByUser($userId, $filters);
    }

    public function find(int $id): ?BudgetResponseDTO
    {
        return $this->repository->findById($id);
    }

    public function create(CreateBudgetDTO $dto): BudgetResponseDTO
    {
        return $this->createAction->execute($dto);
    }

    public function update(int $id, array $data): BudgetResponseDTO
    {
        return $this->updateAction->execute($id, $data);
    }

    public function delete(int $id): void
    {
        $this->deleteAction->execute($id);
    }

    public function current(int $userId): array
    {
        $budgets = $this->repository->findCurrentByUser($userId);
        if (empty($budgets)) return [];

        return array_map(function (BudgetResponseDTO $budget) use ($userId) {
            $spent = $this->repository->getSpentAmount(
                $userId,
                $budget->categoryId,
                $budget->startDate,
                $budget->endDate
            );
            $amount = (float) $budget->amount;
            $remaining = $amount - $spent;
            $percentage = $amount > 0 ? min(100, ($spent / $amount) * 100) : 0;
            $overBudget = $spent > $amount;

            return $budget->withSpent($spent, $remaining, $percentage, $overBudget);
        }, $budgets);
    }
}
