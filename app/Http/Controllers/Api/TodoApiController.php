<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Kreait\Firebase\Contract\Database;

/**
 * TodoApiController - Handles all Todo-related API operations
 * 
 * This controller manages CRUD operations for todos through the API.
 * It integrates with Firebase Realtime Database for data storage and
 * ensures that users can only access their own todos.
 * 
 * Key Features:
 * - Session-based authentication (requires user to be logged in)
 * - Firebase integration for data persistence
 * - User isolation (users can only see/modify their own todos)
 * - Comprehensive error handling and logging
 */
class TodoApiController extends Controller
{
    /**
     * Firebase database instance for todo operations
     * @var Database
     */
    protected $database;

    /**
     * Constructor - Initializes the controller with Firebase database
     * 
     * @param Database $database Firebase database instance injected by Laravel
     */
    public function __construct(Database $database)
    {
        $this->database = $database;
        // Auth middleware is now handled by the route group in web.php
        // This ensures session authentication is properly enforced
    }

    /**
     * Display a listing of todos for the authenticated user
     * 
     * Retrieves all todos from Firebase and filters them by the current user's email.
     * Only returns todos that belong to the authenticated user.
     * 
     * @return JsonResponse JSON response containing user's todos or error message
     */
    public function index(): JsonResponse
    {
        try {
            // Get the currently authenticated user from the session
            $user = Auth::user();
            
            // Verify user is authenticated
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Retrieve all todos from Firebase
            $todos = Todo::getAllFromFirebase();
            
            // Filter todos to only show those belonging to the authenticated user
            // This ensures data isolation between users
            $userTodos = [];
            foreach ($todos as $id => $todo) {
                if (isset($todo['user_id']) && $todo['user_id'] === $user->email) {
                    $userTodos[$id] = $todo;
                }
            }
            
            // Return filtered todos
            return response()->json([
                'success' => true,
                'data' => $userTodos
            ]);
        } catch (\Exception $e) {
            // Log and return error response
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch todos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created todo in Firebase
     * 
     * Creates a new todo and automatically links it to the authenticated user.
     * Validates required fields and logs the creation process for debugging.
     * 
     * @param Request $request HTTP request containing todo data
     * @return JsonResponse JSON response indicating success/failure
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Verify user authentication
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Log the start of task creation for debugging
            \Log::info('Task creation started', ['request_data' => $request->all()]);
            
            // Validate the incoming request data
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'nullable|date',
            ]);

            // Log authenticated user information
            \Log::info('Authenticated user', ['user_id' => $user->id, 'user_email' => $user->email]);
            
            // Prepare todo data by merging request data with user information
            // This ensures the todo is properly linked to the user
            $todoData = array_merge($request->all(), [
                'user_id' => $user->email, // Use email as user identifier for Firebase
                'user_name' => $user->name, // Store user name for display purposes
            ]);

            // Log the prepared todo data
            \Log::info('Todo data prepared', ['todo_data' => $todoData]);

            // Create the todo in Firebase and get the generated ID
            $todoId = Todo::createInFirebase($todoData);
            \Log::info('Todo created in Firebase', ['todo_id' => $todoId]);

            // Return success response with the new todo ID
            return response()->json([
                'success' => true,
                'message' => 'Todo created successfully',
                'data' => ['id' => $todoId]
            ], 201);
        } catch (\Exception $e) {
            // Log detailed error information for debugging
            \Log::error('Task creation failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return error response
            return response()->json([
                'success' => false,
                'message' => 'Failed to create todo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified todo
     * 
     * Retrieves a specific todo by ID and verifies that the authenticated user
     * has permission to view it.
     * 
     * @param string $id The Firebase ID of the todo
     * @return JsonResponse JSON response containing the todo or error message
     */
    public function show(string $id): JsonResponse
    {
        try {
            // Verify user authentication
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Retrieve the specific todo from Firebase
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();

            // Check if todo exists
            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
            }

            // Verify the todo belongs to the authenticated user
            // This prevents users from accessing other users' todos
            if (!isset($todo['user_id']) || $todo['user_id'] !== $user->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this todo'
                ], 403);
            }

            // Return the todo data
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
     * Update the specified todo in Firebase
     * 
     * Updates an existing todo with new data while preserving existing fields.
     * Ensures only the todo owner can modify it.
     * 
     * @param Request $request HTTP request containing update data
     * @param string $id The Firebase ID of the todo to update
     * @return JsonResponse JSON response indicating success/failure
     */
    public function update(Request $request, string $id): JsonResponse
    {
        // Validate the incoming update data
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'sometimes|boolean',
            'due_date' => 'nullable|date'
        ]);

        try {
            // Verify user authentication
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Retrieve the existing todo from Firebase
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();

            // Check if todo exists
            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
            }

            // Verify the todo belongs to the authenticated user
            if (!isset($todo['user_id']) || $todo['user_id'] !== $user->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this todo'
                ], 403);
            }

            // Merge existing todo data with new data and update timestamp
            $updatedData = array_merge($todo, $request->all());
            $updatedData['updated_at'] = now()->toISOString();

            // Update the todo in Firebase
            $ref->set($updatedData);

            // Return success response with updated data
            return response()->json([
                'success' => true,
                'message' => 'Todo updated successfully',
                'data' => $updatedData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update todo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified todo from Firebase
     * 
     * Deletes a todo after verifying that the authenticated user owns it.
     * 
     * @param string $id The Firebase ID of the todo to delete
     * @return JsonResponse JSON response indicating success/failure
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            // Verify user authentication
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Retrieve the todo to verify ownership
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();

            // Check if todo exists
            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
            }

            // Verify the todo belongs to the authenticated user
            if (!isset($todo['user_id']) || $todo['user_id'] !== $user->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this todo'
                ], 403);
            }

            // Delete the todo from Firebase
            $ref->remove();

            // Return success response
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
     * Toggle the completion status of a todo
     * 
     * Switches a todo between completed and incomplete states.
     * Only the todo owner can toggle its completion status.
     * 
     * @param string $id The Firebase ID of the todo to toggle
     * @return JsonResponse JSON response indicating success/failure
     */
    public function toggleComplete(string $id): JsonResponse
    {
        try {
            // Verify user authentication
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Retrieve the todo to verify ownership
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();

            // Check if todo exists
            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
            }

            // Verify the todo belongs to the authenticated user
            if (!isset($todo['user_id']) || $todo['user_id'] !== $user->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this todo'
                ], 403);
            }

            // Toggle the completion status (true becomes false, false becomes true)
            $todo['completed'] = !($todo['completed'] ?? false);
            $todo['updated_at'] = now()->toISOString();

            // Update the todo in Firebase
            $ref->set($todo);

            // Return success response with updated data
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
