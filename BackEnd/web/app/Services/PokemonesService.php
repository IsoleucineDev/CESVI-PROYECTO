<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class PokemonesService
{

    public static function getPokemones()
    {
        $data = Http::pokemones()->get('/pokemon');
        $pokemones = $data['results'];
        $response =  array_filter($pokemones, function ($pokemon) {
            foreach ($pokemon as $key => $value) {
                return $key == "name";
            }
        }, ARRAY_FILTER_USE_BOTH);
        return $response;
    }
}
