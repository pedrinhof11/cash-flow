<?php

namespace App\Actions;

use App\Contracts\AccountRepositoryInterface;
use App\DTOs\AccountResponseDTO;
use App\DTOs\CreateAccountDTO;

class CreateAccountAction
{
    public function __construct(
        private AccountRepositoryInterface $repository,
    ) {}

    public function execute(CreateAccountDTO $dto): AccountResponseDTO
    {
        return $this->repository->save($dto);
    }
}
