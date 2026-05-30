<?php

namespace App\DTOs;

use App\Models\Account;

class AccountResponseDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly string $name,
        public readonly string $type,
        public readonly string $initialBalance,
        public readonly string $currentBalance,
        public readonly string $currency,
        public readonly ?string $color,
        public readonly ?string $icon,
        public readonly ?string $description,
        public readonly bool $isActive,
        public readonly int $transactionsCount = 0,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function fromModel(Account $account): self
    {
        return new self(
            id: $account->id,
            userId: $account->user_id,
            name: $account->name,
            type: $account->type,
            initialBalance: (string) $account->initial_balance,
            currentBalance: (string) $account->current_balance,
            currency: $account->currency,
            color: $account->color,
            icon: $account->icon,
            description: $account->description,
            isActive: $account->is_active ?? true,
            transactionsCount: (int) ($account->transactions_count ?? 0),
            createdAt: $account->created_at->toISOString(),
            updatedAt: $account->updated_at->toISOString(),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'name' => $this->name,
            'type' => $this->type,
            'initial_balance' => $this->initialBalance,
            'current_balance' => $this->currentBalance,
            'currency' => $this->currency,
            'color' => $this->color,
            'icon' => $this->icon,
            'description' => $this->description,
            'is_active' => $this->isActive,
            'transactions_count' => $this->transactionsCount,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
