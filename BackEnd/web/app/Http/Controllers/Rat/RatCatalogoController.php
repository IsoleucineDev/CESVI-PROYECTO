<?php

namespace App\Http\Controllers\Rat;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RatCatalogoController extends Controller
{
    /**
     * GET /api/rat/catalogos
     *
     * Devuelve todos los catálogos en un solo request.
     * El frontend los cachea localmente para no repetir la llamada en cada paso.
     */
    public function todos(): JsonResponse
    {
        $tablas = [
            'tipos_hecho'              => 'RAT_CAT_TIPO_HECHO',
            'tipos_via'                => 'RAT_CAT_TIPO_VIA',
            'tipos_trazo'              => 'RAT_CAT_TIPO_TRAZO',
            'tipos_interseccion'       => 'RAT_CAT_TIPO_INTERSECCION',
            'senalamientos_vertical'   => 'RAT_CAT_SENALAMIENTO_VERTICAL',
            'senalamientos_horizontal' => 'RAT_CAT_SENALAMIENTO_HORIZONTAL',
            'condiciones_superficie'   => 'RAT_CAT_CONDICION_SUPERFICIE',
            'condiciones_pavimento'    => 'RAT_CAT_CONDICION_PAVIMENTO',
            'tipos_pavimento'          => 'RAT_CAT_TIPO_PAVIMENTO',
            'climas'                   => 'RAT_CAT_CLIMA',
            'orientaciones_via'        => 'RAT_CAT_ORIENTACION_VIA',
            'sentidos_vialidad'        => 'RAT_CAT_SENTIDO_VIALIDAD',
            'estados_neumatico'        => 'RAT_CAT_ESTADO_NEUMATICO',
            'colores'                  => 'RAT_CAT_COLOR',
            'tipos_foto'               => 'RAT_CAT_TIPO_FOTO',
            'tipos_golpe'              => 'RAT_CAT_TIPO_GOLPE',
            'numeros_mediciones'       => 'RAT_CAT_NUMERO_MEDICIONES',
            'tipos_indicio'            => 'RAT_CAT_TIPO_INDICIO',
            'posiciones_iniciales'     => 'RAT_CAT_POSICION_INICIAL',
            'percepciones_real'        => 'RAT_CAT_PERCEPCION_REAL',
            'puntos_clave'             => 'RAT_CAT_PUNTO_CLAVE',
            'trayectorias_post'        => 'RAT_CAT_TRAYECTORIA_POST',
            'zonas_vehiculo'           => 'RAT_CAT_ZONA_VEHICULO',
            'tipos_dano'               => 'RAT_CAT_TIPO_DANO',
            'cuerpos_generador'        => 'RAT_CAT_CUERPO_GENERADOR',
            'direcciones_dano'         => 'RAT_CAT_DIRECCION_DANO',
            'consecuencias_dano'       => 'RAT_CAT_CONSECUENCIA_DANO',
        ];

        $resultado = [];
        foreach ($tablas as $clave => $tabla) {
            $resultado[$clave] = DB::table($tabla)->orderBy('id')->get();
        }

        // Partes de vehículo agrupadas por zona (para el selector de daños)
        $resultado['partes_vehiculo'] = DB::table('RAT_CAT_PARTE_VEHICULO AS p')
            ->join('RAT_CAT_ZONA_VEHICULO AS z', 'z.id', '=', 'p.zona_id')
            ->select('p.id', 'p.nombre', 'p.tipo_vehiculo', 'p.subzona', 'z.nombre AS zona')
            ->orderBy('p.zona_id')
            ->orderBy('p.nombre')
            ->get();

        return response()->json($resultado);
    }

    /**
     * GET /api/rat/catalogos/peritos
     * Lista de peritos disponibles para el selector del paso 1.
     */
    public function peritos(): JsonResponse
    {
        $peritos = DB::table('sys_users AS u')
            ->leftJoin('RAT_PERITO_PERFIL AS p', 'p.id_user', '=', 'u.id_user')
            ->select('u.id_user', 'u.name', 'p.especialidad', 'p.numero_empleado')
            ->orderBy('u.name')
            ->get();

        return response()->json($peritos);
    }

