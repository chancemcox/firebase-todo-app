<?php

namespace App\Models;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as AuthenticatableUser;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Kreait\Firebase\Contract\Database;
use App\Services\FirebasePassportBridge;
use Illuminate\Support\Facades\Hash;

/**
 * @OA\Schema(
 *     schema="User",
 *     title="User",
 *     description="User model",
 *     @OA\Property(property="id", type="string", example="user123"),
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="google_id", type="string", nullable=true, example="123456789"),
 *     @OA\Property(property="email_verified_at", type="string", format="date-time", nullable=true, example="2024-01-01T00:00:00.000000Z"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T00:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T00:00:00.000000Z")
 * )
 */
class User implements Authenticatable, CanResetPassword
{
    use HasApiTokens, Notifiable;

    /**
     * Firebase collection name
     */
    protected $collection = 'users';

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
     * Constructor to initialize the User object
     */
    public function __construct(array $attributes = [])
    {
        if (!empty($attributes)) {
            foreach ($attributes as $key => $value) {
                $this->$key = $value;
            }
        }
    }

    /**
     * Get Firebase database instance
     */
    public static function getFirebaseDatabase(): Database
    {
        return app('firebase.database');
    }

    /**
     * Get collection name for Firebase
     */
    protected static function getCollectionName(): string
    {
        return (new static)->collection;
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
        $userId = $newRef->getKey();
        
        // Create and return the user object directly
        $user = new static($userData);
        $user->id = $userId;
        
        return $user;
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
     * Find a user by ID in Firebase
     */
    public static function findInFirebase($id)
    {
        $database = self::getFirebaseDatabase();
        $ref = $database->getReference(self::getCollectionName() . '/' . $id);
        $userData = $ref->getSnapshot()->getValue();
        
        if ($userData) {
            $user = new static($userData);
            $user->id = $id;
            return $user;
        }
        
        return null;
    }

    /**
     * Find a user by email in Firebase
     */
    public static function findByEmailInFirebase($email)
    {
        $database = self::getFirebaseDatabase();
        $ref = $database->getReference(self::getCollectionName());
        $snapshot = $ref->getSnapshot();
        $users = $snapshot->getValue() ?? [];
        
        foreach ($users as $id => $userData) {
            if (isset($userData['email']) && $userData['email'] === $email) {
                $user = new static($userData);
                $user->id = $id;
                return $user;
            }
        }
        
        return null;
    }

    /**
     * Update user in Firebase
     */
    public function updateInFirebase(array $data)
    {
        $database = self::getFirebaseDatabase();
        $ref = $database->getReference(self::getCollectionName() . '/' . $this->id);
        
        $updateData = array_merge($data, [
            'updated_at' => now()->toISOString()
        ]);
        
        $ref->update($updateData);
        
        // Update local model
        foreach ($data as $key => $value) {
            $this->$key = $value;
        }
        
        return $this;
    }

    /**
     * Delete user from Firebase
     */
    public function deleteFromFirebase()
    {
        $database = self::getFirebaseDatabase();
        $ref = $database->getReference(self::getCollectionName() . '/' . $this->id);
        $ref->remove();
        
        return true;
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

    // Authenticatable interface methods
    public function getAuthIdentifierName()
    {
        return 'id';
    }

    public function getAuthIdentifier()
    {
        return $this->id;
    }

    public function getAuthPassword()
    {
        return $this->password;
    }

    public function getRememberToken()
    {
        return $this->remember_token;
    }

    public function setRememberToken($value)
    {
        $this->remember_token = $value;
    }

    public function getRememberTokenName()
    {
        return 'remember_token';
    }

    // CanResetPassword interface methods
    public function getEmailForPasswordReset()
    {
        return $this->email;
    }

    public function sendPasswordResetNotification($token)
    {
        // Implement password reset notification logic
    }

    // Factory method for testing
    public static function factory()
    {
        return new class {
            public function create(array $attributes = [])
            {
                $defaults = [
                    'name' => 'Test User',
                    'email' => 'test@example.com',
                    'password' => Hash::make('password'),
                ];
                
                $userData = array_merge($defaults, $attributes);
                return User::createInFirebase($userData);
            }
        };
    }

    // Magic methods for dynamic property access
    public function __get($name)
    {
        if (property_exists($this, $name)) {
            return $this->$name;
        }
        
        // Check if the property exists in the data array
        if (isset($this->data[$name])) {
            return $this->data[$name];
        }
        
        return null;
    }

    public function __set($name, $value)
    {
        $this->$name = $value;
        
        // Also store in data array for serialization
        if (!isset($this->data)) {
            $this->data = [];
        }
        $this->data[$name] = $value;
    }

    public function __isset($name)
    {
        return property_exists($this, $name) || (isset($this->data) && isset($this->data[$name]));
    }

    // Add a method to get all attributes for serialization
    public function toArray()
    {
        $attributes = [];
        
        // Get all fillable attributes
        foreach ($this->fillable as $attribute) {
            if (isset($this->$attribute)) {
                $attributes[$attribute] = $this->$attribute;
            }
        }
        
        // Add ID and timestamps
        $attributes['id'] = $this->id;
        if (isset($this->created_at)) {
            $attributes['created_at'] = $this->created_at;
        }
        if (isset($this->updated_at)) {
            $attributes['updated_at'] = $this->updated_at;
        }
        
        return $attributes;
    }
}
