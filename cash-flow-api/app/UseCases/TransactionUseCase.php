<?php

namespace App\UseCases;

use App\Actions\CreateTransactionAction;
use App\Actions\DeleteTransactionAction;
use App\Actions\UpdateTransactionAction;
use App\Contracts\TransactionRepositoryInterface;
use App\DTOs\CreateTransactionDTO;
use App\DTOs\TransactionResponseDTO;

class TransactionUseCase
{
    public function __construct(
        private TransactionRepositoryInterface $repository,
        private CreateTransactionAction $createAction,
        private UpdateTransactionAction $updateAction,
        private DeleteTransactionAction $deleteAction,
    ) {}

    public function list(int $userId, array $filters = []): array
    {
        return $this->repository->findByUser($userId, $filters);
    }

    public function find(int $id): ?TransactionResponseDTO
    {
        return $this->repository->findById($id);
    }

    public function create(CreateTransactionDTO $dto): TransactionResponseDTO
    {
        return $this->createAction->execute($dto);
    }

    public function update(int $id, array $data): TransactionResponseDTO
    {
        return $this->updateAction->execute($id, $data);
    }

    public function delete(\App\Models\Transaction $transaction): void
    {
        $this->deleteAction->execute($transaction);
    }

    public function summary(int $userId, string $startDate, string $endDate): array
    {
        return $this->repository->summary($userId, $startDate, $endDate);
    }
}
