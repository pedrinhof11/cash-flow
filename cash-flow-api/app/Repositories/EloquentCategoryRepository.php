<?php

namespace App\Repositories;

use App\Contracts\CategoryRepositoryInterface;
use App\DTOs\CategoryResponseDTO;
use App\DTOs\CreateCategoryDTO;
use App\Models\Category;

class EloquentCategoryRepository implements CategoryRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): array
    {
        $query = Category::where('user_id', $userId)->with('children');

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['parent_id'])) {
            $query->where('parent_id', $filters['parent_id']);
        }

        return $query->orderBy('name')
            ->get()
            ->map(fn (Category $c) => CategoryResponseDTO::fromModel($c))
            ->toArray();
    }

    public function findById(int $id): ?CategoryResponseDTO
    {
        $category = Category::with('children')->find($id);
        return $category ? CategoryResponseDTO::fromModel($category) : null;
    }

    public function findModelById(int $id): ?Category
    {
        return Category::find($id);
    }

    public function save(CreateCategoryDTO $dto): CategoryResponseDTO
    {
        $category = Category::create([
            'user_id' => $dto->userId,
            'name' => $dto->name,
            'type' => $dto->type,
            'parent_id' => $dto->parentId,
            'color' => $dto->color,
            'icon' => $dto->icon,
        ]);

        return CategoryResponseDTO::fromModel($category);
    }

    public function update(int $id, array $data): CategoryResponseDTO
    {
        $category = Category::findOrFail($id);
        $category->update($data);
        $category->refresh();
        return CategoryResponseDTO::fromModel($category);
    }

    public function delete(int $id): void
    {
        Category::where('id', $id)->delete();
    }

    public function hasTransactions(int $id): bool
    {
        return Category::findOrFail($id)->transactions()->exists();
    }
}
