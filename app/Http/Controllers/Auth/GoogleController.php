<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class GoogleController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle()
    {
        try {
            Log::info('Google OAuth redirect initiated');
            return Socialite::driver('google')->redirect();
        } catch (Exception $e) {
            Log::error('Google OAuth redirect failed: ' . $e->getMessage());
            return redirect('/login')->with('error', 'Google authentication setup error. Please contact support.');
        }
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback()
    {
        try {
            Log::info('Google OAuth callback initiated');
            
            $user = Socialite::driver('google')->user();
            Log::info('Google user data received', ['email' => $user->email, 'name' => $user->name]);
            
            $finduser = User::where('google_id', $user->id)->first();
            
            if ($finduser) {
                // User exists, log them in
                Log::info('Existing Google user found, logging in', ['user_id' => $finduser->id]);
                Auth::login($finduser);
                return redirect()->intended('/dashboard');
            } else {
                // Check if user exists with same email
                $existingUser = User::where('email', $user->email)->first();
                
                if ($existingUser) {
                    // Update existing user with Google ID
                    Log::info('Existing user found, updating with Google ID', ['user_id' => $existingUser->id]);
                    $existingUser->update([
                        'google_id' => $user->id,
                        'email_verified_at' => now(),
                    ]);
                    
                    Auth::login($existingUser);
                    return redirect()->intended('/dashboard');
                } else {
                    // Create new user
                    Log::info('Creating new user from Google OAuth', ['email' => $user->email]);
                    $newUser = User::create([
                        'name' => $user->name,
                        'email' => $user->email,
                        'google_id' => $user->id,
                        'email_verified_at' => now(),
                        'password' => Hash::make(uniqid()), // Generate random password
                    ]);
                    
                    Auth::login($newUser);
                    Log::info('New Google user created and logged in', ['user_id' => $newUser->id]);
                    return redirect()->intended('/dashboard');
                }
            }
        } catch (Exception $e) {
            Log::error('Google OAuth callback failed: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect('/login')->with('error', 'Google authentication failed: ' . $e->getMessage());
        }
    }
}
