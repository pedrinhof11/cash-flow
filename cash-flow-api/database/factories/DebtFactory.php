<?php

namespace Database\Factories;

use App\Models\Debt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DebtFactory extends Factory
{
    protected $model = Debt::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'creditor' => $this->faker->company(),
            'total_amount' => $this->faker->randomFloat(2, 1000, 50000),
            'interest_rate' => $this->faker->randomFloat(2, 1, 30),
            'minimum_payment' => $this->faker->randomFloat(2, 50, 1000),
            'paid_amount' => $this->faker->randomFloat(2, 0, 10000),
            'due_day' => $this->faker->numberBetween(1, 28),
            'start_date' => $this->faker->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
