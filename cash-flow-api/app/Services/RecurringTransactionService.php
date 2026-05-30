<?php

namespace App\Services;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Support\Facades\DB;

class RecurringTransactionService
{
    public function __construct(
        protected TransactionService $transactionService
    ) {
    }

    public function processDueTransactions(): int
    {
        $dueTransactions = RecurringTransaction::dueToday()->get();
        $processed = 0;

        foreach ($dueTransactions as $recurring) {
            if ($recurring->shouldStopRecurring()) {
                $recurring->update(['is_active' => false]);
                continue;
            }

            try {
                $this->generateTransaction($recurring);
                $processed++;
            } catch (\Exception $e) {
                \Log::error('Failed to process recurring transaction', [
                    'recurring_id' => $recurring->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $processed;
    }

    public function generateTransaction(RecurringTransaction $recurring): Transaction
    {
        return DB::transaction(function () use ($recurring) {
            $transaction = $this->transactionService->createTransaction([
                'user_id' => $recurring->user_id,
                'account_id' => $recurring->account_id,
                'category_id' => $recurring->category_id,
                'type' => $recurring->type,
                'amount' => $recurring->amount,
                'description' => $recurring->description ?? $this->getDefaultDescription($recurring),
                'date' => $recurring->next_due,
                'recurring_transaction_id' => $recurring->id,
                'is_recurring_generated' => true,
            ]);

            $this->updateRecurringNextDue($recurring);

            return $transaction;
        });
    }

    protected function updateRecurringNextDue(RecurringTransaction $recurring): void
    {
        $nextDue = $recurring->calculateNextDue();

        $updates = [
            'next_due' => $nextDue,
        ];

        if ($recurring->occurrences_left !== null) {
            $updates['occurrences_left'] = $recurring->occurrences_left - 1;

            if ($updates['occurrences_left'] <= 0) {
                $updates['is_active'] = false;
            }
        }

        if ($recurring->end_date && $nextDue > $recurring->end_date) {
            $updates['is_active'] = false;
        }

        $recurring->update($updates);
    }

    protected function getDefaultDescription(RecurringTransaction $recurring): string
    {
        $frequencyLabels = [
            'daily' => 'Daily',
            'weekly' => 'Weekly',
            'biweekly' => 'Biweekly',
            'monthly' => 'Monthly',
            'yearly' => 'Yearly',
        ];

        $prefix = $frequencyLabels[$recurring->frequency] ?? 'Recurring';
        $typeLabel = $recurring->type === 'income' ? 'Income' : 'Expense';

        return "{$prefix} {$typeLabel}";
    }
}
