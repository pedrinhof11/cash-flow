<?php

namespace App\Actions;

use App\Contracts\AccountRepositoryInterface;
use App\DTOs\AccountResponseDTO;

class UpdateAccountAction
{
    public function __construct(
        private AccountRepositoryInterface $repository,
    ) {}

    public function execute(int $id, array $data): AccountResponseDTO
    {
        return $this->repository->update($id, $data);
    }
}
