<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Kreait\Firebase\Contract\Database;
use App\Services\FirebasePassportBridge;

/**
 * @OA\Schema(
 *     schema="User",
 *     title="User",
 *     description="User model",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="google_id", type="string", nullable=true, example="123456789"),
 *     @OA\Property(property="email_verified_at", type="string", format="date-time", nullable=true, example="2024-01-01T00:00:00.000000Z"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T00:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T00:00:00.000000Z")
 * )
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Firebase collection name
     */
    protected $collection = 'users';

    /**
     * Get Firebase database instance
     */
    public static function getFirebaseDatabase(): Database
    {
        return app('firebase.database');
    }

    /**
     * Create a new user in Firebase
     */
    public static function createInFirebase(array $data)
    {
        $database = self::getFirebaseDatabase();
        $ref = $database->getReference(self::getCollectionName());
        
        $userData = array_merge($data, [
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString()
        ]);
        
        $newRef = $ref->push($userData);
        return $newRef->getKey();
    }

    /**
     * Get all users from Firebase
     */
    public static function getAllFromFirebase()
    {
        $database = self::getFirebaseDatabase();
        $ref = $database->getReference(self::getCollectionName());
        $snapshot = $ref->getSnapshot();
        
        return $snapshot->getValue() ?? [];
    }

    /**
     * Get collection name for Firebase
     */
    protected static function getCollectionName(): string
    {
        return (new static)->collection;
    }

    /**
     * Override the createToken method to use Firebase
     */
    public function createToken($name, array $scopes = [])
    {
        $firebaseBridge = app(FirebasePassportBridge::class);
        return $firebaseBridge->createPersonalAccessToken($this, $name, $scopes);
    }

    /**
     * Override the tokens method to use Firebase
     */
    public function tokens()
    {
        $firebaseBridge = app(FirebasePassportBridge::class);
        return new class($firebaseBridge, $this->id) {
            protected $firebaseBridge;
            protected $userId;

            public function __construct($firebaseBridge, $userId)
            {
                $this->firebaseBridge = $firebaseBridge;
                $this->userId = $userId;
            }

            public function update(array $attributes)
            {
                // This is a simplified implementation
                // In a real scenario, you'd want to handle this more robustly
                return true;
            }
        };
    }
}
