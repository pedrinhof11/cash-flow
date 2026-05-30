<?php

namespace App\Actions;

use App\Contracts\DebtRepositoryInterface;

class DeleteDebtAction
{
    public function __construct(
        private DebtRepositoryInterface $repository,
    ) {}

    public function execute(int $id): void
    {
        $this->repository->delete($id);
    }
}
