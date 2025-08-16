<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * TodoController - Handles API todo management operations
 * 
 * This controller manages CRUD operations for todos through the API using
 * token-based authentication. It integrates with Firebase Realtime Database
 * for data storage and includes comprehensive OpenAPI documentation.
 * 
 * Key Features:
 * - Token-based authentication (Bearer token required)
 * - Firebase integration for data persistence
 * - User isolation (users can only access their own todos)
 * - Priority-based todo management
 * - Completion status tracking
 * - Comprehensive OpenAPI documentation
 * 
 * Note: This controller is designed for API token authentication,
 * while TodoApiController handles session-based authentication for web interface.
 * 
 * @OA\Tag(
 *     name="Todos",
 *     description="API Endpoints for todo management"
 * )
 */
class TodoController extends Controller
{
    /**
     * Display a listing of todos for the authenticated user
     * 
     * Retrieves all todos belonging to the currently authenticated user.
     * Uses the user's ID from the token to filter todos.
     * 
     * OpenAPI Documentation:
     * - Endpoint: GET /api/todos
     * - Requires: Authentication (Bearer token)
     * - Returns: Array of user's todos
     * 
     * @param Request $request HTTP request (must include valid access token)
     * @return JsonResponse JSON response containing user's todos
     * 
     * @OA\Get(
     *     path="/api/todos",
     *     summary="Get all todos for the authenticated user",
     *     tags={"Todos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="List of todos",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/Todo")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        // Get todos for the authenticated user using their ID from the token
        $todos = Todo::getTodosForUser($request->user()->id);
        
        // Return the todos as JSON response
        return response()->json($todos);
    }

    /**
     * Store a newly created todo in Firebase
     * 
     * Creates a new todo with validated data and automatically links it
     * to the authenticated user. Sets default values for completion status
     * and priority if not provided.
     * 
     * OpenAPI Documentation:
     * - Endpoint: POST /api/todos
     * - Requires: Authentication (Bearer token)
     * - Required fields: title
     * - Optional fields: description, due_date, priority
     * - Returns: Created todo data
     * 
     * @param Request $request HTTP request containing todo creation data
     * @return JsonResponse JSON response with created todo data
     * 
     * @OA\Post(
     *     path="/api/todos",
     *     summary="Create a new todo",
     *     tags={"Todos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title"},
     *             @OA\Property(property="title", type="string", example="Complete project"),
     *             @OA\Property(property="description", type="string", nullable=true, example="Finish the Laravel API project"),
     *             @OA\Property(property="due_date", type="string", format="date", nullable=true, example="2024-12-31"),
     *             @OA\Property(property="priority", type="string", enum={"low", "medium", "high"}, example="medium")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Todo created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Todo created successfully"),
     *             @OA\Property(property="todo", ref="#/components/schemas/Todo")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function store(Request $request): JsonResponse
    {
        // Validate the incoming todo creation data
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|in:low,medium,high',
        ]);

        // Prepare todo data by merging request data with default values
        $todoData = array_merge($request->all(), [
            'user_id' => $request->user()->id, // Link todo to authenticated user
            'completed' => false, // Default to incomplete
            'priority' => $request->priority ?? 'medium', // Default priority
        ]);

        // Create the todo in Firebase and get the generated ID
        $todoId = Todo::createInFirebase($todoData);
        
        // Retrieve the created todo to return in response
        $todo = Todo::findInFirebase($todoId);

        // Return success response with created todo data
        return response()->json([
            'message' => 'Todo created successfully',
            'todo' => $todo,
        ], 201);
    }

    /**
     * Display the specified todo
     * 
     * Retrieves a specific todo by ID and verifies that the authenticated user
     * has permission to view it. Only returns todos belonging to the user.
     * 
     * OpenAPI Documentation:
     * - Endpoint: GET /api/todos/{todo}
     * - Requires: Authentication (Bearer token)
     * - Returns: Specific todo data
     * 
     * @param Request $request HTTP request (must include valid access token)
     * @param Todo $todo The todo model instance (automatically resolved by Laravel)
     * @return JsonResponse JSON response containing the todo data
     * 
     * @OA\Get(
     *     path="/api/todos/{todo}",
     *     summary="Get a specific todo",
     *     tags={"Todos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="todo",
     *         in="path",
     *         required=true,
     *         description="Todo ID",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Todo details",
     *         @OA\JsonContent(ref="#/components/schemas/Todo")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Todo not found"
     *     )
     * )
     */
    public function show(Request $request, Todo $todo): JsonResponse
    {
        // Verify the todo belongs to the authenticated user
        if ($todo->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this todo');
        }

        // Return the todo data
        return response()->json($todo);
    }

