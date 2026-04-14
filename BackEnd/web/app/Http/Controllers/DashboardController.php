<?php

namespace App\Http\Controllers;

use App\Models\Siniestro;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index()
    {
        $totalSiniestros = Siniestro::count();
        $abiertos = Siniestro::where('estado', 'captura_inicial')->count();
        $completados = Siniestro::where('estado', 'completado')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_siniestros' => $totalSiniestros,
                'estado_abiertos' => $abiertos,
                'estado_completados' => $completados,
                'ultimos_siniestros' => Siniestro::orderBy('created_at', 'desc')
                    ->limit(5)->get()
            ]
        ]);
    }
}
