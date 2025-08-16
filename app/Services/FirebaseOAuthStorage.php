<?php

namespace App\Services;

use Kreait\Firebase\Contract\Database;
use Illuminate\Support\Str;

class FirebaseOAuthStorage
{
    protected $database;
    protected $clientsPath = 'oauth/clients';
    protected $personalAccessClientsPath = 'oauth/personal_access_clients';
    protected $accessTokensPath = 'oauth/access_tokens';
    protected $refreshTokensPath = 'oauth/refresh_tokens';
    protected $authCodesPath = 'oauth/auth_codes';

    public function __construct(Database $database)
    {
        $this->database = $database;
    }

    /**
     * Get a client by ID
     */
    public function getClient($id)
    {
        $client = $this->database->getReference($this->clientsPath . '/' . $id)->getValue();
        return $client ? (object) array_merge(['id' => $id], $client) : null;
    }

    /**
     * Get the personal access client
     */
    public function getPersonalAccessClient()
    {
        $clients = $this->database->getReference($this->clientsPath)->getValue();
        if (!$clients) return null;

        foreach ($clients as $id => $client) {
            if (isset($client['personal_access_client']) && $client['personal_access_client']) {
                return (object) array_merge(['id' => $id], $client);
            }
        }
        return null;
    }

    /**
     * Create a new access token
     */
    public function createAccessToken($userId, $clientId, $scopes = [], $revoked = false)
    {
        $tokenId = Str::random(40);
        $tokenData = [
            'id' => $tokenId,
            'user_id' => $userId,
            'client_id' => $clientId,
            'scopes' => $scopes,
            'revoked' => $revoked,
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString(),
        ];

        $this->database->getReference($this->accessTokensPath . '/' . $tokenId)->set($tokenData);
        return (object) $tokenData;
    }

    /**
     * Revoke an access token
     */
    public function revokeAccessToken($tokenId)
    {
        $this->database->getReference($this->accessTokensPath . '/' . $tokenId . '/revoked')->set(true);
        $this->database->getReference($this->accessTokensPath . '/' . $tokenId . '/updated_at')->set(now()->toISOString());
        return true;
    }

    /**
     * Get an access token by ID
     */
    public function getAccessToken($tokenId)
    {
        $token = $this->database->getReference($this->accessTokensPath . '/' . $tokenId)->getValue();
        return $token ? (object) array_merge(['id' => $tokenId], $token) : null;
    }

    /**
     * Get all access tokens for a user
     */
    public function getUserAccessTokens($userId)
    {
        $tokens = $this->database->getReference($this->accessTokensPath)->orderByChild('user_id')->equalTo($userId)->getValue();
        if (!$tokens) return [];

        $result = [];
        foreach ($tokens as $id => $token) {
            $result[] = (object) array_merge(['id' => $id], $token);
        }
        return $result;
    }

    /**
     * Create a new refresh token
     */
    public function createRefreshToken($tokenId, $expiresAt)
    {
        $refreshTokenId = Str::random(40);
        $refreshTokenData = [
            'id' => $refreshTokenId,
            'access_token_id' => $tokenId,
            'revoked' => false,
            'expires_at' => $expiresAt->toISOString(),
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString(),
        ];

        $this->database->getReference($this->refreshTokensPath . '/' . $refreshTokenId)->set($refreshTokenData);
        return (object) $refreshTokenData;
    }

    /**
     * Revoke a refresh token
     */
    public function revokeRefreshToken($refreshTokenId)
    {
        $this->database->getReference($this->refreshTokensPath . '/' . $refreshTokenId . '/revoked')->set(true);
        $this->database->getReference($this->refreshTokensPath . '/' . $refreshTokenId . '/updated_at')->set(now()->toISOString());
        return true;
    }

    /**
     * Get a refresh token by ID
     */
    public function getRefreshToken($refreshTokenId)
    {
        $token = $this->database->getReference($this->refreshTokensPath . '/' . $refreshTokenId)->getValue();
        return $token ? (object) array_merge(['id' => $refreshTokenId], $token) : null;
    }

    /**
     * Create a new auth code
     */
    public function createAuthCode($codeId, $userId, $clientId, $scopes = [], $expiresAt)
    {
        $authCodeData = [
            'id' => $codeId,
            'user_id' => $userId,
            'client_id' => $clientId,
            'scopes' => $scopes,
            'revoked' => false,
            'expires_at' => $expiresAt->toISOString(),
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString(),
        ];

        $this->database->getReference($this->authCodesPath . '/' . $codeId)->set($authCodeData);
        return (object) $authCodeData;
    }

    /**
     * Revoke an auth code
     */
    public function revokeAuthCode($codeId)
    {
        $this->database->getReference($this->authCodesPath . '/' . $codeId . '/revoked')->set(true);
        $this->database->getReference($this->authCodesPath . '/' . $codeId . '/updated_at')->set(now()->toISOString());
        return true;
    }

    /**
     * Get an auth code by ID
     */
    public function getAuthCode($codeId)
    {
        $code = $this->database->getReference($this->authCodesPath . '/' . $codeId)->getValue();
        return $code ? (object) array_merge(['id' => $codeId], $code) : null;
    }

    /**
     * Initialize default OAuth clients if they don't exist
     */
    public function initializeDefaultClients()
    {
        $clients = $this->database->getReference($this->clientsPath)->getValue();
        
        if (!$clients) {
            // Create personal access client
            $personalClientId = '1';
            $personalClientSecret = Str::random(40);
            
            $this->database->getReference($this->clientsPath . '/' . $personalClientId)->set([
                'user_id' => null,
                'name' => 'Personal Access Client',
                'secret' => $personalClientSecret,
                'provider' => null,
                'redirect' => 'http://localhost',
                'personal_access_client' => true,
                'password_client' => false,
                'revoked' => false,
                'created_at' => now()->toISOString(),
                'updated_at' => now()->toISOString(),
            ]);

            // Create personal access client record
            $this->database->getReference($this->personalAccessClientsPath . '/1')->set([
                'client_id' => $personalClientId,
                'created_at' => now()->toISOString(),
                'updated_at' => now()->toISOString(),
            ]);

            // Create password grant client
            $passwordClientId = '2';
            $passwordClientSecret = Str::random(40);
            
            $this->database->getReference($this->clientsPath . '/' . $passwordClientId)->set([
                'user_id' => null,
                'name' => 'Password Grant Client',
                'secret' => $passwordClientSecret,
                'provider' => null,
                'redirect' => 'http://localhost',
                'personal_access_client' => false,
                'password_client' => true,
                'revoked' => false,
                'created_at' => now()->toISOString(),
                'updated_at' => now()->toISOString(),
            ]);

            return [
                'personal_access_client' => [
                    'id' => $personalClientId,
                    'secret' => $personalClientSecret,
                ],
                'password_client' => [
                    'id' => $passwordClientId,
                    'secret' => $passwordClientSecret,
                ],
            ];
        }

        return null;
    }
}
