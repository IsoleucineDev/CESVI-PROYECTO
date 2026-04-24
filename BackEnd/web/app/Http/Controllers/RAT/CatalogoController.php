<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogoController extends Controller
{
    // GET /v1/rat/catalogos/entorno
    public function entorno()
    {
        // Usamos DB directamente para evitar el error de modelo inexistente
        $catalogos = DB::table('RAT_CAT_ENTORNO')->get(); 
        return response()->json($catalogos);
    }

    // GET /v1/rat/catalogos
    public function index(): JsonResponse
    {
        $tablas = [
            'tipos_hecho'               => 'RAT_CAT_TIPO_HECHO',
            'tipos_via'                 => 'RAT_CAT_TIPO_VIA',
            'tipos_trazo'               => 'RAT_CAT_TIPO_TRAZO',
            'condiciones_superficie'    => 'RAT_CAT_CONDICION_SUPERFICIE',
            'condiciones_pavimento'     => 'RAT_CAT_CONDICION_PAVIMENTO',
            'tipos_pavimento'           => 'RAT_CAT_TIPO_PAVIMENTO',
            'climas'                    => 'RAT_CAT_CLIMA',
            'colores'                   => 'RAT_CAT_COLOR',
            'tipos_foto'                => 'RAT_CAT_TIPO_FOTO',
            'tipos_golpe'               => 'RAT_CAT_TIPO_GOLPE',
            'numeros_mediciones'        => 'RAT_CAT_NUMERO_MEDICIONES',
        ];

        $resultado = [];
        foreach ($tablas as $clave => $tabla) {
            $resultado[$clave] = DB::table($tabla)->orderBy('id')->get();
        }

        return response()->json($resultado);
    }

    public function peritos(): JsonResponse
    {
        $peritos = DB::table('sys_users')
            ->select('id_user', 'name')
            ->get();

        return response()->json($peritos);
    }
}