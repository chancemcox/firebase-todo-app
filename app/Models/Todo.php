<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kreait\Firebase\Contract\Database;

/**
 * @OA\Schema(
 *     schema="Todo",
 *     title="Todo",
 *     description="Todo model",
 *     @OA\Property(property="id", type="string", example="todo123"),
 *     @OA\Property(property="title", type="string", example="Complete project"),
 *     @OA\Property(property="description", type="string", nullable=true, example="Finish the Laravel API project"),
 *     @OA\Property(property="completed", type="boolean", example=false),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="due_date", type="string", format="date", nullable=true, example="2024-12-31"),
 *     @OA\Property(property="priority", type="string", enum={"low", "medium", "high"}, example="medium"),
 *     @OA\Property(property="created_at", type="string", format="date-time", example="2024-01-01T00:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="date-time", example="2024-01-01T00:00:00.000000Z")
 * )
 */
class Todo extends Model
{
    use HasFactory;

    /**
     * Firebase collection name
     */
    protected $collection = 'todos';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'completed',
        'user_id',
        'due_date',
        'priority',
    ];

    /**
     * The attributes that should be cast.
     * Note: Disabled Eloquent casting for Firebase compatibility
     *
     * @var array<string, string>
     */
    protected $casts = [];

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
     * Get all todos for a specific user from Firebase
     */
    public static function getTodosForUser($userId)
    {
        $database = self::getFirebaseDatabase();
        $ref = $database->getReference(self::getCollectionName());
        $snapshot = $ref->getSnapshot();
        
        $todos = $snapshot->getValue() ?? [];
        $result = [];
        
        foreach ($todos as $id => $todoData) {
            if (isset($todoData['user_id']) && $todoData['user_id'] == $userId) {
                $todo = new static($todoData);
                $todo->id = $id;
                $result[] = $todo;
            }
        }
        
        return collect($result);
    }

    /**
     * Get a specific todo by ID from Firebase
     */
    public static function findInFirebase($id)
    {
        $database = self::getFirebaseDatabase();
        $ref = $database->getReference(self::getCollectionName() . '/' . $id);
        $todoData = $ref->getSnapshot()->getValue();
        
        if ($todoData) {
            $todo = new static($todoData);
            $todo->id = $id;
            return $todo;
        }
        
        return null;
    }

    /**
     * Create a new todo in Firebase
     */
    public static function createInFirebase(array $data)
    {
        $database = self::getFirebaseDatabase();
        $ref = $database->getReference(self::getCollectionName());
        
        $todoData = array_merge($data, [
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString()
        ]);
        
        $newRef = $ref->push($todoData);
        return $newRef->getKey();
    }

    /**
     * Update a todo in Firebase
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
     * Delete a todo from Firebase
     */
    public function deleteFromFirebase()
    {
        $database = self::getFirebaseDatabase();
        $ref = $database->getReference(self::getCollectionName() . '/' . $this->id);
        $ref->remove();
        
        return true;
    }

    /**
     * Toggle the completed status of a todo
     */
    public function toggle()
    {
        $this->completed = !$this->completed;
        $this->updateInFirebase(['completed' => $this->completed]);
        
        return $this;
    }

    /**
     * Get the user that owns the todo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Resolve the model for route model binding
     */
    public function resolveRouteBinding($value, $field = null)
    {
        return static::findInFirebase($value);
    }

    /**
     * Resolve the model for route model binding with a custom query
     */
    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        // Override to prevent Eloquent from trying to use database
        return static::findInFirebase($value);
    }
}
