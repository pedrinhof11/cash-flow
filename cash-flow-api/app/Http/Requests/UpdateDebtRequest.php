<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDebtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'creditor' => ['sometimes', 'string', 'max:255'],
            'total_amount' => ['sometimes', 'numeric', 'min:0.01'],
            'interest_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'minimum_payment' => ['sometimes', 'numeric', 'min:0.01'],
            'paid_amount' => ['sometimes', 'numeric', 'min:0'],
            'due_day' => ['sometimes', 'integer', 'min:1', 'max:31'],
            'start_date' => ['sometimes', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
