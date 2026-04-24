<?php

namespace App\Http\Controllers\Rat;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CatalogoController extends Controller
{
    /**
     * GET /v1/rat/catalogos
     * Devuelve todos los catálogos para el wizard
     */
    public function index(): JsonResponse
    {
        try {
            $catalogo = [
                'tipos_hecho' => DB::table('RAT_CAT_TIPO_HECHO')
                    ->select('id', 'nombre')
                    ->orderBy('nombre')
                    ->get(),
                    
                'tipos_via' => DB::table('RAT_CAT_TIPO_VIA')
                    ->select('id', 'nombre')
                    ->get(),
                    
                'climas' => DB::table('RAT_CAT_CLIMA')
                    ->select('id', 'nombre')
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $catalogo
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al obtener catálogos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /v1/rat/catalogos/peritos
     * Lista peritos disponibles
     */
    public function peritos(): JsonResponse
    {
        try {
            $peritos = DB::table('sys_users')
                ->select('id_user as id', 'name')
                ->where('status', 'alta')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $peritos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
