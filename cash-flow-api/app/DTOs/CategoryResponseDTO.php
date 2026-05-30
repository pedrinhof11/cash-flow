<?php

namespace App\DTOs;

use App\Models\Category;

class CategoryResponseDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly string $name,
        public readonly string $type,
        public readonly ?int $parentId,
        public readonly ?string $color,
        public readonly ?string $icon,
        public readonly bool $isDefault,
        public readonly ?array $children = null,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function fromModel(Category $category): self
    {
        return new self(
            id: $category->id,
            userId: $category->user_id,
            name: $category->name,
            type: $category->type,
            parentId: $category->parent_id,
            color: $category->color,
            icon: $category->icon,
            isDefault: $category->is_default ?? false,
            children: $category->relationLoaded('children')
                ? $category->children->map(fn ($c) => self::fromModel($c))->toArray()
                : null,
            createdAt: $category->created_at->toISOString(),
            updatedAt: $category->updated_at->toISOString(),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'name' => $this->name,
            'type' => $this->type,
            'parent_id' => $this->parentId,
            'color' => $this->color,
            'icon' => $this->icon,
            'is_default' => $this->isDefault,
            'children' => $this->children,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
