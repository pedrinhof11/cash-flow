<?php

namespace App\DTOs;

class CreateBudgetDTO
{
    public function __construct(
        public readonly int $userId,
        public readonly int $categoryId,
        public readonly float $amount,
        public readonly string $period,
        public readonly string $startDate,
        public readonly ?string $endDate = null,
    ) {}

    public static function fromRequest(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            categoryId: (int) $data['category_id'],
            amount: (float) $data['amount'],
            period: $data['period'],
            startDate: $data['start_date'],
            endDate: $data['end_date'] ?? null,
        );
    }
}
