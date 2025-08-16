<?php

namespace App\Guards;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\Authenticatable;
use Kreait\Firebase\Contract\Database;
use Illuminate\Http\Request;

class FirebaseGuard implements Guard
{
    protected $database;
    protected $request;
    protected $user;

    public function __construct(Database $database, Request $request)
    {
        $this->database = $database;
        $this->request = $request;
    }

    public function check()
    {
        return !is_null($this->user());
    }

    public function guest()
    {
        return !$this->check();
    }

    public function user()
    {
        if ($this->user !== null) {
            return $this->user;
        }

        // Check session for user ID
        $userId = $this->request->session()->get('firebase_user_id');
        
        if ($userId) {
            $this->user = $this->retrieveUserById($userId);
        }

        return $this->user;
    }

    public function id()
    {
        if ($this->user()) {
            return $this->user()->getAuthIdentifier();
        }
    }

    public function validate(array $credentials = [])
    {
        $user = $this->retrieveUserByCredentials($credentials);
        
        if ($user && $this->hasValidCredentials($user, $credentials)) {
            $this->setUser($user);
            return true;
        }

        return false;
    }

    public function setUser(Authenticatable $user)
    {
        $this->user = $user;
        $this->request->session()->put('firebase_user_id', $user->getAuthIdentifier());
        
        return $this;
    }

    public function hasUser()
    {
        return $this->user !== null;
    }

    protected function retrieveUserById($id)
    {
        $ref = $this->database->getReference('users/' . $id);
        $userData = $ref->getSnapshot()->getValue();
        
        if ($userData) {
            return new \App\Models\User($userData);
        }
        
        return null;
    }

    protected function retrieveUserByCredentials(array $credentials)
    {
        if (empty($credentials['email'])) {
            return null;
        }

        $ref = $this->database->getReference('users');
        $snapshot = $ref->getSnapshot();
        $users = $snapshot->getValue() ?? [];

        foreach ($users as $id => $userData) {
            if ($userData['email'] === $credentials['email']) {
                $user = new \App\Models\User($userData);
                $user->id = $id;
                return $user;
            }
        }

        return null;
    }

    protected function hasValidCredentials($user, array $credentials)
    {
        return password_verify($credentials['password'], $user->password);
    }
}
