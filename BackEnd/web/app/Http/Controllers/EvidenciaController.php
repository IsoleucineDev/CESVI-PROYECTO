<?php

namespace App\Http\Controllers;

use App\Models\EvidenciaFoto;
use Illuminate\Http\Request;

class EvidenciaController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function listaBySiniestro($siniestroId)
    {
        $fotos = EvidenciaFoto::where('siniestro_id', $siniestroId)->get();
        return response()->json([
            'success' => true,
            'data' => $fotos
        ]);
    }
}
