<?php

namespace App\DTOs;

class CreateAccountDTO
{
    public function __construct(
        public readonly int $userId,
        public readonly string $name,
        public readonly string $type,
        public readonly ?float $initialBalance = null,
        public readonly string $currency = 'BRL',
        public readonly ?string $color = null,
        public readonly ?string $icon = null,
        public readonly ?string $description = null,
    ) {}

    public static function fromRequest(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            name: $data['name'],
            type: $data['type'],
            initialBalance: isset($data['initial_balance']) ? (float) $data['initial_balance'] : null,
            currency: $data['currency'] ?? 'BRL',
            color: $data['color'] ?? null,
            icon: $data['icon'] ?? null,
            description: $data['description'] ?? null,
        );
    }
}
