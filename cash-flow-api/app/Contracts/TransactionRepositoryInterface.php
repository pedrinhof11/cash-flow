<?php

namespace App\Contracts;

use App\DTOs\CreateTransactionDTO;
use App\DTOs\TransactionResponseDTO;

interface TransactionRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): array;
    public function findById(int $id): ?TransactionResponseDTO;
    public function findModelById(int $id): ?\App\Models\Transaction;
    public function save(CreateTransactionDTO $dto): TransactionResponseDTO;
    public function update(int $id, array $data): TransactionResponseDTO;
    public function delete(int $id): void;
    public function summary(int $userId, string $startDate, string $endDate): array;
    public function sumByCategory(int $userId, int $categoryId, string $start, string $end): float;
}
