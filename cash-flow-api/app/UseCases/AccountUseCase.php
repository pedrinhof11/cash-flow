<?php

namespace App\UseCases;

use App\Actions\CreateAccountAction;
use App\Actions\DeleteAccountAction;
use App\Actions\UpdateAccountAction;
use App\Contracts\AccountRepositoryInterface;
use App\DTOs\AccountResponseDTO;
use App\DTOs\CreateAccountDTO;

class AccountUseCase
{
    public function __construct(
        private AccountRepositoryInterface $repository,
        private CreateAccountAction $createAction,
        private UpdateAccountAction $updateAction,
        private DeleteAccountAction $deleteAction,
    ) {}

    public function list(int $userId, array $filters = []): array
    {
        return $this->repository->findByUser($userId, $filters);
    }

    public function find(int $id): ?AccountResponseDTO
    {
        return $this->repository->findById($id);
    }

    public function create(CreateAccountDTO $dto): AccountResponseDTO
    {
        return $this->createAction->execute($dto);
    }

    public function update(int $id, array $data): AccountResponseDTO
    {
        return $this->updateAction->execute($id, $data);
    }

    public function delete(int $id): void
    {
        $this->deleteAction->execute($id);
    }

    public function hasTransactions(int $id): bool
    {
        return $this->repository->hasTransactions($id);
    }

    public function getBalance(int $id): ?array
    {
        $account = $this->repository->findModelById($id);
        if (!$account) return null;
        return [
            'account_id' => $account->id,
            'current_balance' => (string) $account->current_balance,
            'currency' => $account->currency,
        ];
    }
}
