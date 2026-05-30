<?php

namespace App\DTOs;

class CreateCategoryDTO
{
    public function __construct(
        public readonly int $userId,
        public readonly string $name,
        public readonly string $type,
        public readonly ?int $parentId = null,
        public readonly ?string $color = null,
        public readonly ?string $icon = null,
    ) {}

    public static function fromRequest(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            name: $data['name'],
            type: $data['type'],
            parentId: $data['parent_id'] ?? null,
            color: $data['color'] ?? null,
            icon: $data['icon'] ?? null,
        );
    }
}
