<?php

namespace App\Http\Controllers\Rat;

use App\Http\Controllers\Controller;
use App\Models\Rat\PeritoPerfilModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PerfilController extends Controller
{
    /**
     * GET /api/rat/perfil
     * Datos personales + estadísticas del perito autenticado.
     */
    public function show(Request $request): JsonResponse
    {
        $userId = $request->user()->id_user;

        $perfil = DB::table('RAT_PERITO_PERFIL AS p')
            ->join('sys_users AS u', 'u.id_user', '=', 'p.id_user')
            ->where('p.id_user', $userId)
            ->select(
                'u.id_user', 'u.name', 'u.email',
                'p.telefono', 'p.cedula_profesional', 'p.especialidad',
                'p.numero_empleado', 'p.calificacion', 'p.fecha_alta'
            )
            ->first();

        // Estadísticas para el header del perfil
        $stats = DB::table('RAT_INCIDENTE')
            ->where('id_usuario_perito', $userId)
            ->selectRaw("
                COUNT(*) AS total_expedientes,
                SUM(CASE WHEN estado = 2 THEN 1 ELSE 0 END) AS finalizados
            ")
            ->first();

        return response()->json([
            'perfil' => $perfil,
            'stats'  => [
                'expedientes' => (int) $stats->total_expedientes,
                'finalizados' => (int) $stats->finalizados,
                'calificacion'=> $perfil->calificacion ?? null,
            ],
        ]);
    }

    /**
     * PUT /api/rat/perfil
     * Actualiza los datos personales (pestaña "Datos Personales").
     */
    public function update(Request $request): JsonResponse
    {
        $userId = $request->user()->id_user;

        $data = $request->validate([
            'telefono'          => 'nullable|string|max:20',
            'cedula_profesional'=> 'nullable|string|max:30',
            'especialidad'      => 'nullable|string|max:200',
            'numero_empleado'   => 'nullable|string|max:30',
        ]);

        PeritoPerfilModel::updateOrCreate(
            ['id_user' => $userId],
            $data
        );

        return response()->json(['message' => 'Perfil actualizado.']);
    }

    /**
     * GET /api/rat/perfil/expedientes
     * Lista los expedientes del perito autenticado (pestaña "Mis Expedientes").
     */
    public function misExpedientes(Request $request): JsonResponse
    {
        $userId = $request->user()->id_user;

        $expedientes = DB::table('RAT_INCIDENTE AS i')
            ->join('RAT_CAT_TIPO_HECHO AS th', 'i.tipo_hecho_id', '=', 'th.id')
            ->where('i.id_usuario_perito', $userId)
            ->select(
                'i.uuid',
                'i.numero_siniestro',
                'i.fecha_hecho',
                'i.estado',
                'th.nombre AS tipo_hecho'
            )
            ->orderByDesc('i.fecha_hecho')
            ->limit(10)
            ->get();

        return response()->json($expedientes);
    }

    /**
     * PUT /api/rat/perfil/password
     * Cambia la contraseña (pestaña "Configuración").
     */
    public function cambiarPassword(Request $request): JsonResponse
    {
        $request->validate([
            'password_actual'   => 'required|string',
            'password_nuevo'    => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password_actual, $user->password)) {
            return response()->json(['message' => 'La contraseña actual es incorrecta.'], 422);
        }

        $user->update(['password' => Hash::make($request->password_nuevo)]);

        return response()->json(['message' => 'Contraseña actualizada.']);
    }
}
