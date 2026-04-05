<?php

namespace App\Http\Controllers;

use App\Models\Siniestro;
use Illuminate\Http\Request;

class SiniestroController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index()
    {
        $siniestros = Siniestro::paginate(15);
        return response()->json([
            'success' => true,
            'data' => $siniestros
        ]);
    }

    public function show($id)
    {
        $siniestro = Siniestro::with('catEntorno', 'evidenciaFotos', 'iaResultados')
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $siniestro
        ]);
    }
}
