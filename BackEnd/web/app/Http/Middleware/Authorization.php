<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Authorization
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Token no proporcionado'
            ], 401);
        }

        try {
            $secret = env('JWT_SECRET', 'your-secret-key');
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            
            // Guardar el usuario decodificado en la request
            $request->attributes->add(['auth_user' => $decoded]);
            
            return $next($request);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Token inválido: ' . $e->getMessage()
            ], 401);
        }
    }
}
