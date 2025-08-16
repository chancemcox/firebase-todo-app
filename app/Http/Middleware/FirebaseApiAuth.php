<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\FirebasePassportBridge;
use App\Models\User;

class FirebaseApiAuth
{
    protected $firebaseBridge;

    public function __construct(FirebasePassportBridge $firebaseBridge)
    {
        $this->firebaseBridge = $firebaseBridge;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Get token from Firebase
        $accessToken = $this->firebaseBridge->getToken($token);

        if (!$accessToken || $accessToken->revoked) {
            return response()->json(['message' => 'Invalid or revoked token'], 401);
        }

        // Get user
        $user = User::findInFirebase($accessToken->user_id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 401);
        }

        // Set authenticated user
        auth()->setUser($user);
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        return $next($request);
    }
}
