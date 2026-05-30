<?php

namespace Tests\Feature;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_category()
    {
        $user = $this->authenticatedUser();

        $response = $this->postJson('/api/categories', [
            'name' => 'Food',
            'type' => 'expense',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('category.name', 'Food');

        $this->assertDatabaseHas('categories', ['name' => 'Food', 'user_id' => $user->id]);
    }

    public function test_user_can_list_their_categories()
    {
        $user = $this->authenticatedUser();
        Category::factory()->count(3)->create(['user_id' => $user->id, 'type' => 'expense']);

        $response = $this->getJson('/api/categories?type=expense');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'categories');
    }

    public function test_user_can_filter_categories_by_type()
    {
        $user = $this->authenticatedUser();
        Category::factory()->create(['user_id' => $user->id, 'type' => 'income', 'name' => 'Salary']);
        Category::factory()->create(['user_id' => $user->id, 'type' => 'expense', 'name' => 'Food']);

        $response = $this->getJson('/api/categories?type=income');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'categories')
            ->assertJsonPath('categories.0.name', 'Salary');
    }

    public function test_user_can_update_category()
    {
        $user = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);

        $response = $this->putJson("/api/categories/{$category->id}", [
            'name' => 'Updated Category',
            'color' => '#FF0000',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('category.name', 'Updated Category');
    }

    public function test_user_cannot_update_other_users_category()
    {
        $this->authenticatedUser();
        $otherUser = $this->createUser();
        $category = Category::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->putJson("/api/categories/{$category->id}", [
            'name' => 'Hacked',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_can_delete_category()
    {
        $user = $this->authenticatedUser();
        $category = Category::factory()->create(['user_id' => $user->id]);

        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('categories', ['id' => $category->id]);
    }

    public function test_category_type_validation()
    {
        $this->authenticatedUser();

        $response = $this->postJson('/api/categories', [
            'name' => 'Test',
            'type' => 'invalid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }
}
