<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Todo;

class TodoTest extends TestCase
{
    use WithFaker;

    /**
     * Test getting all todos
     */
    public function test_can_get_all_todos()
    {
        $response = $this->getJson('/api/todos');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data'
                ]);
    }

    /**
     * Test creating a new todo
     */
    public function test_can_create_todo()
    {
        $todoData = [
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'due_date' => now()->addDays(7)->toDateString(),
            'user_id' => 'test-user-123'
        ];

        $response = $this->postJson('/api/todos', $todoData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => ['id']
                ]);
    }

    /**
     * Test creating todo with invalid data
     */
    public function test_cannot_create_todo_without_title()
    {
        $todoData = [
            'description' => $this->faker->paragraph,
            'due_date' => now()->addDays(7)->toDateString()
        ];

        $response = $this->postJson('/api/todos', $todoData);

        $response->assertStatus(422);
    }

    /**
     * Test getting a specific todo
     */
    public function test_can_get_specific_todo()
    {
        // First create a todo
        $todoData = [
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph
        ];

        $createResponse = $this->postJson('/api/todos', $todoData);
        $todoId = $createResponse->json('data.id');

        // Then get the specific todo
        $response = $this->getJson("/api/todos/{$todoId}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data'
                ]);
    }

    /**
     * Test updating a todo
     */
    public function test_can_update_todo()
    {
        // First create a todo
        $todoData = [
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph
        ];

        $createResponse = $this->postJson('/api/todos', $todoData);
        $todoId = $createResponse->json('data.id');

        // Then update the todo
        $updateData = [
            'title' => 'Updated Title',
            'description' => 'Updated Description'
        ];

        $response = $this->putJson("/api/todos/{$todoId}", $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data'
                ]);
    }

    /**
     * Test deleting a todo
     */
    public function test_can_delete_todo()
    {
        // First create a todo
        $todoData = [
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph
        ];

        $createResponse = $this->postJson('/api/todos', $todoData);
        $todoId = $createResponse->json('data.id');

        // Then delete the todo
        $response = $this->deleteJson("/api/todos/{$todoId}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message'
                ]);
    }

    /**
     * Test toggling todo completion status
     */
    public function test_can_toggle_todo_completion()
    {
        // First create a todo
        $todoData = [
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph
        ];

        $createResponse = $this->postJson('/api/todos', $todoData);
        $todoId = $createResponse->json('data.id');

        // Then toggle the completion status
        $response = $this->patchJson("/api/todos/{$todoId}/toggle");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data'
                ]);
    }

    /**
     * Test getting non-existent todo
     */
    public function test_cannot_get_nonexistent_todo()
    {
        $response = $this->getJson('/api/todos/nonexistent-id');

        $response->assertStatus(404);
    }
}
