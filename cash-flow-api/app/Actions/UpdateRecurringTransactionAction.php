<?php

namespace App\Actions;

use App\Contracts\RecurringTransactionRepositoryInterface;
use App\DTOs\RecurringTransactionResponseDTO;

class UpdateRecurringTransactionAction
{
    public function __construct(
        private RecurringTransactionRepositoryInterface $repository,
    ) {}

    public function execute(int $id, array $data): RecurringTransactionResponseDTO
    {
        return $this->repository->update($id, $data);
    }
}
