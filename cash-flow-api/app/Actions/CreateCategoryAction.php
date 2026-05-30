<?php

namespace App\Actions;

use App\Contracts\CategoryRepositoryInterface;
use App\DTOs\CategoryResponseDTO;
use App\DTOs\CreateCategoryDTO;

class CreateCategoryAction
{
    public function __construct(
        private CategoryRepositoryInterface $repository,
    ) {}

    public function execute(CreateCategoryDTO $dto): CategoryResponseDTO
    {
        return $this->repository->save($dto);
    }
}
