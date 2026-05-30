<?php

namespace App\Contracts;

use App\DTOs\CreateRecurringTransactionDTO;
use App\DTOs\RecurringTransactionResponseDTO;

interface RecurringTransactionRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): array;
    public function findById(int $id): ?RecurringTransactionResponseDTO;
    public function findModelById(int $id): ?\App\Models\RecurringTransaction;
    public function save(CreateRecurringTransactionDTO $dto): RecurringTransactionResponseDTO;
    public function update(int $id, array $data): RecurringTransactionResponseDTO;
    public function delete(int $id): void;
}