    /**
     * GET /api/rat/catalogos/rigidez?batalla_mm=2450&tipo_golpe_id=1
     * Lookup de coeficientes A y B de McHenry según batalla y tipo de golpe.
     * Alimenta el paso 7 (Cálculo) cuando el usuario ingresa la batalla del vehículo.
     */
    public function rigidez(Request $request): JsonResponse
    {
        $request->validate([
            'batalla_mm'   => 'required|numeric|min:0',
            'tipo_golpe_id'=> 'required|exists:RAT_CAT_TIPO_GOLPE,id',
        ]);

        $batallaM = $request->batalla_mm / 1000;

        $rigidez = DB::table('RAT_TABLA_RIGIDEZ_AB')
            ->where('tipo_golpe_id', $request->tipo_golpe_id)
            ->where('batalla_min_m', '<=', $batallaM)
            ->where('batalla_max_m', '>=', $batallaM)
            ->first();

        if (!$rigidez) {
            return response()->json(['message' => 'No se encontraron coeficientes para los parámetros indicados.'], 404);
        }

        return response()->json($rigidez);
    }

    /**
     * GET /api/rat/catalogos/mu?tipo_pavimento_id=1&condicion_superficie_id=1&estado_neumatico_id=1
     * Lookup del coeficiente de adherencia mu.
     * Alimenta el paso 4 (Vía).
     */
    public function mu(Request $request): JsonResponse
    {
        $request->validate([
            'tipo_pavimento_id'      => 'required|exists:RAT_CAT_TIPO_PAVIMENTO,id',
            'condicion_superficie_id'=> 'required|exists:RAT_CAT_CONDICION_SUPERFICIE,id',
            'estado_neumatico_id'    => 'required|exists:RAT_CAT_ESTADO_NEUMATICO,id',
        ]);

        $mu = DB::table('RAT_TABLA_MU')
            ->where('tipo_pavimento_id', $request->tipo_pavimento_id)
            ->where('condicion_superficie_id', $request->condicion_superficie_id)
            ->where('estado_neumatico_id', $request->estado_neumatico_id)
            ->first();

        if (!$mu) {
            return response()->json(['message' => 'No se encontró coeficiente mu para los parámetros indicados.'], 404);
        }

        return response()->json(['mu' => $mu->mu]);
    }

    // Métodos alias para compatibilidad con rutas existentes
    public function tipoHecho(): JsonResponse
    {
        return response()->json(DB::table('RAT_CAT_TIPO_HECHO')->get());
    }

    public function tipoVia(): JsonResponse
    {
        return response()->json(DB::table('RAT_CAT_TIPO_VIA')->get());
    }

    public function tipoPavimento(): JsonResponse
    {
        return response()->json(DB::table('RAT_CAT_TIPO_PAVIMENTO')->get());
    }

    public function clima(): JsonResponse
    {
        return response()->json(DB::table('RAT_CAT_CLIMA')->get());
    }

    public function colores(): JsonResponse
    {
        return response()->json(DB::table('RAT_CAT_COLOR')->get());
    }

    public function tiposGolpe(): JsonResponse
    {
        return response()->json(DB::table('RAT_CAT_TIPO_GOLPE')->get());
    }

    public function estadoNeumatico(): JsonResponse
    {
        return response()->json(DB::table('RAT_CAT_ESTADO_NEUMATICO')->get());
    }

    public function zonaVehiculo(): JsonResponse
    {
        return response()->json(DB::table('RAT_CAT_ZONA_VEHICULO')->get());
    }

    public function parteVehiculo(): JsonResponse
    {
        return response()->json(
            DB::table('RAT_CAT_PARTE_VEHICULO AS p')
                ->join('RAT_CAT_ZONA_VEHICULO AS z', 'z.id', '=', 'p.zona_id')
                ->select('p.id', 'p.nombre', 'p.tipo_vehiculo', 'p.subzona', 'z.nombre AS zona')
                ->get()
        );
    }
}
