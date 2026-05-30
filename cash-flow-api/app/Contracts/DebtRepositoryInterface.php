<?php

namespace App\Contracts;

use App\DTOs\CreateDebtDTO;
use App\DTOs\DebtResponseDTO;

interface DebtRepositoryInterface
{
    public function findById(int $id): ?DebtResponseDTO;
    public function findByUser(int $userId): array;
    public function save(CreateDebtDTO $dto): DebtResponseDTO;
    public function update(int $id, array $data): DebtResponseDTO;
    public function delete(int $id): void;
    public function findModelById(int $id): ?\App\Models\Debt;
}
