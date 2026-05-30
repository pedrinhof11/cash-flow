<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CalculateDebtRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'debts' => ['required', 'array', 'min:1'],
            'debts.*.creditor' => ['required', 'string'],
            'debts.*.total_amount' => ['required', 'numeric', 'min:0.01'],
            'debts.*.remaining_amount' => ['required', 'numeric', 'min:0'],
            'debts.*.interest_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'debts.*.minimum_payment' => ['required', 'numeric', 'min:0.01'],
            'monthly_payment' => ['required', 'numeric', 'min:0.01'],
            'strategy' => ['required', 'string', 'in:snowball,avalanche'],
        ];
    }
}
