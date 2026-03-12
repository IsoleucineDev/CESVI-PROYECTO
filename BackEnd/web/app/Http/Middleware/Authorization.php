<?php

namespace App\Http\Middleware;

use Closure;
use App\MetaFritterVerso\TokenJWT;

class Authorization
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $jwt = TokenJWT::verify();
        if($jwt['status'] == 401){
            $response = [
                "status" => 401,               
                "message" =>$jwt['msg'],
                "type" => "denegate"
            ];
            return response()->json($response, 401);
            // return response()->json(["message"=>$jwt['msg']], 401);
        }
        return $next($request);
    }
}
