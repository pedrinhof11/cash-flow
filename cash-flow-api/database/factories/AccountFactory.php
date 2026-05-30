<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->company . ' Account',
            'type' => $this->faker->randomElement(['bank', 'cash', 'credit_card', 'investment', 'other']),
            'initial_balance' => $this->faker->randomFloat(2, 0, 10000),
            'current_balance' => $this->faker->randomFloat(2, 0, 10000),
            'currency' => 'BRL',
            'color' => $this->faker->hexColor,
            'is_active' => true,
        ];
    }
}
