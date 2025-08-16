<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\FirebaseOAuthStorage;
use App\Services\FirebasePassportBridge;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Firebase OAuth services
        $this->app->singleton(FirebaseOAuthStorage::class, function ($app) {
            return new FirebaseOAuthStorage($app['firebase.database']);
        });

        $this->app->singleton(FirebasePassportBridge::class, function ($app) {
            return new FirebasePassportBridge($app[FirebaseOAuthStorage::class]);
        });

        // Initialize OAuth clients in Firebase if they don't exist
        $this->app->booted(function () {
            $firebaseStorage = app(FirebaseOAuthStorage::class);
            $firebaseStorage->initializeDefaultClients();
        });
    }
}
