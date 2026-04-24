<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     * Used by Laravel's auth scaffolding after login.
     */
    public const HOME = '/dashboard';

    public function boot(): void
    {
        $this->configureRateLimiting();

        $this->routes(function () {

            // ── API base ──────────────────────────────────────────────────────
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            // ── Módulo RAT ────────────────────────────────────────────────────
            // Wizard + Incidentes + Peritos + Catálogos
            // El auth:sanctum ya está declarado dentro del propio routes_api.php
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('app/Http/Controllers/RAT/routes_api.php'));

            // ── Web ───────────────────────────────────────────────────────────
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}