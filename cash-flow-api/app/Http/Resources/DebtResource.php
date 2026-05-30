<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DebtResource extends JsonResource
{
    public function toArray(Request $request): array
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
