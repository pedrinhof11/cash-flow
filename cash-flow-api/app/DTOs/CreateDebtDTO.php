<?php

namespace App\DTOs;

class CreateDebtDTO
{
    public function __construct(
        public readonly int $userId,
        public readonly string $creditor,
        public readonly float $totalAmount,
        public readonly float $interestRate,
        public readonly float $minimumPayment,
        public readonly int $dueDay,
        public readonly string $startDate,
        public readonly ?string $notes = null,
        public readonly float $paidAmount = 0,
    ) {}

    public static function fromRequest(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            creditor: $data['creditor'],
            totalAmount: (float) $data['total_amount'],
            interestRate: (float) $data['interest_rate'],
            minimumPayment: (float) $data['minimum_payment'],
            dueDay: (int) $data['due_day'],
            startDate: $data['start_date'],
            notes: $data['notes'] ?? null,
            paidAmount: (float) ($data['paid_amount'] ?? 0),
        );
    }

    public static function fromModel(\App\Models\Debt $debt): self
    {
        return new self(
            userId: $debt->user_id,
            creditor: $debt->creditor,
            totalAmount: (float) $debt->total_amount,
            interestRate: (float) $debt->interest_rate,
            minimumPayment: (float) $debt->minimum_payment,
            dueDay: $debt->due_day,
            startDate: $debt->start_date->toDateString(),
            notes: $debt->notes,
            paidAmount: (float) $debt->paid_amount,
        );
    }
}
