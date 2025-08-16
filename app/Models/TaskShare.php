<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskShare extends Model
{
    use HasFactory;

    protected $fillable = [
        'todo_id',
        'shared_by_user_id',
        'shared_with_email',
        'status',
        'message',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who shared the task
     */
    public function sharedBy()
    {
        return $this->belongsTo(User::class, 'shared_by_user_id');
    }

    /**
     * Get the user who received the shared task
     */
    public function sharedWith()
    {
        return $this->belongsTo(User::class, 'shared_with_email', 'email');
    }

    /**
     * Scope for pending shares
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for accepted shares
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }
}
