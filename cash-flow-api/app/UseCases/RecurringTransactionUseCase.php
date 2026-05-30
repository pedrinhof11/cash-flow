<?php

namespace App\UseCases;

use App\Actions\CreateRecurringTransactionAction;
use App\Actions\DeleteRecurringTransactionAction;
use App\Actions\SkipRecurringTransactionAction;
use App\Actions\UpdateRecurringTransactionAction;
use App\Contracts\RecurringTransactionRepositoryInterface;
use App\DTOs\CreateRecurringTransactionDTO;
use App\DTOs\RecurringTransactionResponseDTO;
use App\Models\RecurringTransaction;

class RecurringTransactionUseCase
{
    public function __construct(
        private RecurringTransactionRepositoryInterface $repository,
        private CreateRecurringTransactionAction $createAction,
        private UpdateRecurringTransactionAction $updateAction,
        private DeleteRecurringTransactionAction $deleteAction,
        private SkipRecurringTransactionAction $skipAction,
    ) {}

    public function list(int $userId, array $filters = []): array
    {
        return $this->repository->findByUser($userId, $filters);
    }

    public function find(int $id): ?RecurringTransactionResponseDTO
    {
        return $this->repository->findById($id);
    }

    public function create(CreateRecurringTransactionDTO $dto): RecurringTransactionResponseDTO
    {
        return $this->createAction->execute($dto);
    }

    public function update(int $id, array $data): RecurringTransactionResponseDTO
    {
        return $this->updateAction->execute($id, $data);
    }

    public function delete(int $id): void
    {
        $this->deleteAction->execute($id);
    }

    public function skip(RecurringTransaction $recurring): RecurringTransaction
    {
        return $this->skipAction->execute($recurring);
    }
}
