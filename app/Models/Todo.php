<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kreait\Firebase\Contract\Database;

class Todo extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'completed',
        'user_id',
        'due_date'
    ];

    protected $casts = [
        'completed' => 'boolean',
        'due_date' => 'datetime'
    ];

    // Firebase collection name
    protected $collection = 'todos';

    /**
     * Get Firebase database instance
     */
    public static function getFirebaseDatabase(): Database
    {
        return app('firebase.database');
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
     * Get all todos from Firebase
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
}
