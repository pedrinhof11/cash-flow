<?php

namespace App\DTOs;

use App\Models\Budget;

class BudgetResponseDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly int $categoryId,
        public readonly string $amount,
        public readonly string $period,
        public readonly string $startDate,
        public readonly ?string $endDate,
        public readonly ?array $category = null,
        public readonly string $createdAt,
        public readonly string $updatedAt,
        public readonly ?float $spent = null,
        public readonly ?float $remaining = null,
        public readonly ?float $percentageUsed = null,
        public readonly ?bool $isOverBudget = null,
    ) {}

    public static function fromModel(Budget $budget): self
    {
        return new self(
            id: $budget->id,
            userId: $budget->user_id,
            categoryId: $budget->category_id,
            amount: (string) $budget->amount,
            period: $budget->period,
            startDate: $budget->start_date instanceof \Carbon\Carbon ? $budget->start_date->toDateString() : $budget->start_date,
            endDate: $budget->end_date instanceof \Carbon\Carbon ? $budget->end_date->toDateString() : $budget->end_date,
            category: $budget->relationLoaded('category') && $budget->category
                ? CategoryResponseDTO::fromModel($budget->category)->toArray()
                : null,
            createdAt: $budget->created_at->toISOString(),
            updatedAt: $budget->updated_at->toISOString(),
        );
    }

    public function withSpent(float $spent, float $remaining, float $percentage, bool $overBudget): self
    {
        return new self(
            id: $this->id,
            userId: $this->userId,
            categoryId: $this->categoryId,
            amount: $this->amount,
            period: $this->period,
            startDate: $this->startDate,
            endDate: $this->endDate,
            category: $this->category,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            spent: $spent,
            remaining: $remaining,
            percentageUsed: $percentage,
            isOverBudget: $overBudget,
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'category_id' => $this->categoryId,
            'amount' => $this->amount,
            'period' => $this->period,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'category' => $this->category,
            'spent' => $this->spent,
            'remaining' => $this->remaining,
            'percentage_used' => $this->percentageUsed,
            'is_over_budget' => $this->isOverBudget,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
