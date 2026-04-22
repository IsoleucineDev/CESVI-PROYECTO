<?php

/** @var \Laravel\Lumen\Routing\Router $router */

// ── Rutas legacy (no tocar) ───────────────────────────────────────────────────
$router->get('/web', function () use ($router) {
    return response()->json(["response" => "TempletDynamiCESVI"], 200);
});

$router->group(['prefix' => 'Encritacion', 'middleware' => ['jwt']], function () use ($router) {
    $router->get('{id}', 'Encript@index');
    $router->post('parametros', 'Encript@parametros');
});

$router->group(['prefix' => 'VisorConsultas', 'middleware' => ['jwt']], function () use ($router) {
    $router->get('ConsultaMonitorTotUser', 'MonitorController@show');
    $router->get('showDataFormFiltros', 'MonitorController@showDataFormFiltros');
    $router->put('apiConsultaDataVisor', 'MonitorController@showConsultaDataVisor');
    $router->put('apiOnVerDetalle', 'MonitorController@showapiOnVerDetalle');
});

$router->group(['prefix' => 'CatalogosGrales', 'middleware' => ['jwt']], function () use ($router) {
    $router->get('getDataCatalogoGral/{tipoCatalogo}', 'CatalogosGrales\CatalogosGrales@getDataCatalogoGral');
    $router->put('putCRUDCatalogo/{tipoCatalogo}/{accion}', 'CatalogosGrales\CatalogosGrales@putCRUDCatalogo');
});

$router->group(['prefix' => 'ReportePerito', 'middleware' => ['jwt']], function () use ($router) {
    $router->get('{id}', 'ReportePeritoController@show');
});

// ── RAT v1 — todo protegido con JWT ──────────────────────────────────────────
$router->group(['prefix' => 'v1/rat', 'middleware' => 'jwt'], function () use ($router) {

    // ── Dashboard ─────────────────────────────────────────────────────────────
    // Rat\DashboardController → RAT_INCIDENTE directamente con DB::table()
    $router->get('/dashboard', 'Rat\DashboardController@index');

    // ── Expedientes (lista / detalle / estado / borrar) ───────────────────────
    // Rat\IncidenteController → RAT_INCIDENTE con JOINs reales
    // IMPORTANTE: usa uuid (CHAR 36), NO id entero
    $router->get('/siniestros',                'Rat\IncidenteController@index');
    $router->get('/siniestros/{uuid}',         'Rat\IncidenteController@show');
    $router->patch('/siniestros/{uuid}/estado','Rat\IncidenteController@cambiarEstado');
    $router->delete('/siniestros/{uuid}',      'Rat\IncidenteController@destroy');

    // ── Wizard "Nuevo / Editar Expediente" ────────────────────────────────────
    // Rat\ExpedienteWizardController — cada paso guarda su tabla RAT_*
    $router->post('/wizard/paso1-incidente',                    'Rat\ExpedienteWizardController@storePaso1');
    $router->put('/wizard/{uuid}/paso1-incidente',              'Rat\ExpedienteWizardController@updatePaso1');
    $router->put('/wizard/{uuid}/paso2-vehiculo',               'Rat\ExpedienteWizardController@updatePaso2');
    $router->put('/wizard/{uuid}/paso3-ocupantes',              'Rat\ExpedienteWizardController@updatePaso3');
    $router->put('/wizard/{uuid}/paso4-via',                    'Rat\ExpedienteWizardController@updatePaso4');
    $router->post('/wizard/{uuid}/paso5-evidencia',             'Rat\ExpedienteWizardController@storePaso5');
    $router->delete('/wizard/{uuid}/paso5-evidencia/{foto_id}', 'Rat\ExpedienteWizardController@destroyFoto');
    $router->put('/wizard/{uuid}/paso6-deformacion',            'Rat\ExpedienteWizardController@updatePaso6');
    $router->post('/wizard/{uuid}/paso7-calculo',               'Rat\ExpedienteWizardController@storePaso7');
    $router->put('/wizard/{uuid}/paso8-narrativa',              'Rat\ExpedienteWizardController@updatePaso8');
    $router->put('/wizard/{uuid}/paso9-reporte',                'Rat\ExpedienteWizardController@updatePaso9');

    // ── Catálogos RAT ─────────────────────────────────────────────────────────
    // Rat\CatalogoController → devuelve todos los catálogos en un solo GET
    $router->get('/catalogos',           'Rat\CatalogoController@index');
    $router->get('/catalogos/peritos',   'Rat\CatalogoController@peritos');
    $router->get('/catalogos/rigidez',   'Rat\CatalogoController@rigidez');
    $router->get('/catalogos/mu',        'Rat\CatalogoController@mu');

    // ── Perfil del perito ─────────────────────────────────────────────────────
    // Rat\PerfilController → RAT_PERITO_PERFIL + sys_users
    $router->get('/perfil',                  'Rat\PerfilController@show');
    $router->put('/perfil',                  'Rat\PerfilController@update');
    $router->get('/perfil/expedientes',      'Rat\PerfilController@misExpedientes');
    $router->put('/perfil/password',         'Rat\PerfilController@cambiarPassword');
});

// ── Auth (pública) ────────────────────────────────────────────────────────────
$router->post('/login', 'LoginController@login');

$router->group(['middleware' => 'jwt'], function () use ($router) {
    $router->get('/me', 'LoginController@me');
});

// ── Health checks ─────────────────────────────────────────────────────────────
$router->get('/test', function () {
    return response()->json(['status' => 'ok', 'message' => 'API activa']);
});

$router->get('/db-test', function () {
    try {
        \DB::connection()->getPdo();
        return response()->json(['status' => 'ok', 'db' => 'conectada']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

$router->options('/{any:.*}', function () {
    return response('OK', 200);
});