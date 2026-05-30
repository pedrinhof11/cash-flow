<?php

namespace App\Actions;

use App\Models\Account;
use App\Models\Transaction;

class DeleteTransactionAction
{
    public function execute(Transaction $transaction): void
    {
        $account = Account::find($transaction->account_id);

        match ($transaction->type) {
            'income' => $account?->decrement('current_balance', $transaction->amount),
            'expense' => $account?->increment('current_balance', $transaction->amount),
            'transfer' => $account?->increment('current_balance', $transaction->amount),
        };

        if ($transaction->type === 'transfer' && $transaction->transfer_to_account_id) {
            Account::find($transaction->transfer_to_account_id)?->decrement('current_balance', $transaction->amount);
        }

        $transaction->delete();
    }
}
