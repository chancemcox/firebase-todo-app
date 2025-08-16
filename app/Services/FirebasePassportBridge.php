<?php

namespace App\Services;

use Laravel\Passport\PersonalAccessTokenFactory;
use Laravel\Passport\Token;
use Laravel\Passport\Client;
use Laravel\Passport\PersonalAccessClient;
use Illuminate\Support\Str;

class FirebasePassportBridge
{
    protected $firebaseStorage;

    public function __construct(FirebaseOAuthStorage $firebaseStorage)
    {
        $this->firebaseStorage = $firebaseStorage;
    }

    /**
     * Create a personal access token for a user
     */
    public function createPersonalAccessToken($user, $name, $scopes = [])
    {
        $personalClient = $this->firebaseStorage->getPersonalAccessClient();
        
        if (!$personalClient) {
            // Initialize default clients if they don't exist
            $clients = $this->firebaseStorage->initializeDefaultClients();
            $personalClient = $this->firebaseStorage->getPersonalAccessClient();
        }

        if (!$personalClient) {
            throw new \Exception('Personal access client not found');
        }

        // Create access token
        $accessToken = $this->firebaseStorage->createAccessToken(
            $user->id,
            $personalClient->id,
            $scopes
        );

        // Create refresh token
        $refreshToken = $this->firebaseStorage->createRefreshToken(
            $accessToken->id,
            now()->addDays(30)
        );

        return new Token([
            'id' => $accessToken->id,
            'user_id' => $accessToken->user_id,
            'client_id' => $accessToken->client_id,
            'scopes' => $accessToken->scopes,
            'revoked' => $accessToken->revoked,
            'created_at' => $accessToken->created_at,
            'updated_at' => $accessToken->updated_at,
        ]);
    }

    /**
     * Revoke all tokens for a user
     */
    public function revokeUserTokens($userId)
    {
        $tokens = $this->firebaseStorage->getUserAccessTokens($userId);
        
        foreach ($tokens as $token) {
            $this->firebaseStorage->revokeAccessToken($token->id);
        }

        return true;
    }

    /**
     * Revoke a specific token
     */
    public function revokeToken($tokenId)
    {
        return $this->firebaseStorage->revokeAccessToken($tokenId);
    }

    /**
     * Get a token by ID
     */
    public function getToken($tokenId)
    {
        $token = $this->firebaseStorage->getAccessToken($tokenId);
        
        if (!$token) {
            return null;
        }

        return new Token([
            'id' => $token->id,
            'user_id' => $token->user_id,
            'client_id' => $token->client_id,
            'scopes' => $token->scopes,
            'revoked' => $token->revoked,
            'created_at' => $token->created_at,
            'updated_at' => $token->updated_at,
        ]);
    }

    /**
     * Get a client by ID
     */
    public function getClient($clientId)
    {
        $client = $this->firebaseStorage->getClient($clientId);
        
        if (!$client) {
            return null;
        }

        return new Client([
            'id' => $client->id,
            'user_id' => $client->user_id,
            'name' => $client->name,
            'secret' => $client->secret,
            'provider' => $client->provider,
            'redirect' => $client->redirect,
            'personal_access_client' => $client->personal_access_client,
            'password_client' => $client->password_client,
            'revoked' => $client->revoked,
            'created_at' => $client->created_at,
            'updated_at' => $client->updated_at,
        ]);
    }

    /**
     * Get the personal access client
     */
    public function getPersonalAccessClient()
    {
        $client = $this->firebaseStorage->getPersonalAccessClient();
        
        if (!$client) {
            return null;
        }

        return new PersonalAccessClient([
            'id' => 1,
            'client_id' => $client->id,
            'created_at' => $client->created_at,
            'updated_at' => $client->updated_at,
        ]);
    }
}
