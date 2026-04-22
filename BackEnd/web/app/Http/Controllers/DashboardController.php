<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Rat\Incidente;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /api/rat/dashboard
     *
     * Devuelve todos los datos que necesita la pantalla Dashboard:
     *  - Contadores por estado
     *  - Expedientes por mes (últimos 6 meses)
     *  - Distribución por tipo de hecho
     *  - Expedientes recientes (últimos 5)
     *  - Resumen del mes actual
     */
    public function index(): JsonResponse
    {
        // ── Contadores por estado ─────────────────────────────────────────────
        $contadores = DB::table('siniestros')
            ->selectRaw("
                SUM(CASE WHEN estado = 'captura_inicial' THEN 1 ELSE 0 END) AS casos_abiertos,
                SUM(CASE WHEN estado = 'en_revision' THEN 1 ELSE 0 END) AS en_revision,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) AS finalizados
            ")
            ->first();

        // Excesos de velocidad confirmados (mocked to 0 for now as it requires calculation)
        $excesos = 0;

        // ── Expedientes por mes (últimos 6 meses) ─────────────────────────────
        $expedientesPorMes = DB::table('siniestros')
            ->selectRaw("DATE_FORMAT(fecha_hora_siniestro, '%Y-%m') AS mes, COUNT(*) AS total")
            ->where('fecha_hora_siniestro', '>=', \Carbon\Carbon::now()->subMonths(6)->startOfMonth())
            ->groupByRaw("DATE_FORMAT(fecha_hora_siniestro, '%Y-%m')")
            ->orderBy('mes')
            ->get();

        // ── Distribución por tipo de hecho ────────────────────────────────────
        $porTipoHecho = DB::table('siniestros')
            ->selectRaw('tipo_accidente AS nombre, COUNT(*) AS total')
            ->groupBy('tipo_accidente')
            ->orderByDesc('total')
            ->get();

        // ── Expedientes recientes (últimos 5) ─────────────────────────────────
        $recientes = DB::table('siniestros')
            ->select(
                'id AS uuid',
                'numero_siniestro',
                DB::raw('DATE(fecha_hora_siniestro) as fecha_hecho'),
                DB::raw('TIME(fecha_hora_siniestro) as hora_hecho'),
                'estado',
                'tipo_accidente AS tipo_hecho',
                DB::raw("'Pendiente' AS vehiculo"),
                DB::raw("NULL AS velocidad_final_kmh"),
                DB::raw("0 AS exceso_velocidad")
            )
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // ── Resumen del mes actual ─────────────────────────────────────────────
        $inicioMes = \Carbon\Carbon::now()->startOfMonth();
        $resumenMes = DB::table('siniestros')
            ->where('created_at', '>=', $inicioMes)
            ->selectRaw("
                COUNT(id) AS nuevos_casos,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) AS cerrados,
                0 AS con_exceso_velocidad,
                SUM(CASE WHEN estado = 'en_revision' THEN 1 ELSE 0 END) AS pendiente_revision
            ")
            ->first();

        return response()->json([
            'contadores' => [
                'casos_abiertos' => (int) $contadores->casos_abiertos,
                'en_revision'    => (int) $contadores->en_revision,
                'finalizados'    => (int) $contadores->finalizados,
                'exceso_velocidad' => $excesos,
            ],
            'expedientes_por_mes' => $expedientesPorMes,
            'por_tipo_hecho'      => $porTipoHecho,
            'expedientes_recientes' => $recientes,
            'resumen_mes'         => $resumenMes,
        ]);
    }
}
