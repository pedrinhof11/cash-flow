<?php

namespace App\Actions;

use App\Contracts\BudgetRepositoryInterface;

class DeleteBudgetAction
{
    public function __construct(
        private BudgetRepositoryInterface $repository,
    ) {}

    public function execute(int $id): void
    {
        $this->repository->delete($id);
    }
}
