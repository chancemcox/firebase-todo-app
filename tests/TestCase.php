<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use App\Services\FirebaseOAuthStorage;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Initialize Firebase OAuth storage for tests
        if (app()->bound(FirebaseOAuthStorage::class)) {
            $firebaseStorage = app(FirebaseOAuthStorage::class);
            $firebaseStorage->initializeDefaultClients();
        }
    }
}
