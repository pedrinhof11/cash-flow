<?php

namespace App\Actions;

use App\Contracts\BudgetRepositoryInterface;
use App\DTOs\BudgetResponseDTO;

class UpdateBudgetAction
{
    public function __construct(
        private BudgetRepositoryInterface $repository,
    ) {}

    public function execute(int $id, array $data): BudgetResponseDTO
    {
        return $this->repository->update($id, $data);
    }
}
