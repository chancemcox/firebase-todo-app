<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TodoController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

/**
 * Public API Routes (No Authentication Required)
 * These endpoints are accessible without authentication tokens
 */

// User Registration - Create new user accounts
Route::post('/auth/register', [AuthController::class, 'register']);

// User Login - Authenticate users and receive access tokens
Route::post('/auth/login', [AuthController::class, 'login']);

/**
 * Protected API Routes (Authentication Required)
 * These endpoints require valid Bearer tokens for access
 * 
 * Authentication Flow:
 * 1. User registers/logs in via public routes
 * 2. User receives access token
 * 3. User includes token in Authorization header: "Bearer {token}"
 * 4. User can access protected endpoints
 */

Route::middleware('firebase.api.auth')->group(function () {
    /**
     * User Profile Management
     * Endpoints for managing user account information
     */
    
    // Get authenticated user's profile information
    Route::get('/user', [UserController::class, 'profile']);
    
    // Update user profile (name, email)
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    
    // Change user password (requires current password verification)
    Route::post('/user/change-password', [UserController::class, 'changePassword']);
    
    // Delete user account (permanent action)
    Route::delete('/user/account', [UserController::class, 'deleteAccount']);

    /**
     * Authentication Management
     * Endpoints for managing authentication tokens
     */
    
    // Logout user and revoke current access token
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Refresh access token (get new token while maintaining session)
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);

    /**
     * Todo Management (API Token Authentication)
     * These endpoints use the original TodoController for token-based auth
     * 
     * Note: The web interface uses TodoApiController with session auth
     * This provides flexibility for both web and API clients
     */
    
    // RESTful todo endpoints using Laravel's API resource routing
    Route::apiResource('todos', TodoController::class);
    
    // Custom endpoint for toggling todo completion status
    Route::patch('/todos/{todo}/toggle', [TodoController::class, 'toggle']);
});

/*
|--------------------------------------------------------------------------
| API Documentation
|--------------------------------------------------------------------------
|
| The API includes comprehensive OpenAPI/Swagger documentation
| generated from annotations in the controller files.
|
| Access documentation at: /api/documentation
| OAuth2 callback for documentation: /api/oauth2-callback
|
| Controllers with OpenAPI annotations:
| - AuthController: Authentication endpoints
| - UserController: User profile management
| - TodoController: Todo CRUD operations
|
*/
