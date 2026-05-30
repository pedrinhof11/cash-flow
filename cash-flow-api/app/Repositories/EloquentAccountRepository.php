<?php

namespace App\Repositories;

use App\Contracts\AccountRepositoryInterface;
use App\DTOs\AccountResponseDTO;
use App\DTOs\CreateAccountDTO;
use App\Models\Account;

class EloquentAccountRepository implements AccountRepositoryInterface
{
    public function findByUser(int $userId, array $filters = []): array
    {
        $query = Account::where('user_id', $userId)->withCount('transactions');

        if (isset($filters['type'])) {
            $query->byType($filters['type']);
        }

        if (!empty($filters['active_only'])) {
            $query->active();
        }

        return $query->orderBy('name')
            ->get()
            ->map(fn (Account $a) => AccountResponseDTO::fromModel($a))
            ->toArray();
    }

    public function findById(int $id): ?AccountResponseDTO
    {
        $account = Account::with(['transactions' => fn ($q) => $q->latest('date')->limit(10)])->find($id);
        return $account ? AccountResponseDTO::fromModel($account) : null;
    }

    public function findModelById(int $id): ?Account
    {
        return Account::find($id);
    }

    public function save(CreateAccountDTO $dto): AccountResponseDTO
    {
        $account = Account::create([
            'user_id' => $dto->userId,
            'name' => $dto->name,
            'type' => $dto->type,
            'initial_balance' => $dto->initialBalance ?? 0,
            'current_balance' => $dto->initialBalance ?? 0,
            'currency' => $dto->currency,
            'color' => $dto->color,
            'icon' => $dto->icon,
            'description' => $dto->description,
        ]);

        return AccountResponseDTO::fromModel($account);
    }

    public function update(int $id, array $data): AccountResponseDTO
    {
        $account = Account::findOrFail($id);
        $account->update($data);
        $account->refresh();
        return AccountResponseDTO::fromModel($account);
    }

    public function delete(int $id): void
    {
        Account::where('id', $id)->delete();
    }

    public function hasTransactions(int $id): bool
    {
        return Account::findOrFail($id)->transactions()->exists();
    }
}
