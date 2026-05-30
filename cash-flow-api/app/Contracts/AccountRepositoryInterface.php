<?php

namespace App\Contracts;

use App\DTOs\AccountResponseDTO;
use App\DTOs\CreateAccountDTO;

interface AccountRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): array;
    public function findById(int $id): ?AccountResponseDTO;
    public function findModelById(int $id): ?\App\Models\Account;
    public function save(CreateAccountDTO $dto): AccountResponseDTO;
    public function update(int $id, array $data): AccountResponseDTO;
    public function delete(int $id): void;
    public function hasTransactions(int $id): bool;
}
