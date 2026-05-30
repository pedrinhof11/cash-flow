<?php

namespace App\Actions;

use App\Contracts\TransactionRepositoryInterface;
use App\DTOs\CreateTransactionDTO;
use App\DTOs\TransactionResponseDTO;
use App\Models\Account;

class CreateTransactionAction
{
    public function __construct(
        private TransactionRepositoryInterface $repository,
    ) {}

    public function execute(CreateTransactionDTO $dto): TransactionResponseDTO
    {
        $account = Account::findOrFail($dto->accountId);

        $transaction = $this->repository->save($dto);

        match ($dto->type) {
            'income' => $account->increment('current_balance', $dto->amount),
            'expense' => $account->decrement('current_balance', $dto->amount),
            'transfer' => $account->decrement('current_balance', $dto->amount),
        };

        if ($dto->type === 'transfer' && $dto->transferToAccountId) {
            Account::findOrFail($dto->transferToAccountId)->increment('current_balance', $dto->amount);
        }

        return $this->repository->findById($transaction->id);
    }
}
