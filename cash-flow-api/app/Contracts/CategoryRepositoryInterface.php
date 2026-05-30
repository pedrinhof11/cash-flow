<?php

namespace App\Contracts;

use App\DTOs\CategoryResponseDTO;
use App\DTOs\CreateCategoryDTO;

interface CategoryRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): array;
    public function findById(int $id): ?CategoryResponseDTO;
    public function findModelById(int $id): ?\App\Models\Category;
    public function save(CreateCategoryDTO $dto): CategoryResponseDTO;
    public function update(int $id, array $data): CategoryResponseDTO;
    public function delete(int $id): void;
    public function hasTransactions(int $id): bool;
}
