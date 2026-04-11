<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SiniestroController;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\EvidenciaController;
use App\Http\Controllers\DashboardController;

Route::prefix('v1/rat')->middleware('auth:api')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Siniestros (GET)
    Route::get('/siniestros', [SiniestroController::class, 'index']);
    Route::get('/siniestros/{id}', [SiniestroController::class, 'show']);

    // Catálogos
    Route::get('/catalogos/entorno', [CatalogoController::class, 'entorno']);

    // Evidencia
    Route::get('/siniestros/{id}/evidencias/fotos', 
        [EvidenciaController::class, 'listaBySiniestro']);
});
