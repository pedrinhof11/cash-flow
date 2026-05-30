<?php

namespace App\UseCases;

use App\Actions\CreateCategoryAction;
use App\Actions\DeleteCategoryAction;
use App\Actions\UpdateCategoryAction;
use App\Contracts\CategoryRepositoryInterface;
use App\DTOs\CategoryResponseDTO;
use App\DTOs\CreateCategoryDTO;

class CategoryUseCase
{
    public function __construct(
        private CategoryRepositoryInterface $repository,
        private CreateCategoryAction $createAction,
        private UpdateCategoryAction $updateAction,
        private DeleteCategoryAction $deleteAction,
    ) {}

    public function list(int $userId, array $filters = []): array
    {
        return $this->repository->findByUser($userId, $filters);
    }

    public function find(int $id): ?CategoryResponseDTO
    {
        return $this->repository->findById($id);
    }

    public function create(CreateCategoryDTO $dto): CategoryResponseDTO
    {
        return $this->createAction->execute($dto);
    }

    public function update(int $id, array $data): CategoryResponseDTO
    {
        return $this->updateAction->execute($id, $data);
    }

    public function delete(int $id): void
    {
        $this->deleteAction->execute($id);
    }

    public function hasTransactions(int $id): bool
    {
        return $this->repository->hasTransactions($id);
    }
}
