<?php

namespace App\DTOs;

use App\Models\Transaction;

class TransactionResponseDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly int $accountId,
        public readonly ?int $categoryId,
        public readonly string $type,
        public readonly string $amount,
        public readonly ?string $description,
        public readonly string $date,
        public readonly ?int $transferToAccountId,
        public readonly ?int $recurringTransactionId,
        public readonly bool $isRecurringGenerated,
        public readonly ?array $account = null,
        public readonly ?array $category = null,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function fromModel(Transaction $transaction): self
    {
        return new self(
            id: $transaction->id,
            userId: $transaction->user_id,
            accountId: $transaction->account_id,
            categoryId: $transaction->category_id,
            type: $transaction->type,
            amount: (string) $transaction->amount,
            description: $transaction->description,
            date: $transaction->date instanceof \Carbon\Carbon ? $transaction->date->toDateString() : $transaction->date,
            transferToAccountId: $transaction->transfer_to_account_id,
            recurringTransactionId: $transaction->recurring_transaction_id,
            isRecurringGenerated: $transaction->is_recurring_generated ?? false,
            account: $transaction->relationLoaded('account') && $transaction->account
                ? AccountResponseDTO::fromModel($transaction->account)->toArray()
                : null,
            category: $transaction->relationLoaded('category') && $transaction->category
                ? CategoryResponseDTO::fromModel($transaction->category)->toArray()
                : null,
            createdAt: $transaction->created_at->toISOString(),
            updatedAt: $transaction->updated_at->toISOString(),
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
            'date' => $this->date,
            'transfer_to_account_id' => $this->transferToAccountId,
            'recurring_transaction_id' => $this->recurringTransactionId,
            'is_recurring_generated' => $this->isRecurringGenerated,
            'account' => $this->account,
            'category' => $this->category,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
