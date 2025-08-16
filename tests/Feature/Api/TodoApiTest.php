<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Todo;
use App\Services\FirebaseOAuthStorage;
use Illuminate\Foundation\Testing\WithFaker;

class TodoApiTest extends TestCase
{
    use WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Initialize Firebase OAuth storage
        $firebaseStorage = app(FirebaseOAuthStorage::class);
        $firebaseStorage->initializeDefaultClients();
    }

    public function test_authenticated_user_can_get_their_todos()
    {
        $user = User::factory()->create();
        $firebaseStorage = app(FirebaseOAuthStorage::class);
        
        // Create a token for the user
        $token = $firebaseStorage->createAccessToken($user->id, '1');
        
        // Create some todos in Firebase
        $todo1 = Todo::createInFirebase([
            'title' => 'Test Todo 1',
            'user_id' => $user->id,
            'completed' => false,
            'priority' => 'medium',
        ]);
        
        $todo2 = Todo::createInFirebase([
            'title' => 'Test Todo 2',
            'user_id' => $user->id,
            'completed' => true,
            'priority' => 'high',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->id,
        ])->getJson('/api/todos');

        $response->assertStatus(200);
        
        $todos = $response->json();
        $this->assertCount(2, $todos);
    }

    public function test_authenticated_user_cannot_see_other_users_todos()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $firebaseStorage = app(FirebaseOAuthStorage::class);
        
        // Create a token for user1
        $token = $firebaseStorage->createAccessToken($user1->id, '1');
        
        // Create a todo for user2
        Todo::createInFirebase([
            'title' => 'Other User Todo',
            'user_id' => $user2->id,
            'completed' => false,
            'priority' => 'medium',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->id,
        ])->getJson('/api/todos');

        $response->assertStatus(200);
        
        $todos = $response->json();
        $this->assertCount(0, $todos);
    }

    public function test_authenticated_user_can_create_todo()
    {
        $user = User::factory()->create();
        $firebaseStorage = app(FirebaseOAuthStorage::class);
        
        // Create a token for the user
        $token = $firebaseStorage->createAccessToken($user->id, '1');

        $todoData = [
            'title' => 'New Todo',
            'description' => 'Todo description',
            'due_date' => '2024-12-31',
            'priority' => 'high',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->id,
        ])->postJson('/api/todos', $todoData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'todo' => [
                        'id',
                        'title',
                        'description',
                        'completed',
                        'user_id',
                        'due_date',
                        'priority',
                    ],
                ]);
    }

    public function test_authenticated_user_can_get_specific_todo()
    {
        $user = User::factory()->create();
        $firebaseStorage = app(FirebaseOAuthStorage::class);
        
        // Create a token for the user
        $token = $firebaseStorage->createAccessToken($user->id, '1');
        
        // Create a todo
        $todoId = Todo::createInFirebase([
            'title' => 'Test Todo',
            'user_id' => $user->id,
            'completed' => false,
            'priority' => 'medium',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->id,
        ])->getJson("/api/todos/{$todoId}");

        $response->assertStatus(200)
                ->assertJson([
                    'title' => 'Test Todo',
                    'user_id' => $user->id,
                ]);
    }

    public function test_authenticated_user_can_update_todo()
    {
        $user = User::factory()->create();
        $firebaseStorage = app(FirebaseOAuthStorage::class);
        
        // Create a token for the user
        $token = $firebaseStorage->createAccessToken($user->id, '1');
        
        // Create a todo
        $todoId = Todo::createInFirebase([
            'title' => 'Original Title',
            'user_id' => $user->id,
            'completed' => false,
            'priority' => 'medium',
        ]);

        $updateData = [
            'title' => 'Updated Title',
            'priority' => 'high',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->id,
        ])->putJson("/api/todos/{$todoId}", $updateData);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Todo updated successfully',
                    'todo' => [
                        'title' => 'Updated Title',
                        'priority' => 'high',
                    ],
                ]);
    }

    public function test_authenticated_user_can_delete_todo()
    {
        $user = User::factory()->create();
        $firebaseStorage = app(FirebaseOAuthStorage::class);
        
        // Create a token for the user
        $token = $firebaseStorage->createAccessToken($user->id, '1');
        
        // Create a todo
        $todoId = Todo::createInFirebase([
            'title' => 'Todo to Delete',
            'user_id' => $user->id,
            'completed' => false,
            'priority' => 'medium',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->id,
        ])->deleteJson("/api/todos/{$todoId}");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Todo deleted successfully',
                ]);
    }

    public function test_authenticated_user_can_toggle_todo()
    {
        $user = User::factory()->create();
        $firebaseStorage = app(FirebaseOAuthStorage::class);
        
        // Create a token for the user
        $token = $firebaseStorage->createAccessToken($user->id, '1');
        
        // Create a todo
        $todoId = Todo::createInFirebase([
            'title' => 'Test Todo',
            'user_id' => $user->id,
            'completed' => false,
            'priority' => 'medium',
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->id,
        ])->patchJson("/api/todos/{$todoId}/toggle");

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Todo status toggled successfully',
                    'todo' => [
                        'completed' => true,
                    ],
                ]);
    }

    public function test_unauthenticated_user_cannot_access_todo_endpoints()
    {
        $response = $this->getJson('/api/todos');
        $response->assertStatus(401);

        $response = $this->postJson('/api/todos', ['title' => 'Test']);
        $response->assertStatus(401);
    }
}
