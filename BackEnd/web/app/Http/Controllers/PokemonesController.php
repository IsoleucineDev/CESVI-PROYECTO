<?php

namespace App\Http\Controllers;

use App\Services\PokemonesService;

class PokemonesController extends Controller
{

    public function index()
    {
        $data = PokemonesService::getPokemones();
        $response = [
            "status" => 200,
            "data" => $data,
        ];
        return response()->json($response, 200);
    }
}
