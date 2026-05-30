<?php

namespace App\Contracts;

use App\DTOs\BudgetResponseDTO;
use App\DTOs\CreateBudgetDTO;

interface BudgetRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): array;
    public function findById(int $id): ?BudgetResponseDTO;
    public function findModelById(int $id): ?\App\Models\Budget;
    public function save(CreateBudgetDTO $dto): BudgetResponseDTO;
    public function update(int $id, array $data): BudgetResponseDTO;
    public function delete(int $id): void;
    public function findCurrentByUser(int $userId): array;
    public function getSpentAmount(int $userId, int $categoryId, string $start, ?string $end): float;
}
