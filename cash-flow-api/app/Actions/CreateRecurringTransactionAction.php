<?php

namespace App\Actions;

use App\Contracts\RecurringTransactionRepositoryInterface;
use App\DTOs\CreateRecurringTransactionDTO;
use App\DTOs\RecurringTransactionResponseDTO;

class CreateRecurringTransactionAction
{
    public function __construct(
        private RecurringTransactionRepositoryInterface $repository,
    ) {}

    public function execute(CreateRecurringTransactionDTO $dto): RecurringTransactionResponseDTO
    {
        return $this->repository->save($dto);
    }
}
