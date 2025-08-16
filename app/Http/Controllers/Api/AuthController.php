<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Services\FirebasePassportBridge;

/**
 * AuthController - Handles API authentication operations
 * 
 * This controller manages user registration, login, logout, and token management
 * through the API. It integrates with Laravel Passport for token-based authentication
 * and includes OpenAPI documentation for API documentation generation.
 * 
 * Key Features:
 * - User registration with validation
 * - User login with credential verification
 * - Token-based authentication using Laravel Passport
 * - Firebase integration for user management
 * - Comprehensive OpenAPI documentation
 * 
 * @OA\Tag(
 *     name="Authentication",
 *     description="API Endpoints for user authentication"
 * )
 */
class AuthController extends Controller
{
    /**
     * Firebase Passport Bridge service for token management
     * This service bridges Laravel Passport with Firebase authentication
     * @var FirebasePassportBridge
     */
    protected $firebaseBridge;

    /**
     * Constructor - Initializes the controller with Firebase Passport Bridge
     * 
     * @param FirebasePassportBridge $firebaseBridge Service for managing Firebase authentication tokens
     */
    public function __construct(FirebasePassportBridge $firebaseBridge)
    {
        $this->firebaseBridge = $firebaseBridge;
    }

    /**
     * Register a new user in the system
     * 
     * Creates a new user account with validated data and generates an access token.
     * The user is immediately authenticated after registration.
     * 
     * OpenAPI Documentation:
     * - Endpoint: POST /api/auth/register
     * - Required fields: name, email, password, password_confirmation
     * - Returns: User data and access token
     * 
     * @param Request $request HTTP request containing user registration data
     * @return \Illuminate\Http\JsonResponse JSON response with user data and token
     * 
     * @OA\Post(
     *     path="/api/auth/register",
     *     summary="Register a new user",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="User registered successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="User registered successfully"),
     *             @OA\Property(property="user", ref="#/components/schemas/User"),
     *             @OA\Property(property="access_token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function register(Request $request)
    {
        // Validate the incoming registration data
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Create the new user with hashed password
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Generate a personal access token for the new user
        // This allows immediate API access after registration
        $token = $this->firebaseBridge->createPersonalAccessToken($user, 'API Token');

        // Return success response with user data and access token
        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'access_token' => $token->id,
        ], 201);
    }

    /**
     * Authenticate a user and provide access token
     * 
     * Verifies user credentials and generates an access token for API authentication.
     * Uses Laravel's built-in authentication system for credential verification.
     * 
     * OpenAPI Documentation:
     * - Endpoint: POST /api/auth/login
     * - Required fields: email, password
     * - Returns: User data and access token
     * 
     * @param Request $request HTTP request containing login credentials
     * @return \Illuminate\Http\JsonResponse JSON response with user data and token
     * 
     * @OA\Post(
     *     path="/api/auth/login",
     *     summary="Login user and get access token",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Login successful"),
     *             @OA\Property(property="user", ref="#/components/schemas/User"),
     *             @OA\Property(property="access_token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid credentials"
     *     )
     * )
     */
    public function login(Request $request)
    {
        // Validate the incoming login data
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // Attempt to authenticate the user with provided credentials
        if (!Auth::attempt($request->only('email', 'password'))) {
            // If authentication fails, throw validation exception
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Get the authenticated user
        $user = Auth::user();

        // Generate a new personal access token for the authenticated user
        $token = $this->firebaseBridge->createPersonalAccessToken($user, 'API Token');

        // Return success response with user data and access token
        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'access_token' => $token->id,
        ]);
    }

    /**
     * Logout the authenticated user and revoke their token
     * 
     * Revokes the current access token, effectively logging out the user.
     * This ensures that the token can no longer be used for API requests.
     * 
     * OpenAPI Documentation:
     * - Endpoint: POST /api/auth/logout
     * - Requires: Authentication (Bearer token)
     * - Returns: Success message
     * 
     * @param Request $request HTTP request (must include valid access token)
     * @return \Illuminate\Http\JsonResponse JSON response confirming logout
     * 
     * @OA\Post(
     *     path="/api/auth/logout",
     *     summary="Logout user and revoke access token",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Successfully logged out")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function logout(Request $request)
    {
        // Revoke the current access token
        // This ensures the token can no longer be used for authentication
        $request->user()->token()->revoke();

        // Return success response
        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    /**
     * Refresh the current access token
     * 
     * Generates a new access token while maintaining the user's authentication state.
     * This is useful for extending API sessions without requiring re-authentication.
     * 
     * OpenAPI Documentation:
     * - Endpoint: POST /api/auth/refresh
     * - Requires: Authentication (Bearer token)
     * - Returns: New access token
     * 
     * @param Request $request HTTP request (must include valid access token)
     * @return \Illuminate\Http\JsonResponse JSON response with new access token
     * 
     * @OA\Post(
     *     path="/api/auth/refresh",
     *     summary="Refresh access token",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Token refreshed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Token refreshed successfully"),
     *             @OA\Property(property="access_token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function refresh(Request $request)
    {
        // Get the current authenticated user
        $user = $request->user();

        // Revoke the current token
        $request->user()->token()->revoke();

        // Generate a new personal access token
        $token = $this->firebaseBridge->createPersonalAccessToken($user, 'API Token');

        // Return the new access token
        return response()->json([
            'message' => 'Token refreshed successfully',
            'access_token' => $token->id,
        ]);
    }
}
