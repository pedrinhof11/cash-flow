<?php

namespace App\Actions;

use App\Contracts\RecurringTransactionRepositoryInterface;

class DeleteRecurringTransactionAction
{
    public function __construct(
        private RecurringTransactionRepositoryInterface $repository,
    ) {}

    public function execute(int $id): void
    {
        $this->repository->delete($id);
    }
}
