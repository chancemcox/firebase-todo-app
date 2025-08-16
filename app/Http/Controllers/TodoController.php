<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
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
            $todos = Todo::getAllFromFirebase();
            return response()->json([
                'success' => true,
                'data' => $todos
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
     *
     * @return \Illuminate\Http\Response
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
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'user_id' => 'nullable|string'
        ]);

        try {
            $todoId = Todo::createInFirebase($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Todo created successfully',
                'data' => ['id' => $todoId]
            ], 201);
        } catch (\Exception $e) {
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
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();
            
            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
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
     *
     * @param  \App\Models\Todo  $todo
     * @return \Illuminate\Http\Response
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
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();
            
            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
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
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();
            
            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
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
            $ref = $this->database->getReference('todos/' . $id);
            $todo = $ref->getSnapshot()->getValue();
            
            if (!$todo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Todo not found'
                ], 404);
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
