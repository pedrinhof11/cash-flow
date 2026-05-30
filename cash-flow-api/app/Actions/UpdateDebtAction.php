<?php

namespace App\Actions;

use App\Contracts\DebtRepositoryInterface;
use App\DTOs\DebtResponseDTO;

class UpdateDebtAction
{
    public function __construct(
        private DebtRepositoryInterface $repository,
    ) {}

    public function execute(int $id, array $data): DebtResponseDTO
    {
        return $this->repository->update($id, $data);
    }
}
