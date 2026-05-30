<?php

namespace App\Actions;

use App\Contracts\TransactionRepositoryInterface;
use App\DTOs\TransactionResponseDTO;
use App\Models\Account;
use App\Models\Transaction;

class UpdateTransactionAction
{
    public function __construct(
        private TransactionRepositoryInterface $repository,
    ) {}

    public function execute(int $id, array $data): TransactionResponseDTO
    {
        $transaction = Transaction::findOrFail($id);
        $oldType = $transaction->type;
        $oldAmount = (float) $transaction->amount;
        $oldAccountId = $transaction->account_id;

        $transaction->update($data);
        $transaction->refresh();

        if ($oldType !== $transaction->type || $oldAmount !== (float) $transaction->amount || $oldAccountId !== $transaction->account_id) {
            $this->recalculateBalance($transaction, $oldType, $oldAmount);
        }

        return TransactionResponseDTO::fromModel($transaction->load(['account', 'category']));
    }

    private function recalculateBalance(Transaction $transaction, string $oldType, float $oldAmount): void
    {
        $oldAccount = Account::find($transaction->account_id ?? $transaction->getOriginal('account_id'));
        if ($oldAccount) {
            match ($oldType) {
                'income' => $oldAccount->decrement('current_balance', $oldAmount),
                'expense' => $oldAccount->increment('current_balance', $oldAmount),
                'transfer' => $oldAccount->increment('current_balance', $oldAmount),
            };
        }

        if ($oldType === 'transfer' && $transaction->getOriginal('transfer_to_account_id')) {
            Account::find($transaction->getOriginal('transfer_to_account_id'))
                ?->decrement('current_balance', $oldAmount);
        }

        $account = Account::find($transaction->account_id);
        if ($account) {
            match ($transaction->type) {
                'income' => $account->increment('current_balance', $transaction->amount),
                'expense' => $account->decrement('current_balance', $transaction->amount),
                'transfer' => $account->decrement('current_balance', $transaction->amount),
            };
        }

        if ($transaction->type === 'transfer' && $transaction->transfer_to_account_id) {
            Account::find($transaction->transfer_to_account_id)?->increment('current_balance', $transaction->amount);
        }
    }
}
