<?php

namespace App\Http\Controllers;

use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Firebase\JWT\Key;

class LoginController extends Controller
{
    /**
     * Login y generar JWT token
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $email = $request->input('email');
        $password = $request->input('password');

        // TODO: Validar contra BD (por ahora hardcoded para testing)
        if ($email === 'admin@cesvi.com' && $password === 'password123') {
            $payload = [
                'iat' => time(),
                'exp' => time() + (24 * 60 * 60), // Token válido 24 horas
                'email' => $email,
                'id' => 1,
                'name' => 'Admin CESVI'
            ];

            $secret = env('JWT_SECRET');
            //$token = JWT::encode($payload, $secret, 'HS256');
            $secret = env('JWT_SECRET', '2d9578b39689e6736f52e42af9a6f4913db5849323dc999d6316c4a9dc305627%');
            $token = JWT::encode($payload, $secret, 'HS256');

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => 1,
                    'email' => $email,
                    'name' => 'Admin CESVI'
                ]
            ], 200);
        }

        return response()->json([
            'success' => false,
            'error' => 'Credenciales inválidas'
        ], 401);
    }

    /**
     * Obtener datos del usuario autenticado
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
        public function me(Request $request)
    {
        $user = $request->attributes->get('user');

        return response()->json([
            'success' => true,
            'user' => $user
        ], 200);
    }
}
