<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use App\Models\Rat\Incidente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class IncidenteController extends Controller
{
    /**
     * GET /api/rat/incidentes
     *
     * Lista paginada con filtros. Alimenta la pantalla "Expedientes RAT".
     * Filtros disponibles: buscar (texto), desde, hasta, tipo_hecho, estado, perito_id
     */
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('RAT_INCIDENTE AS i')
            ->join('RAT_CAT_TIPO_HECHO AS th', 'i.tipo_hecho_id', '=', 'th.id')
            ->leftJoin('RAT_INCIDENTE_VEHICULO AS iv', 'iv.incidente_id', '=', 'i.id')
            ->leftJoin('RAT_VEHICULO AS v', 'iv.vehiculo_id', '=', 'v.id')
            ->leftJoin('RAT_CALCULO_VELOCIDAD AS cv', 'cv.incidente_vehiculo_id', '=', 'iv.id')
            ->leftJoin('sys_users AS u', 'u.id_user', '=', 'i.id_usuario_perito')
            ->select(
                'i.uuid',
                'i.numero_siniestro',
                'i.fecha_hecho',
                'i.hora_hecho',
                'i.estado',
                'i.created_at',
                'th.nombre AS tipo_hecho',
                DB::raw("CONCAT(v.marca, ' ', COALESCE(v.submarca,''), ' ', v.anio_modelo) AS vehiculo"),
                DB::raw("CONCAT(u.name) AS perito"),
                'cv.velocidad_final_kmh',
                'cv.exceso_velocidad',
                'cv.delta_exceso_kmh'
            );

        // Búsqueda por número de siniestro
        if ($buscar = $request->input('buscar')) {
            $query->where('i.numero_siniestro', 'like', "%{$buscar}%");
        }

        // Filtro por rango de fechas
        if ($desde = $request->input('desde')) {
            $query->where('i.fecha_hecho', '>=', $desde);
        }
        if ($hasta = $request->input('hasta')) {
            $query->where('i.fecha_hecho', '<=', $hasta);
        }

        // Filtro por tipo de hecho
        if ($tipoHecho = $request->input('tipo_hecho_id')) {
            $query->where('i.tipo_hecho_id', $tipoHecho);
        }

        // Filtro por estado (0=Abierto, 1=En revisión, 2=Finalizado)
        if ($request->filled('estado')) {
            $query->where('i.estado', $request->input('estado'));
        }

        // Filtro por perito
        if ($peritoId = $request->input('perito_id')) {
            $query->where('i.id_usuario_perito', $peritoId);
        }

        $total = $query->count();
        $perPage = $request->input('per_page', 10);
        $data = $query->orderByDesc('i.fecha_hecho')->paginate($perPage);

        return response()->json([
            'data'  => $data->items(),
            'meta'  => [
                'total'        => $data->total(),
                'per_page'     => $data->perPage(),
                'current_page' => $data->currentPage(),
                'last_page'    => $data->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/rat/incidentes/{uuid}
     *
     * Detalle completo de un expediente. Carga todas las secciones
     * del wizard para permitir ver / editar el expediente.
     */
    public function show($uuid)
    {
        $incidente = Incidente::where('uuid', $uuid)
            ->with([
                'tipoHecho',
                'perito',
                'ubicacionVia.tipoVia',
                'ubicacionVia.tipoTrazo',
                'ubicacionVia.clima',
                'ubicacionVia.tipoPavimento',
                'ubicacionVia.condicionSuperficie',
                'ubicacionVia.condicionPavimento',
                'ubicacionVia.orientacion',
                'ubicacionVia.sentidoVialidad',
                'vehiculos.vehiculo',
                'vehiculos.color',
                'vehiculos.estadoNeumatico',
                'vehiculos.ocupacionCarga',
                'vehiculos.deformacionMedicion.tipoGolpe',
                'vehiculos.calculoVelocidad',
                'vehiculos.narrativaDinamica',
                'vehiculos.principiosForenses.conclusiones',
                'vehiculos.fotos.tipoFoto',
                'reportes',
            ])
            ->firstOrFail();

        return response()->json($incidente);
    }

    /**
     * DELETE /api/rat/incidentes/{uuid}
     *
     * Elimina un expediente completo con todos sus registros hijos.
     */
    public function destroy(string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();

        if ($incidente->estado !== 0) {
            return response()->json([
                'message' => 'Solo se pueden eliminar expedientes en estado Abierto.',
            ], 422);
        }

        DB::transaction(function () use ($incidente) {
            $id = $incidente->id;

            // Hijos de RAT_INCIDENTE_VEHICULO
            $ivIds = DB::table('RAT_INCIDENTE_VEHICULO')
                ->where('incidente_id', $id)->pluck('id');

            if ($ivIds->isNotEmpty()) {
                // RAT_CONCLUSION → hijos de RAT_PRINCIPIOS_FORENSES
                $pfIds = DB::table('RAT_PRINCIPIOS_FORENSES')
                    ->whereIn('incidente_vehiculo_id', $ivIds)->pluck('id');
                if ($pfIds->isNotEmpty()) {
                    DB::table('RAT_CONCLUSION')
                        ->whereIn('principios_forenses_id', $pfIds)->delete();
                }

                foreach ([
                    'RAT_PRINCIPIOS_FORENSES', 'RAT_NARRATIVA_DINAMICA',
                    'RAT_CALCULO_VELOCIDAD',   'RAT_DEFORMACION_MEDICION',
                    'RAT_FASE_ACCIDENTE',      'RAT_OCUPACION_CARGA',
                    'RAT_FOTO',                'RAT_MODALIDAD_DANO',
                    'RAT_IA_SOLICITUD',
                ] as $tabla) {
                    DB::table($tabla)->whereIn('incidente_vehiculo_id', $ivIds)->delete();
                }

                DB::table('RAT_INCIDENTE_VEHICULO')->where('incidente_id', $id)->delete();
            }

            // Hijos de RAT_UBICACION_VIA
            $uvIds = DB::table('RAT_UBICACION_VIA')
                ->where('incidente_id', $id)->pluck('id');
            if ($uvIds->isNotEmpty()) {
                DB::table('RAT_HUELLA_ESCENA')
                    ->whereIn('ubicacion_via_id', $uvIds)->delete();
            }

            // IA solicitudes con referencia directa al incidente
            DB::table('RAT_IA_SOLICITUD')->where('incidente_id', $id)->delete();

            // Hijos directos del incidente
            DB::table('RAT_UBICACION_VIA')->where('incidente_id', $id)->delete();
            DB::table('RAT_REPORTE')->where('incidente_id', $id)->delete();

            $incidente->delete();
        });

        return response()->json(['message' => 'Expediente eliminado.'], 200);
    }

    public function cambiarEstado(Request $request, string $uuid): JsonResponse
    {
        $this->validate($request, [
            'estado' => ['required', Rule::in([0, 1, 2, 3])],
        ]);

        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $incidente->update(['estado' => $request->estado]);

        return response()->json([
            'message' => 'Estado actualizado.',
            'estado'  => $incidente->estado,
        ]);
    }
}
