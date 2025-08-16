<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_create_user()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
        ];

        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Test User', $user->name);
        $this->assertEquals('test@example.com', $user->email);
        $this->assertTrue(Hash::check('password123', $user->password));
    }

    /** @test */
    public function it_has_required_fillable_fields()
    {
        $fillable = (new User)->getFillable();

        $this->assertContains('name', $fillable);
        $this->assertContains('email', $fillable);
        $this->assertContains('password', $fillable);
        $this->assertContains('google_id', $fillable);
    }

    /** @test */
    public function it_hides_sensitive_fields()
    {
        $hidden = (new User)->getHidden();

        $this->assertContains('password', $hidden);
        $this->assertContains('remember_token', $hidden);
    }

    /** @test */
    public function it_can_create_user_in_firebase()
    {
        $userData = [
            'name' => 'Firebase User',
            'email' => 'firebase@example.com',
            'password' => Hash::make('password123'),
        ];

        $userId = User::createInFirebase($userData);

        $this->assertNotEmpty($userId);
        $this->assertIsString($userId);
    }

    /** @test */
    public function it_can_find_user_in_firebase()
    {
        // First create a user
        $userData = [
            'name' => 'Find User',
            'email' => 'find@example.com',
            'password' => Hash::make('password123'),
        ];

        $userId = User::createInFirebase($userData);

        // Now find the user
        $foundUser = User::findInFirebase($userId);

        $this->assertNotNull($foundUser);
        $this->assertEquals('Find User', $foundUser->name);
        $this->assertEquals('find@example.com', $foundUser->email);
    }

    /** @test */
    public function it_can_find_user_by_email_in_firebase()
    {
        // First create a user
        $userData = [
            'name' => 'Email User',
            'email' => 'email@example.com',
            'password' => Hash::make('password123'),
        ];

        User::createInFirebase($userData);

        // Now find the user by email
        $foundUser = User::findByEmailInFirebase('email@example.com');

        $this->assertNotNull($foundUser);
        $this->assertEquals('Email User', $foundUser->name);
        $this->assertEquals('email@example.com', $foundUser->email);
    }

    /** @test */
    public function it_returns_null_for_nonexistent_user()
    {
        $user = User::findInFirebase('nonexistent-id');

        $this->assertNull($user);
    }

    /** @test */
    public function it_returns_null_for_nonexistent_email()
    {
        $user = User::findByEmailInFirebase('nonexistent@example.com');

        $this->assertNull($user);
    }

    /** @test */
    public function it_can_update_user()
    {
        $user = User::create([
            'name' => 'Original Name',
            'email' => 'update@example.com',
            'password' => Hash::make('password123'),
        ]);

        $user->update(['name' => 'Updated Name']);

        $this->assertEquals('Updated Name', $user->fresh()->name);
    }

    /** @test */
    public function it_can_delete_user()
    {
        $user = User::create([
            'name' => 'Delete User',
            'email' => 'delete@example.com',
            'password' => Hash::make('password123'),
        ]);

        $userId = $user->id;
        $user->delete();

        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    /** @test */
    public function it_validates_email_uniqueness()
    {
        User::create([
            'name' => 'First User',
            'email' => 'duplicate@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        User::create([
            'name' => 'Second User',
            'email' => 'duplicate@example.com',
            'password' => Hash::make('password123'),
        ]);
    }

    /** @test */
    public function it_has_google_id_field()
    {
        $user = User::create([
            'name' => 'Google User',
            'email' => 'google@example.com',
            'password' => Hash::make('password123'),
            'google_id' => 'google123',
        ]);

        $this->assertEquals('google123', $user->google_id);
    }
}
