<?php

namespace App\Actions;

use App\Contracts\BudgetRepositoryInterface;
use App\DTOs\BudgetResponseDTO;
use App\DTOs\CreateBudgetDTO;

class CreateBudgetAction
{
    public function __construct(
        private BudgetRepositoryInterface $repository,
    ) {}

    public function execute(CreateBudgetDTO $dto): BudgetResponseDTO
    {
        return $this->repository->save($dto);
    }
}
