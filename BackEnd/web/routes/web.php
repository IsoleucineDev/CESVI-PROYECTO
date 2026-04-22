<?php

/** @var \Laravel\Lumen\Routing\Router $router */

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

$router->group(['prefix' => 'v1/rat'], function () use ($router) {
    $router->get('/dashboard', 'DashboardController@index');
    
    $router->get('/siniestros', 'Rat\SiniestroController@index');
    $router->post('/siniestros', 'Rat\SiniestroController@store');
    $router->get('/siniestros/{id}', 'Rat\SiniestroController@show');
    $router->put('/siniestros/{id}', 'Rat\SiniestroController@update');
    $router->delete('/siniestros/{id}', 'Rat\SiniestroController@destroy');
    $router->patch('/siniestros/{id}/estado', 'Rat\SiniestroController@cambiarEstado');
    
    $router->get('/siniestros/{siniestro_id}/evidencias', 'Rat\EvidenciaController@listaBySiniestro');
    $router->post('/evidencias', 'Rat\EvidenciaController@store');
    $router->get('/evidencias/{id}', 'Rat\EvidenciaController@show');
    $router->put('/evidencias/{id}', 'Rat\EvidenciaController@update');
    $router->delete('/evidencias/{id}', 'Rat\EvidenciaController@destroy');
    
    $router->get('/catalogos/entorno', 'Rat\CatalogoController@entorno');
    $router->post('/catalogos/entorno', 'Rat\CatalogoController@store');
    $router->get('/catalogos/entorno/{id}', 'Rat\CatalogoController@show');
    $router->put('/catalogos/entorno/{id}', 'Rat\CatalogoController@update');
    $router->delete('/catalogos/entorno/{id}', 'Rat\CatalogoController@destroy');
});

// Ruta para obtener el token (Login)
$router->post('/login', 'LoginController@login');

// Ruta para probar que el middleware funciona
$router->group(['middleware' => 'jwt'], function () use ($router) {
    $router->get('/me', 'LoginController@me');
});

$router->get('/test', function () {
    return "¡La API está viva!";
});

$router->get('/hola', function () {
    return "Lumen está funcionando";
});

?>
