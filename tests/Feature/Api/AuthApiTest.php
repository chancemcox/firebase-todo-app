<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Services\FirebaseOAuthStorage;
use Illuminate\Foundation\Testing\WithFaker;

class AuthApiTest extends TestCase
{
    use WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Initialize Firebase OAuth storage
        $firebaseStorage = app(FirebaseOAuthStorage::class);
        $firebaseStorage->initializeDefaultClients();
    }

    public function test_user_can_register_via_api()
    {
        $userData = [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'created_at',
                        'updated_at',
                    ],
                    'access_token',
                ]);

        // Verify the user was created by checking the response
        $this->assertEquals($userData['name'], $response->json('user.name'));
        $this->assertEquals($userData['email'], $response->json('user.email'));
    }

    public function test_user_cannot_register_with_invalid_data()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => 'short',
            'password_confirmation' => 'different',
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_user_can_login_via_api()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email',
                    ],
                    'access_token',
                ]);
    }

    public function test_user_cannot_login_with_invalid_credentials()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_logout()
    {
        $user = User::factory()->create();
        $firebaseStorage = app(FirebaseOAuthStorage::class);
        
        // Create a token for the user
        $token = $firebaseStorage->createAccessToken($user->id, '1');
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->id,
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200)
                ->assertJson(['message' => 'Logout successful']);
    }

    public function test_authenticated_user_can_refresh_token()
    {
        $user = User::factory()->create();
        $firebaseStorage = app(FirebaseOAuthStorage::class);
        
        // Create a token for the user
        $token = $firebaseStorage->createAccessToken($user->id, '1');
        
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->id,
        ])->postJson('/api/auth/refresh');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'message',
                    'access_token',
                ]);
    }

    public function test_unauthenticated_user_cannot_access_protected_endpoints()
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }
}
