<?php

namespace App\Actions;

use App\Contracts\DebtRepositoryInterface;
use App\DTOs\CreateDebtDTO;
use App\DTOs\DebtResponseDTO;

class CreateDebtAction
{
    public function __construct(
        private DebtRepositoryInterface $repository,
    ) {}

    public function execute(CreateDebtDTO $dto): DebtResponseDTO
    {
        return $this->repository->save($dto);
    }
}
