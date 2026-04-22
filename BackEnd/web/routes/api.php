<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SiniestroController;
use App\Http\Controllers\EvidenciaController;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Rat\IncidenteController;
use App\Http\Controllers\Rat\VehiculoController;
use App\Http\Controllers\Rat\IncidenteVehiculoController;
use App\Http\Controllers\Rat\ReporteController;
use App\Http\Controllers\Rat\RatCatalogoController;

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

    // ── Evidencia Fotográfica CRUD ────────────────────────────────────────
    Route::get('/siniestros/{siniestro_id}/evidencias', [EvidenciaController::class, 'listaBySiniestro']);
    Route::post('/evidencias', [EvidenciaController::class, 'store']);
    Route::get('/evidencias/{id}', [EvidenciaController::class, 'show']);
    Route::put('/evidencias/{id}', [EvidenciaController::class, 'update']);
    Route::delete('/evidencias/{id}', [EvidenciaController::class, 'destroy']);

    // ── Catálogos entorno CRUD ────────────────────────────────────────────
    Route::get('/catalogos/entorno', [CatalogoController::class, 'entorno']);
    Route::post('/catalogos/entorno', [CatalogoController::class, 'store']);
    Route::get('/catalogos/entorno/{id}', [CatalogoController::class, 'show']);
    Route::put('/catalogos/entorno/{id}', [CatalogoController::class, 'update']);
    Route::delete('/catalogos/entorno/{id}', [CatalogoController::class, 'destroy']);

    // ── Catálogos RAT ─────────────────────────────────────────────────────
    Route::get('/catalogos', [RatCatalogoController::class, 'todos']);
    Route::get('/catalogos/tipo-hecho', [RatCatalogoController::class, 'tipoHecho']);
    Route::get('/catalogos/tipo-via', [RatCatalogoController::class, 'tipoVia']);
    Route::get('/catalogos/tipo-pavimento', [RatCatalogoController::class, 'tipoPavimento']);
    Route::get('/catalogos/clima', [RatCatalogoController::class, 'clima']);
    Route::get('/catalogos/colores', [RatCatalogoController::class, 'colores']);
    Route::get('/catalogos/tipos-golpe', [RatCatalogoController::class, 'tiposGolpe']);
    Route::get('/catalogos/estado-neumatico', [RatCatalogoController::class, 'estadoNeumatico']);
    Route::get('/catalogos/zona-vehiculo', [RatCatalogoController::class, 'zonaVehiculo']);
    Route::get('/catalogos/parte-vehiculo', [RatCatalogoController::class, 'parteVehiculo']);

    // ── Incidentes ────────────────────────────────────────────────────────
    Route::get('/incidentes', [IncidenteController::class, 'index']);
    Route::post('/incidentes', [IncidenteController::class, 'store']);
    Route::get('/incidentes/{uuid}', [IncidenteController::class, 'show']);
    Route::put('/incidentes/{uuid}', [IncidenteController::class, 'update']);
    Route::delete('/incidentes/{uuid}', [IncidenteController::class, 'destroy']);
    Route::patch('/incidentes/{uuid}/estado', [IncidenteController::class, 'cambiarEstado']);

    // ── Vehículos del incidente ───────────────────────────────────────────
    Route::get('/incidentes/{uuid}/vehiculos', [IncidenteVehiculoController::class, 'index']);
    Route::post('/incidentes/{uuid}/vehiculos', [IncidenteVehiculoController::class, 'store']);

    // ── Reportes del incidente ────────────────────────────────────────────
    Route::get('/incidentes/{uuid}/reportes', [ReporteController::class, 'index']);
    Route::post('/incidentes/{uuid}/reportes', [ReporteController::class, 'store']);

    // ── Vehículos ─────────────────────────────────────────────────────────
    Route::get('/vehiculos', [VehiculoController::class, 'index']);
    Route::post('/vehiculos', [VehiculoController::class, 'store']);
    Route::get('/vehiculos/{uuid}', [VehiculoController::class, 'show']);
    Route::put('/vehiculos/{uuid}', [VehiculoController::class, 'update']);
    Route::delete('/vehiculos/{uuid}', [VehiculoController::class, 'destroy']);

    // ── IncidenteVehiculo ─────────────────────────────────────────────────
    Route::get('/incidente-vehiculos/{uuid}', [IncidenteVehiculoController::class, 'show']);
    Route::put('/incidente-vehiculos/{uuid}', [IncidenteVehiculoController::class, 'update']);
    Route::delete('/incidente-vehiculos/{uuid}', [IncidenteVehiculoController::class, 'destroy']);

    // ── Reportes ──────────────────────────────────────────────────────────
    Route::get('/reportes/{uuid}', [ReporteController::class, 'show']);
    Route::put('/reportes/{uuid}', [ReporteController::class, 'update']);
    Route::delete('/reportes/{uuid}', [ReporteController::class, 'destroy']);
    Route::patch('/reportes/{uuid}/emitir', [ReporteController::class, 'emitir']);
});
