<?php

/** @var \Laravel\Lumen\Routing\Router $router */

$router->get('/web', function () use ($router) {
    return response()->json(["response" => "TempletDynamiCESVI"], 200);
});

// ───────────────────────────────────────────────────────────────────────
// RUTA PÚBLICA - Login
// ───────────────────────────────────────────────────────────────────────
$router->post('/login', 'LoginController@login');

// ───────────────────────────────────────────────────────────────────────
// RUTAS RAT - Soporte para Dashboard, Catálogos y Wizard
// ───────────────────────────────────────────────────────────────────────
$router->group(['prefix' => 'v1/rat', 'namespace' => 'RAT'], function () use ($router) {
    
    // Dashboard
    $router->get('/dashboard', 'DashboardController@index');
    
    // Catálogos (Se añadieron las rutas para que el Front las encuentre)
    $router->get('/catalogos', 'CatalogoController@index');
    $router->get('/catalogos/peritos', 'CatalogoController@peritos');

    // Incidentes (Wizard y CRUD)
    $router->get('/incidentes', 'IncidenteController@index');
    // PASO 1: Esta es la que te daba 404 al intentar crear un nuevo expediente
    $router->post('/incidentes', 'ExpedienteWizardController@storePaso1'); 
    
    $router->get('/incidentes/{uuid}', 'IncidenteController@show');
    // Actualización de Pasos (Wizard)
    $router->put('/incidentes/{uuid}', 'ExpedienteWizardController@updatePaso1'); 
    
    $router->delete('/incidentes/{uuid}', 'IncidenteController@destroy');
    $router->patch('/incidentes/{uuid}/estado', 'IncidenteController@cambiarEstado');
    
    // Siniestros (legado)
    $router->get('/siniestros', 'SiniestroController@index');
    $router->post('/siniestros', 'SiniestroController@store');
    $router->get('/siniestros/{id}', 'SiniestroController@show');
    $router->put('/siniestros/{id}', 'SiniestroController@update');
    $router->delete('/siniestros/{id}', 'SiniestroController@destroy');
    $router->patch('/siniestros/{id}/estado', 'SiniestroController@cambiarEstado');
    
    // Evidencias
    $router->get('/siniestros/{siniestro_id}/evidencias', 'EvidenciaController@listaBySiniestro');
    $router->post('/evidencias', 'EvidenciaController@store');
    $router->get('/evidencias/{id}', 'EvidenciaController@show');
    $router->put('/evidencias/{id}', 'EvidenciaController@update');
    $router->delete('/evidencias/{id}', 'EvidenciaController@destroy');
    
    // Catálogos entorno
    $router->get('/catalogos/entorno', 'CatalogoController@entorno');
    $router->post('/catalogos/entorno', 'CatalogoController@store');
    $router->get('/catalogos/entorno/{id}', 'CatalogoController@show');
    $router->put('/catalogos/entorno/{id}', 'CatalogoController@update');
    $router->delete('/catalogos/entorno/{id}', 'CatalogoController@destroy');

    //Docx
    $router->get('/incidentes/{uuid}/reporte-docx', 'ReportePeritoController@generarDocx');
});

// ───────────────────────────────────────────────────────────────────────
// RUTAS PROTEGIDAS CON JWT
// ───────────────────────────────────────────────────────────────────────
$router->group(['middleware' => 'jwt'], function () use ($router) {
    $router->get('/me', 'LoginController@me');
});

// ───────────────────────────────────────────────────────────────────────
// OTRAS RUTAS (Ajustadas con Namespace RAT donde corresponde)
// ───────────────────────────────────────────────────────────────────────
$router->group(['prefix' => 'Encritacion', 'middleware' => ['jwt']], function () use ($router) {
    $router->get('{id}', 'Encript@index');
    $router->post('parametros', 'Encript@parametros');
});

$router->group(['prefix' => 'VisorConsultas', 'middleware' => ['jwt'], 'namespace' => 'RAT'], function () use ($router) {
    $router->get('ConsultaMonitorTotUser', 'MonitorController@show');
    $router->get('showDataFormFiltros', 'MonitorController@showDataFormFiltros');
    $router->put('apiConsultaDataVisor', 'MonitorController@showConsultaDataVisor');
    $router->put('apiOnVerDetalle', 'MonitorController@showapiOnVerDetalle');
});

$router->group(['prefix' => 'CatalogosGrales', 'middleware' => ['jwt']], function () use ($router) {
    $router->get('getDataCatalogoGral/{tipoCatalogo}', 'CatalogosGrales\CatalogosGrales@getDataCatalogoGral');
    $router->put('putCRUDCatalogo/{tipoCatalogo}/{accion}', 'CatalogosGrales\CatalogosGrales@putCRUDCatalogo');
});

$router->group(['prefix' => 'ReportePerito', 'middleware' => ['jwt'], 'namespace' => 'RAT'], function () use ($router) {
    $router->get('{id}', 'ReportePeritoController@show');
});

$router->get('/test', function () {
    return "¡La API está viva!";
});

$router->get('/hola', function () {
    return "Lumen está funcionando";
});