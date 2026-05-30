<?php

namespace App\Actions;

use App\Contracts\AccountRepositoryInterface;

class DeleteAccountAction
{
    public function __construct(
        private AccountRepositoryInterface $repository,
    ) {}

    public function execute(int $id): void
    {
        $this->repository->delete($id);
    }
}
