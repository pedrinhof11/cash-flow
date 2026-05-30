<?php

namespace App\DTOs;

class CreateTransactionDTO
{
    public function __construct(
        public readonly int $userId,
        public readonly int $accountId,
        public readonly string $type,
        public readonly float $amount,
        public readonly string $date,
        public readonly ?int $categoryId = null,
        public readonly ?string $description = null,
        public readonly ?int $transferToAccountId = null,
    ) {}

    public static function fromRequest(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            accountId: (int) $data['account_id'],
            type: $data['type'],
            amount: (float) $data['amount'],
            date: $data['date'],
            categoryId: isset($data['category_id']) ? (int) $data['category_id'] : null,
            description: $data['description'] ?? null,
            transferToAccountId: isset($data['transfer_to_account_id']) ? (int) $data['transfer_to_account_id'] : null,
        );
    }
}
