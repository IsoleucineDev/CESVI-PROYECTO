<?php

/** @var \Laravel\Lumen\Routing\Router $router */

$router->get('/web', function () use ($router) {
    return response()->json(["response" => "TempletDynamiCESVI"], 200);
});





 $router->group(['prefix' => 'Encritacion', 'middleware' => 'jwt'], function () use ($router) {
     $router->get('{id}',        ['uses' => 'Encript@index']);
     $router->post('parametros',  ['uses' => 'Encript@parametros']);
    
 });


 $router->group(['prefix' => 'VisorConsultas' , 'middleware' => 'jwt'], function () use ($router) {
   $router->get('ConsultaMonitorTotUser',   ['uses' => 'MonitorController@show']);
   $router->get('showDataFormFiltros',   ['uses' => 'MonitorController@showDataFormFiltros']);
   $router->put('apiConsultaDataVisor',   ['uses' => 'MonitorController@showConsultaDataVisor']);
   $router->put('apiOnVerDetalle',   ['uses' => 'MonitorController@showapiOnVerDetalle']);
});


 $router->group(['prefix' => 'CatalogosGrales', 'middleware' => 'jwt'], function () use ($router) {
     $router->get('getDataCatalogoGral/{tipoCatalogo}',        ['uses' => 'CatalogosGrales\CatalogosGrales@getDataCatalogoGral']);
     $router->put('putCRUDCatalogo/{tipoCatalogo}/{accion}',        ['uses' => 'CatalogosGrales\CatalogosGrales@putCRUDCatalogo']);
    
 });


$router->get('/test', function () {
    return "¡La API está viva!";
});


$router->get('/hola', function () { return "Lumen está funcionando"; });

?>
