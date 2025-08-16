<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * UserController - Handles API user profile management operations
 * 
 * This controller manages user profile operations through the API, including
 * profile viewing, updating, password changes, and account deletion.
 * All operations require valid authentication tokens.
 * 
 * Key Features:
 * - User profile retrieval
 * - Profile information updates
 * - Secure password changes
 * - Account deletion with confirmation
 * - Comprehensive OpenAPI documentation
 * 
 * @OA\Tag(
 *     name="Users",
 *     description="API Endpoints for user management"
 * )
 */
class UserController extends Controller
{
    /**
     * Get the authenticated user's profile information
     * 
     * Returns the complete profile data for the currently authenticated user.
     * This endpoint is useful for retrieving user information after login.
     * 
     * OpenAPI Documentation:
     * - Endpoint: GET /api/user
     * - Requires: Authentication (Bearer token)
     * - Returns: Complete user profile data
     * 
     * @param Request $request HTTP request (must include valid access token)
     * @return JsonResponse JSON response containing user profile data
     * 
     * @OA\Get(
     *     path="/api/user",
     *     summary="Get authenticated user profile",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="User profile",
     *         @OA\JsonContent(ref="#/components/schemas/User")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function profile(Request $request): JsonResponse
    {
        // Return the authenticated user's profile data
        // The user() method is provided by Laravel's authentication system
        return response()->json($request->user());
    }

    /**
     * Update the authenticated user's profile information
     * 
     * Allows users to modify their name and email address.
     * Email uniqueness is enforced to prevent conflicts.
     * 
     * OpenAPI Documentation:
     * - Endpoint: PUT /api/user/profile
     * - Requires: Authentication (Bearer token)
     * - Accepts: name, email (both optional)
     * - Returns: Updated user profile
     * 
     * @param Request $request HTTP request containing profile update data
     * @return JsonResponse JSON response with updated user data
     * 
     * @OA\Put(
     *     path="/api/user/profile",
     *     summary="Update user profile",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Profile updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Profile updated successfully"),
     *             @OA\Property(property="user", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function updateProfile(Request $request): JsonResponse
    {
        // Validate the incoming profile update data
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $request->user()->id,
        ]);

        // Get the authenticated user and update their profile
        $user = $request->user();
        $user->update($request->only(['name', 'email']));

        // Return success response with updated user data
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Change the authenticated user's password
     * 
     * Allows users to securely change their password by providing the current
     * password and confirming the new password. The current password is verified
     * to ensure security.
     * 
     * OpenAPI Documentation:
     * - Endpoint: POST /api/user/change-password
     * - Requires: Authentication (Bearer token)
     * - Required fields: current_password, new_password, new_password_confirmation
     * - Returns: Success message
     * 
     * @param Request $request HTTP request containing password change data
     * @return JsonResponse JSON response confirming password change
     * 
     * @OA\Post(
     *     path="/api/user/change-password",
     *     summary="Change user password",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"current_password","new_password","new_password_confirmation"},
     *             @OA\Property(property="current_password", type="string", format="password", example="oldpassword123"),
     *             @OA\Property(property="new_password", type="string", format="password", example="newpassword123"),
     *             @OA\Property(property="new_password_confirmation", type="string", format="password", example="newpassword123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Password changed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Password changed successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
    public function changePassword(Request $request): JsonResponse
    {
        // Validate the password change request
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Get the authenticated user
        $user = $request->user();

        // Verify the current password matches
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        // Update the user's password with the new hashed password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        // Return success response
        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Delete the authenticated user's account
     * 
     * Permanently removes the user's account and all associated data.
     * This action is irreversible and should be used with caution.
     * 
     * OpenAPI Documentation:
     * - Endpoint: DELETE /api/user/account
     * - Requires: Authentication (Bearer token)
     * - Returns: Success message
     * 
     * @param Request $request HTTP request (must include valid access token)
     * @return JsonResponse JSON response confirming account deletion
     * 
     * @OA\Delete(
     *     path="/api/user/account",
     *     summary="Delete user account",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Account deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Account deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated"
     *     )
     * )
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        // Get the authenticated user
        $user = $request->user();

        // Revoke all tokens for this user to ensure they can't access the API
        $user->tokens()->delete();

        // Delete the user account
        // This will cascade to related data based on database constraints
        $user->delete();

        // Return success response
        return response()->json([
            'message' => 'Account deleted successfully'
        ]);
    }
}
