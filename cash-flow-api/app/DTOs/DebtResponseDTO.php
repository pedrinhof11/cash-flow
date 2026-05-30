<?php

namespace App\DTOs;

use App\Models\Debt;

class DebtResponseDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly string $creditor,
        public readonly float $totalAmount,
        public readonly float $interestRate,
        public readonly float $minimumPayment,
        public readonly float $paidAmount,
        public readonly float $remainingAmount,
        public readonly float $progress,
        public readonly int $dueDay,
        public readonly string $startDate,
        public readonly ?string $notes,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function fromModel(Debt $debt): self
    {
        return new self(
            id: $debt->id,
            userId: $debt->user_id,
            creditor: $debt->creditor,
            totalAmount: (float) $debt->total_amount,
            interestRate: (float) $debt->interest_rate,
            minimumPayment: (float) $debt->minimum_payment,
            paidAmount: (float) $debt->paid_amount,
            remainingAmount: (float) $debt->remaining_amount,
            progress: (float) $debt->progress,
            dueDay: $debt->due_day,
            startDate: $debt->start_date->toDateString(),
            notes: $debt->notes,
            createdAt: $debt->created_at->toISOString(),
            updatedAt: $debt->updated_at->toISOString(),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'creditor' => $this->creditor,
            'total_amount' => $this->totalAmount,
            'interest_rate' => $this->interestRate,
            'minimum_payment' => $this->minimumPayment,
            'paid_amount' => $this->paidAmount,
            'remaining_amount' => $this->remainingAmount,
            'progress' => $this->progress,
            'due_day' => $this->dueDay,
            'start_date' => $this->startDate,
            'notes' => $this->notes,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
