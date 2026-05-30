<?php

namespace App\DTOs;

class CreateRecurringTransactionDTO
{
    public function __construct(
        public readonly int $userId,
        public readonly int $accountId,
        public readonly string $type,
        public readonly float $amount,
        public readonly string $frequency,
        public readonly string $startDate,
        public readonly ?int $categoryId = null,
        public readonly ?string $description = null,
        public readonly ?int $dayOfMonth = null,
        public readonly ?string $endDate = null,
        public readonly ?int $occurrences = null,
    ) {}

    public static function fromRequest(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            accountId: (int) $data['account_id'],
            type: $data['type'],
            amount: (float) $data['amount'],
            frequency: $data['frequency'],
            startDate: $data['start_date'],
            categoryId: isset($data['category_id']) ? (int) $data['category_id'] : null,
            description: $data['description'] ?? null,
            dayOfMonth: $data['day_of_month'] ?? null,
            endDate: $data['end_date'] ?? null,
            occurrences: $data['occurrences'] ?? null,
        );
    }
}
