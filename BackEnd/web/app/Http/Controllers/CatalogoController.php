<?php

namespace App\Http\Controllers;

use App\Models\CatEntorno;
use Illuminate\Http\Request;

class CatalogoController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function entorno()
    {
        $catalogos = CatEntorno::all();
        return response()->json([
            'success' => true,
            'data' => $catalogos
        ]);
    }
}
