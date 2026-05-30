<?php

namespace App\UseCases;

use App\Actions\CalculateDebtStrategyAction;
use App\Actions\CreateDebtAction;
use App\Actions\DeleteDebtAction;
use App\Actions\UpdateDebtAction;
use App\Contracts\DebtRepositoryInterface;
use App\DTOs\CreateDebtDTO;
use App\DTOs\DebtResponseDTO;
use App\DTOs\DebtSimulationDTO;

class DebtUseCase
{
    public function __construct(
        private DebtRepositoryInterface $repository,
        private CreateDebtAction $createAction,
        private UpdateDebtAction $updateAction,
        private DeleteDebtAction $deleteAction,
        private CalculateDebtStrategyAction $calculateAction,
    ) {}

    public function list(int $userId): array
    {
        return $this->repository->findByUser($userId);
    }

    public function find(int $id): ?DebtResponseDTO
    {
        return $this->repository->findById($id);
    }

    public function create(CreateDebtDTO $dto): DebtResponseDTO
    {
        return $this->createAction->execute($dto);
    }

    public function update(int $id, array $data): DebtResponseDTO
    {
        return $this->updateAction->execute($id, $data);
    }

    public function delete(int $id): void
    {
        $this->deleteAction->execute($id);
    }

    public function calculate(DebtSimulationDTO $dto): array
    {
        return $this->calculateAction->execute(
            $dto->debts,
            $dto->monthlyPayment,
            $dto->strategy,
        );
    }
}
