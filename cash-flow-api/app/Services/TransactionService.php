<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    public function createTransaction(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $transaction = Transaction::create($data);

            $this->updateAccountBalance($transaction);

            return $transaction;
        });
    }

    public function createTransfer(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $transaction = Transaction::create([
                'user_id' => $data['user_id'],
                'account_id' => $data['account_id'],
                'category_id' => null,
                'type' => 'transfer',
                'amount' => $data['amount'],
                'description' => $data['description'] ?? 'Transfer',
                'date' => $data['date'],
                'transfer_to_account_id' => $data['transfer_to_account_id'],
            ]);

            $fromAccount = Account::find($data['account_id']);
            $toAccount = Account::find($data['transfer_to_account_id']);

            $fromAccount->decrement('current_balance', $data['amount']);
            $toAccount->increment('current_balance', $data['amount']);

            return $transaction;
        });
    }

    public function deleteTransaction(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            $this->reverseTransaction($transaction);
            $transaction->delete();
        });
    }

    public function getBalanceByPeriod(int $userId, string $startDate, string $endDate): array
    {
        $query = Transaction::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate]);

        $income = (clone $query)->income()->sum('amount');
        $expense = (clone $query)->expense()->sum('amount');

        return [
            'income' => $income,
            'expense' => $expense,
            'balance' => $income - $expense,
        ];
    }

    public function getSpentByCategory(int $userId, int $categoryId, string $startDate, string $endDate): float
    {
        return Transaction::where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->where('type', 'expense')
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');
    }

    private function updateAccountBalance(Transaction $transaction): void
    {
        $account = Account::find($transaction->account_id);

        match ($transaction->type) {
            'income' => $account->increment('current_balance', $transaction->amount),
            'expense' => $account->decrement('current_balance', $transaction->amount),
            default => null,
        };
    }

    private function reverseTransaction(Transaction $transaction): void
    {
        $account = Account::find($transaction->account_id);

        match ($transaction->type) {
            'income' => $account->decrement('current_balance', $transaction->amount),
            'expense' => $account->increment('current_balance', $transaction->amount),
            'transfer' => $account->increment('current_balance', $transaction->amount),
        };

        if ($transaction->type === 'transfer' && $transaction->transfer_to_account_id) {
            $toAccount = Account::find($transaction->transfer_to_account_id);
            $toAccount->decrement('current_balance', $transaction->amount);
        }
    }
}
