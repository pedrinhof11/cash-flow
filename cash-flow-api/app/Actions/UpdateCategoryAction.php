<?php

namespace App\Actions;

use App\Contracts\CategoryRepositoryInterface;
use App\DTOs\CategoryResponseDTO;

class UpdateCategoryAction
{
    public function __construct(
        private CategoryRepositoryInterface $repository,
    ) {}

    public function execute(int $id, array $data): CategoryResponseDTO
    {
        return $this->repository->update($id, $data);
    }
}
