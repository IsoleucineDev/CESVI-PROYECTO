<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SiniestroController;
use App\Http\Controllers\EvidenciaController;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\DashboardController;

Route::prefix('v1/rat')->middleware('auth:api')->group(function () {

    // ── Dashboard ─────────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ── Siniestros CRUD ───────────────────────────────────────────────────
    Route::get('/siniestros', [SiniestroController::class, 'index']);
    Route::post('/siniestros', [SiniestroController::class, 'store']);
    Route::get('/siniestros/{id}', [SiniestroController::class, 'show']);
    Route::put('/siniestros/{id}', [SiniestroController::class, 'update']);
    Route::delete('/siniestros/{id}', [SiniestroController::class, 'destroy']);
    Route::patch('/siniestros/{id}/estado', [SiniestroController::class, 'cambiarEstado']);

    // ── Evidencia Fotográfica CRUD ───────────────────────────────────────
    Route::get('/siniestros/{siniestro_id}/evidencias', [EvidenciaController::class, 'listaBySiniestro']);
    Route::post('/evidencias', [EvidenciaController::class, 'store']);
    Route::get('/evidencias/{id}', [EvidenciaController::class, 'show']);
    Route::put('/evidencias/{id}', [EvidenciaController::class, 'update']);
    Route::delete('/evidencias/{id}', [EvidenciaController::class, 'destroy']);

    // ── Catálogos CRUD ────────────────────────────────────────────────────
    Route::get('/catalogos/entorno', [CatalogoController::class, 'entorno']);
    Route::post('/catalogos/entorno', [CatalogoController::class, 'store']);
    Route::get('/catalogos/entorno/{id}', [CatalogoController::class, 'show']);
    Route::put('/catalogos/entorno/{id}', [CatalogoController::class, 'update']);
    Route::delete('/catalogos/entorno/{id}', [CatalogoController::class, 'destroy']);

});
