<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. This means they have access
| to session middleware, CSRF protection, and other web-specific features.
|
| Key Features:
| - Session-based authentication
| - CSRF protection
| - Cookie handling
| - View rendering
| - Blade template support
|
*/

/**
 * Public Routes (No Authentication Required)
 * These routes are accessible to all visitors
 */

// Homepage - Landing page for the application
Route::get('/', function () {
    return view('home');
});

/**
 * Protected Routes (Authentication Required)
 * These routes require users to be logged in
 */

// Dashboard - Main user dashboard after login
Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// User Profile Management - Protected by authentication
Route::middleware('auth')->group(function () {
    // Profile editing and management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Include authentication routes (login, register, password reset, etc.)
require __DIR__.'/auth.php';

/**
 * OAuth Authentication Routes
 * Google OAuth integration for user authentication
 */

// Google OAuth Routes - Handle Google sign-in flow
Route::get('auth/google', [App\Http\Controllers\Auth\GoogleController::class, 'redirectToGoogle'])->name('google.login');
Route::get('auth/google/callback', [App\Http\Controllers\Auth\GoogleController::class, 'handleGoogleCallback'])->name('google.callback');

/**
 * Task Sharing Routes (Protected by Authentication)
 * These routes allow users to share tasks with other users via email
 */

Route::middleware('auth')->group(function () {
    // Share a task with another user
    Route::post('/task-shares', [App\Http\Controllers\TaskShareController::class, 'share'])->name('task-shares.share');
    
    // View tasks shared with the current user
    Route::get('/task-shares/shared-with-me', [App\Http\Controllers\TaskShareController::class, 'sharedWithMe'])->name('task-shares.shared-with-me');
    
    // View tasks shared by the current user
    Route::get('/task-shares/shared-by-me', [App\Http\Controllers\TaskShareController::class, 'sharedByMe'])->name('task-shares.shared-by-me');
    
    // Accept a shared task
    Route::patch('/task-shares/{id}/accept', [App\Http\Controllers\TaskShareController::class, 'accept'])->name('task-shares.accept');
    
    // Decline a shared task
    Route::patch('/task-shares/{id}/decline', [App\Http\Controllers\TaskShareController::class, 'decline'])->name('task-shares.decline');
    
    // Cancel a task share
    Route::delete('/task-shares/{id}/cancel', [App\Http\Controllers\TaskShareController::class, 'cancel'])->name('task-shares.cancel');
});

/**
 * Todo Management Routes (Protected by Authentication)
 * These routes provide the main todo functionality for the web interface
 */

// Todo List Page - Main interface for viewing and managing todos
Route::get('/todos', function () {
    return view('todos.index');
})->middleware(['auth'])->name('todos.index');

// Todo API Routes - Protected by auth middleware (for web interface with session authentication)
// These routes are prefixed with /web-api but use web middleware for session support
// Note: Changed from /api to /web-api to avoid conflicts with token-based API routes
Route::middleware('auth')->prefix('web-api')->group(function () {
    // Get all todos for the authenticated user
    Route::get('/todos', [App\Http\Controllers\Api\TodoApiController::class, 'index']);
    
    // Create a new todo
    Route::post('/todos', [App\Http\Controllers\Api\TodoApiController::class, 'store']);
    
    // Get a specific todo by ID
    Route::get('/todos/{id}', [App\Http\Controllers\Api\TodoApiController::class, 'show']);
    
    // Update an existing todo
    Route::put('/todos/{id}', [App\Http\Controllers\Api\TodoApiController::class, 'update']);
    
    // Delete a todo
    Route::delete('/todos/{id}', [App\Http\Controllers\Api\TodoApiController::class, 'destroy']);
    
    // Toggle todo completion status
    Route::patch('/todos/{id}/toggle', [App\Http\Controllers\Api\TodoApiController::class, 'toggleComplete']);
});

// API Documentation route
Route::get('/apidoc', function () {
    return view('apidoc');
})->name('apidoc');
