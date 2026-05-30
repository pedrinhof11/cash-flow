<?php

namespace App\DTOs;

class DebtSimulationDTO
{
    public function __construct(
        public readonly array $debts,
        public readonly float $monthlyPayment,
        public readonly string $strategy,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            debts: $data['debts'],
            monthlyPayment: (float) $data['monthly_payment'],
            strategy: $data['strategy'],
        );
    }
}
