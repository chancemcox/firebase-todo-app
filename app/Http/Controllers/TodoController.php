<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Kreait\Firebase\Contract\Database;

class TodoController extends Controller
{
    protected $database;

    public function __construct(Database $database)
    {
        $this->database = $database;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            $todos = Todo::getAllFromFirebase();
            
            // Filter todos by the authenticated user
            $userTodos = [];
            foreach ($todos as $id => $todo) {
                if (isset($todo['user_id']) && $todo['user_id'] === $user->email) {
                    $userTodos[$id] = $todo;
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => $userTodos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch todos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            \Log::info('Task creation started', ['request_data' => $request->all()]);
            
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'nullable|date',
            ]);

            $user = Auth::user();
            \Log::info('Authenticated user', ['user_id' => $user->id, 'user_email' => $user->email]);
            
            // Automatically link the todo to the authenticated user
            $todoData = array_merge($request->all(), [
                'user_id' => $user->email, // Use email as user identifier
                'user_name' => $user->name, // Store user name for display
            ]);

            \Log::info('Todo data prepared', ['todo_data' => $todoData]);

            $todoId = Todo::createInFirebase($todoData);
            \Log::info('Todo created in Firebase', ['todo_id' => $todoId]);

            return response()->json([
                'success' => true,
                'message' => 'Todo created successfully',
                'data' => ['id' => $todoId]
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Task creation failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create todo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();

            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
            }

            // Check if the todo belongs to the authenticated user
            if (!isset($todo['user_id']) || $todo['user_id'] !== $user->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this todo'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $todo
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch todo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Todo $todo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'sometimes|boolean',
            'due_date' => 'nullable|date'
        ]);

        try {
            $user = Auth::user();
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();

            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
            }

            // Check if the todo belongs to the authenticated user
            if (!isset($todo['user_id']) || $todo['user_id'] !== $user->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this todo'
                ], 403);
            }

            $updateData = array_merge($todo, $request->all(), [
                'updated_at' => now()->toISOString()
            ]);

            $ref->set($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Todo updated successfully',
                'data' => $updateData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update todo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();

            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
            }

            // Check if the todo belongs to the authenticated user
            if (!isset($todo['user_id']) || $todo['user_id'] !== $user->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this todo'
                ], 403);
            }

            $ref->remove();

            return response()->json([
                'success' => true,
                'message' => 'Todo deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete todo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle todo completion status
     */
    public function toggleComplete(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();

            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
            }

            // Check if the todo belongs to the authenticated user
            if (!isset($todo['user_id']) || $todo['user_id'] !== $user->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this todo'
                ], 403);
            }

            $todo['completed'] = !($todo['completed'] ?? false);
            $todo['updated_at'] = now()->toISOString();

            $ref->set($todo);

            return response()->json([
                'success' => true,
                'message' => 'Todo status updated',
                'data' => $todo
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update todo status: ' . $e->getMessage()
            ], 500);
        }
    }
}
