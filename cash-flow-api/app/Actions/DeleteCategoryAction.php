<?php

namespace App\Actions;

use App\Contracts\CategoryRepositoryInterface;

class DeleteCategoryAction
{
    public function __construct(
        private CategoryRepositoryInterface $repository,
    ) {}

    public function execute(int $id): void
    {
        $this->repository->delete($id);
    }
}
