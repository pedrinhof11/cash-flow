<?php

namespace App\DTOs;

use App\Models\RecurringTransaction;

class RecurringTransactionResponseDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly int $accountId,
        public readonly ?int $categoryId,
        public readonly string $type,
        public readonly string $amount,
        public readonly ?string $description,
        public readonly string $frequency,
        public readonly ?int $dayOfMonth,
        public readonly string $startDate,
        public readonly ?string $endDate,
        public readonly string $nextDue,
        public readonly ?int $occurrences,
        public readonly ?int $occurrencesLeft,
        public readonly bool $isActive,
        public readonly ?array $account = null,
        public readonly ?array $category = null,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function fromModel(RecurringTransaction $rt): self
    {
        return new self(
            id: $rt->id,
            userId: $rt->user_id,
            accountId: $rt->account_id,
            categoryId: $rt->category_id,
            type: $rt->type,
            amount: (string) $rt->amount,
            description: $rt->description,
            frequency: $rt->frequency,
            dayOfMonth: $rt->day_of_month,
            startDate: $rt->start_date instanceof \Carbon\Carbon ? $rt->start_date->toDateString() : $rt->start_date,
            endDate: $rt->end_date instanceof \Carbon\Carbon ? $rt->end_date->toDateString() : $rt->end_date,
            nextDue: $rt->next_due instanceof \Carbon\Carbon ? $rt->next_due->toDateString() : $rt->next_due,
            occurrences: $rt->occurrences,
            occurrencesLeft: $rt->occurrences_left,
            isActive: $rt->is_active,
            account: $rt->relationLoaded('account') && $rt->account
                ? AccountResponseDTO::fromModel($rt->account)->toArray()
                : null,
            category: $rt->relationLoaded('category') && $rt->category
                ? CategoryResponseDTO::fromModel($rt->category)->toArray()
                : null,
            createdAt: $rt->created_at->toISOString(),
            updatedAt: $rt->updated_at->toISOString(),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'account_id' => $this->accountId,
            'category_id' => $this->categoryId,
            'type' => $this->type,
            'amount' => $this->amount,
            'description' => $this->description,
            'frequency' => $this->frequency,
            'day_of_month' => $this->dayOfMonth,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'next_due' => $this->nextDue,
            'occurrences' => $this->occurrences,
            'occurrences_left' => $this->occurrencesLeft,
            'is_active' => $this->isActive,
            'account' => $this->account,
            'category' => $this->category,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
