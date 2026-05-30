<?php

namespace App\Repositories;

use App\Contracts\TransactionRepositoryInterface;
use App\DTOs\CreateTransactionDTO;
use App\DTOs\TransactionResponseDTO;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class EloquentTransactionRepository implements TransactionRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): array
    {
        $query = Transaction::where('user_id', $userId)
            ->with(['account', 'category']);

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['account_id'])) {
            $query->where('account_id', $filters['account_id']);
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('date', [$filters['start_date'], $filters['end_date']]);
        }

        if (isset($filters['search'])) {
            $query->where('description', 'like', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 20)
            ->through(fn (Transaction $t) => TransactionResponseDTO::fromModel($t))
            ->toArray();
    }

    public function findById(int $id): ?TransactionResponseDTO
    {
        $transaction = Transaction::with(['account', 'category'])->find($id);
        return $transaction ? TransactionResponseDTO::fromModel($transaction) : null;
    }

    public function findModelById(int $id): ?Transaction
    {
        return Transaction::with(['account', 'category'])->find($id);
    }

    public function save(CreateTransactionDTO $dto): TransactionResponseDTO
    {
        $transaction = Transaction::create([
            'user_id' => $dto->userId,
            'account_id' => $dto->accountId,
            'category_id' => $dto->categoryId,
            'type' => $dto->type,
            'amount' => $dto->amount,
            'description' => $dto->description,
            'date' => $dto->date,
            'transfer_to_account_id' => $dto->transferToAccountId,
        ]);

        return TransactionResponseDTO::fromModel($transaction->load(['account', 'category']));
    }

    public function update(int $id, array $data): TransactionResponseDTO
    {
        $transaction = Transaction::findOrFail($id);
        $transaction->update($data);
        $transaction->refresh();
        return TransactionResponseDTO::fromModel($transaction->load(['account', 'category']));
    }

    public function delete(int $id): void
    {
        Transaction::where('id', $id)->delete();
    }

    public function summary(int $userId, string $startDate, string $endDate): array
    {
        $query = Transaction::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate]);

        $totalIncome = (clone $query)->where('type', 'income')->sum('amount');
        $totalExpense = (clone $query)->where('type', 'expense')->sum('amount');
        $totalTransfers = (clone $query)->where('type', 'transfer')->sum('amount');

        $byCategory = Transaction::where('transactions.user_id', $userId)
            ->with('category')
            ->whereBetween('date', [$startDate, $endDate])
            ->where('type', 'expense')
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('category_id')
            ->get()
            ->toArray();

        return [
            'period' => ['start_date' => $startDate, 'end_date' => $endDate],
            'total_income' => (float) $totalIncome,
            'total_expense' => (float) $totalExpense,
            'balance' => (float) $totalIncome - (float) $totalExpense,
            'total_transfers' => (float) $totalTransfers,
            'by_category' => $byCategory,
        ];
    }

    public function sumByCategory(int $userId, int $categoryId, string $start, string $end): float
    {
        return (float) Transaction::where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->where('type', 'expense')
            ->whereBetween('date', [$start, $end])
            ->sum('amount');
    }
}
