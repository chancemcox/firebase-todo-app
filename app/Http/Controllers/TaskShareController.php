<?php

namespace App\Http\Controllers;

use App\Models\TaskShare;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class TaskShareController extends Controller
{
    /**
     * Share a task with another user via email
     */
    public function share(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'todo_id' => 'required|string',
            'shared_with_email' => 'required|email',
            'message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user is trying to share with themselves
        if ($request->shared_with_email === Auth::user()->email) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot share a task with yourself'
            ], 400);
        }

        // Check if already shared
        $existingShare = TaskShare::where('todo_id', $request->todo_id)
            ->where('shared_with_email', $request->shared_with_email)
            ->where('status', 'pending')
            ->first();

        if ($existingShare) {
            return response()->json([
                'success' => false,
                'message' => 'Task already shared with this user'
            ], 400);
        }

        // Create the share
        $taskShare = TaskShare::create([
            'todo_id' => $request->todo_id,
            'shared_by_user_id' => Auth::id(),
            'shared_with_email' => $request->shared_with_email,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        // Send email notification (you can implement this later)
        // $this->sendShareNotification($taskShare);

        return response()->json([
            'success' => true,
            'message' => 'Task shared successfully',
            'data' => $taskShare
        ]);
    }

    /**
     * Get tasks shared with the current user
     */
    public function sharedWithMe()
    {
        $sharedTasks = TaskShare::where('shared_with_email', Auth::user()->email)
            ->with('sharedBy')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sharedTasks
        ]);
    }

    /**
     * Get tasks shared by the current user
     */
    public function sharedByMe()
    {
        $sharedTasks = TaskShare::where('shared_by_user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sharedTasks
        ]);
    }

    /**
     * Accept a shared task
     */
    public function accept(Request $request, $id)
    {
        $taskShare = TaskShare::where('id', $id)
            ->where('shared_with_email', Auth::user()->email)
            ->where('status', 'pending')
            ->first();

        if (!$taskShare) {
            return response()->json([
                'success' => false,
                'message' => 'Task share not found or already processed'
            ], 404);
        }

        $taskShare->update(['status' => 'accepted']);

        return response()->json([
            'success' => true,
            'message' => 'Task share accepted',
            'data' => $taskShare
        ]);
    }

    /**
     * Decline a shared task
     */
    public function decline(Request $request, $id)
    {
        $taskShare = TaskShare::where('id', $id)
            ->where('shared_with_email', Auth::user()->email)
            ->where('status', 'pending')
            ->first();

        if (!$taskShare) {
            return response()->json([
                'success' => false,
                'message' => 'Task share not found or already processed'
            ], 404);
        }

        $taskShare->update(['status' => 'declined']);

        return response()->json([
            'success' => true,
            'message' => 'Task share declined',
            'data' => $taskShare
        ]);
    }

    /**
     * Cancel a task share (by the person who shared it)
     */
    public function cancel(Request $request, $id)
    {
        $taskShare = TaskShare::where('id', $id)
            ->where('shared_by_user_id', Auth::id())
            ->where('status', 'pending')
            ->first();

        if (!$taskShare) {
            return response()->json([
                'success' => false,
                'message' => 'Task share not found or cannot be cancelled'
            ], 404);
        }

        $taskShare->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task share cancelled'
        ]);
    }

    /**
     * Send email notification for task sharing
     */
    private function sendShareNotification($taskShare)
    {
        // This is a placeholder for email functionality
        // You can implement this using Laravel's Mail facade
        // For now, we'll just log it
        \Log::info('Task shared', [
            'todo_id' => $taskShare->todo_id,
            'shared_by' => $taskShare->sharedBy->email,
            'shared_with' => $taskShare->shared_with_email,
            'message' => $taskShare->message
        ]);
    }
}