    /**
     * Update the specified todo in Firebase
     * 
     * Updates an existing todo with new data while preserving existing fields.
     * Ensures only the todo owner can modify it.
     * 
     * OpenAPI Documentation:
     * - Endpoint: PUT /api/todos/{todo}
     * - Requires: Authentication (Bearer token)
     * - Accepts: title, description, due_date, priority, completed
     * - Returns: Updated todo data
     * 
     * @param Request $request HTTP request containing update data
     * @param Todo $todo The todo model instance to update
     * @return JsonResponse JSON response with updated todo data
     * 
     * @OA\Put(
     *     path="/api/todos/{todo}",
     *     summary="Update a todo",
     *     tags={"Todos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="todo",
     *         in="path",
     *         required=true,
     *         description="Todo ID",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", example="Updated project title"),
     *             @OA\Property(property="description", type="string", nullable=true),
     *             @OA\Property(property="due_date", type="string", format="date", nullable=true),
     *             @OA\Property(property="priority", type="string", enum={"low", "medium", "high"}),
     *             @OA\Property(property="completed", type="boolean")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Todo updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Todo updated successfully"),
     *             @OA\Property(property="todo", ref="#/components/schemas/Todo")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function update(Request $request, Todo $todo): JsonResponse
    {
        // Verify the todo belongs to the authenticated user
        if ($todo->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this todo');
        }

        // Validate the incoming update data
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'sometimes|in:low,medium,high',
            'completed' => 'sometimes|boolean',
        ]);

        // Update the todo with new data
        $todo->updateInFirebase($request->all());

        // Return success response with updated todo data
        return response()->json([
            'message' => 'Todo updated successfully',
            'todo' => $todo,
        ]);
    }

    /**
     * Remove the specified todo from Firebase
     * 
     * Deletes a todo after verifying that the authenticated user owns it.
     * This action is irreversible.
     * 
     * OpenAPI Documentation:
     * - Endpoint: DELETE /api/todos/{todo}
     * - Requires: Authentication (Bearer token)
     * - Returns: Success message
     * 
     * @param Request $request HTTP request (must include valid access token)
     * @param Todo $todo The todo model instance to delete
     * @return JsonResponse JSON response confirming deletion
     * 
     * @OA\Delete(
     *     path="/api/todos/{todo}",
     *     summary="Delete a todo",
     *     tags={"Todos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="todo",
     *         in="path",
     *         required=true,
     *         description="Todo ID",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Todo deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Todo deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Todo not found"
     *     )
     * )
     */
    public function destroy(Request $request, Todo $todo): JsonResponse
    {
        // Verify the todo belongs to the authenticated user
        if ($todo->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this todo');
        }

        // Delete the todo
        $todo->delete();

        // Return success response
        return response()->json([
            'message' => 'Todo deleted successfully'
        ]);
    }

    /**
     * Toggle the completion status of a todo
     * 
     * Switches a todo between completed and incomplete states.
     * Only the todo owner can toggle its completion status.
     * 
     * OpenAPI Documentation:
     * - Endpoint: PATCH /api/todos/{todo}/toggle
     * - Requires: Authentication (Bearer token)
     * - Returns: Updated todo data
     * 
     * @param Request $request HTTP request (must include valid access token)
     * @param Todo $todo The todo model instance to toggle
     * @return JsonResponse JSON response with updated todo data
     * 
     * @OA\Patch(
     *     path="/api/todos/{todo}/toggle",
     *     summary="Toggle todo completion status",
     *     tags={"Todos"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="todo",
     *         in="path",
     *         required=true,
     *         description="Todo ID",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Todo status updated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Todo status updated"),
     *             @OA\Property(property="todo", ref="#/components/schemas/Todo")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Todo not found"
     *     )
     * )
     */
    public function toggle(Request $request, Todo $todo): JsonResponse
    {
        // Verify the todo belongs to the authenticated user
        if ($todo->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this todo');
        }

        // Toggle the completion status
        $todo->updateInFirebase([
            'completed' => !$todo->completed
        ]);

        // Return success response with updated todo data
        return response()->json([
            'message' => 'Todo status toggled successfully',
            'todo' => $todo,
        ]);
    }
}
