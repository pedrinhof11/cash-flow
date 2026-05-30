<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    protected function createUser(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'email' => Str::random(10) . '@test.com',
            'password' => bcrypt('password'),
        ], $attributes));
    }

    protected function authenticatedUser(array $attributes = []): User
    {
        $user = $this->createUser($attributes);
        $this->actingAs($user, 'web');
        return $user;
    }
}
