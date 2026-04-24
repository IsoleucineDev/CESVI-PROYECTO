<?php

namespace App\Http\Controllers\Rat;

use App\Http\Controllers\Controller;
use App\Models\Rat\Incidente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncidenteController extends Controller
{
    public function index(): JsonResponse
    {
        $incidentes = Incidente::paginate(15);
        return response()->json($incidentes);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'numero_siniestro' => 'required|string|unique:RAT_INCIDENTE',
            'fecha_hecho' => 'required|date',
            'tipo_hecho_id' => 'required|exists:RAT_CAT_TIPO_HECHO,id',
            'id_usuario_perito' => 'required|exists:sys_users,id_user',
        ]);

        $incidente = Incidente::create($data);
        return response()->json($incidente, 201);
    }

    public function show(string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        return response()->json($incidente);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $incidente->update($request->all());
        return response()->json($incidente);
    }

    public function destroy(string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $incidente->delete();
        return response()->json(['message' => 'Incidente eliminado']);
    }

    public function cambiarEstado(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $incidente->update(['estado' => $request->estado]);
        return response()->json($incidente);
    }
}
