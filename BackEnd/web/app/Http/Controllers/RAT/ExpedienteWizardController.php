<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use App\Models\Rat\{
    Incidente, Vehiculo, IncidenteVehiculo, OcupacionCarga,
    UbicacionVia, HuellaEscena, Foto,
    DeformacionMedicion, CalculoVelocidad,
    NarrativaDinamica, FaseAccidente,
    PrincipiosForenses, Conclusion, Reporte
};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ExpedienteWizardController extends Controller
{
    private function lumenValidate(Request $request, array $rules): array
    {
        $this->validate($request, $rules);
        return $request->all();
    }

    public function storePaso1(Request $request): JsonResponse
    {
        $data = $this->lumenValidate($request, [
            'numero_siniestro'  => 'required|string|max:100|unique:RAT_INCIDENTE,numero_siniestro',
            'fecha_hecho'       => 'required|date',
            'hora_hecho'        => 'nullable|date_format:H:i',
            'tipo_hecho_id'     => 'required|exists:RAT_CAT_TIPO_HECHO,id',
            'id_usuario_perito' => 'required|exists:sys_users,id_user',
            'estado'            => 'sometimes|integer|in:0,1,2',
        ]);
        $incidente = Incidente::create($data);
        return response()->json([
            'message'          => 'Paso 1 guardado.',
            'incidente_uuid'   => $incidente->uuid,
            'numero_siniestro' => $incidente->numero_siniestro,
        ], 201);
    }

    public function updatePaso1(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $data = $this->lumenValidate($request, [
            'numero_siniestro'  => 'sometimes|string|max:100|unique:RAT_INCIDENTE,numero_siniestro,'.$incidente->id,
            'fecha_hecho'       => 'sometimes|date',
            'hora_hecho'        => 'nullable|date_format:H:i',
            'tipo_hecho_id'     => 'sometimes|exists:RAT_CAT_TIPO_HECHO,id',
            'id_usuario_perito' => 'sometimes|exists:sys_users,id_user',
            'estado'            => 'sometimes|integer|in:0,1,2',
        ]);
        $incidente->update($data);
        return response()->json(['message' => 'Paso 1 actualizado.', 'data' => $incidente]);
    }

    public function updatePaso2(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $data = $this->lumenValidate($request, [
            'vin'                       => 'required|string|max:17',
            'marca'                     => 'required|string|max:100',
            'submarca'                  => 'nullable|string|max:100',
            'nombre_modelo'             => 'nullable|string|max:200',
            'anio_modelo'               => 'required|integer',
            'tipo_vehiculo'             => 'required|in:ligero,pesado',
            'numero_placas'             => 'nullable|string|max:20',
            'rol'                       => 'required|in:A,B,C',
        ]);

        DB::table('RAT_VEHICULO')->updateOrInsert(
            ['vin' => $data['vin']],
            [
                'marca'         => $data['marca'],
                'submarca'      => $data['submarca'] ?? null,
                'nombre_modelo' => $data['nombre_modelo'] ?? null,
                'anio_modelo'   => $data['anio_modelo'],
                'tipo_vehiculo' => $data['tipo_vehiculo'],
                'uuid'          => (string) \Illuminate\Support\Str::uuid(),
                'updated_at'    => date('Y-m-d H:i:s')
            ]
        );

        $vehiculo = DB::table('RAT_VEHICULO')->where('vin', $data['vin'])->first();


        $incidenteId = $incidente->getAttributes()['id'];

        DB::table('RAT_INCIDENTE_VEHICULO')->updateOrInsert(
            ['incidente_id' => $incidenteId, 'vehiculo_id' => $vehiculo->id],
            [
                'numero_placas' => $data['numero_placas'] ?? null,
                'rol'           => $data['rol'],
                'uuid'          => (string) \Illuminate\Support\Str::uuid()
            ]
        );

        return response()->json([
            'message' => 'Paso 2 guardado correctamente.',
            'vehiculo_id' => $vehiculo->id
        ]);
    }

    public function updatePaso3(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $data = $this->lumenValidate($request, [
            'numero_ocupantes'  => 'nullable|integer|min:0',
            'peso_conductor_kg' => 'nullable|numeric|min:0',
            'peso_pasajeros_kg' => 'nullable|numeric|min:0',
            'peso_equipaje_kg'  => 'nullable|numeric|min:0',
        ]);
        $iv = $this->getIncidenteVehiculo($incidente);
        if ($iv) {
            $tara = $iv->vehiculo->peso_tara_kg ?? 0;
            $data['masa_total_kg'] = $tara + ($data['peso_conductor_kg'] ?? 0) + ($data['peso_pasajeros_kg'] ?? 0) + ($data['peso_equipaje_kg'] ?? 0);
            OcupacionCarga::updateOrCreate(['incidente_vehiculo_id' => $iv->id], $data);
        }
        return response()->json(['message' => 'Paso 3 guardado.', 'masa_total_kg' => $data['masa_total_kg'] ?? null]);
    }

    public function updatePaso4(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $data = $this->lumenValidate($request, [
            'calle'                          => 'nullable|string|max:200',
            'municipio'                      => 'nullable|string|max:100',
            'estado_republica'               => 'nullable|string|max:100',
            'km_punto'                       => 'nullable|string|max:50',
            'lat'                            => 'nullable|numeric|between:-90,90',
            'lng'                            => 'nullable|numeric|between:-180,180',
            'velocidad_maxima_permitida_kmh' => 'nullable|integer|min:0',
            'tipo_via_id'                    => 'nullable|exists:RAT_CAT_TIPO_VIA,id',
            'tipo_trazo_id'                  => 'nullable|exists:RAT_CAT_TIPO_TRAZO,id',
            'condicion_superficie_id'        => 'nullable|exists:RAT_CAT_CONDICION_SUPERFICIE,id',
            'condicion_pavimento_id'         => 'nullable|exists:RAT_CAT_CONDICION_PAVIMENTO,id',
            'tipo_pavimento_id'              => 'nullable|exists:RAT_CAT_TIPO_PAVIMENTO,id',
            'clima_id'                       => 'nullable|exists:RAT_CAT_CLIMA,id',
            'mu_coeficiente_adherencia'      => 'nullable|numeric|between:0,1',
        ]);
        $ubicacion = UbicacionVia::updateOrCreate(['incidente_id' => $incidente->id], $data);
        return response()->json(['message' => 'Paso 4 guardado.', 'ubicacion_uuid' => $ubicacion->uuid]);
    }

    public function storePaso5(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $iv = $this->getIncidenteVehiculo($incidente);
        if (!$iv) {
            return response()->json(['message' => 'Completa el Paso 2 antes de subir fotos.'], 422);
        }
        $this->lumenValidate($request, [
            'tipo_foto_id' => 'required|exists:RAT_CAT_TIPO_FOTO,id',
            'foto'         => 'required|file|mimes:jpg,jpeg,png,webp|max:10240',
            'descripcion'  => 'nullable|string|max:500',
        ]);
        $path = $request->file('foto')->store("rat/incidentes/{$uuid}/fotos", 'public');
        $foto = Foto::create([
            'incidente_vehiculo_id' => $iv->id,
            'tipo_foto_id'          => $request->tipo_foto_id,
            'url'                   => $path,
            'descripcion'           => $request->descripcion,
        ]);
        return response()->json(['message' => 'Foto guardada.', 'foto_id' => $foto->id, 'url' => $path], 201);
    }

    public function destroyFoto(string $uuid, int $fotoId): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $iv = $this->getIncidenteVehiculo($incidente);
        if (!$iv) return response()->json(['message' => 'Sin vehículo.'], 422);
        $foto = Foto::where('id', $fotoId)->where('incidente_vehiculo_id', $iv->id)->firstOrFail();
        if (\Storage::disk('public')->exists($foto->url)) \Storage::disk('public')->delete($foto->url);
        $foto->delete();
        return response()->json(['message' => 'Foto eliminada.']);
    }

    public function updatePaso6(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $data = $this->lumenValidate($request, [
            'tipo_golpe_id'        => 'required|exists:RAT_CAT_TIPO_GOLPE,id',
            'numero_mediciones_id' => 'required|exists:RAT_CAT_NUMERO_MEDICIONES,id',
            'c1_m'                 => 'required|numeric|min:0',
            'c2_m'                 => 'required|numeric|min:0',
            'c3_m'                 => 'required|numeric|min:0',
            'c4_m'                 => 'nullable|numeric|min:0',
            'c5_m'                 => 'nullable|numeric|min:0',
            'c6_m'                 => 'nullable|numeric|min:0',
            'l_ancho_contacto_m'   => 'nullable|numeric|min:0',
            'angulo_fpi_grados'    => 'nullable|numeric|between:-90,90',
        ]);
        $iv = $this->getIncidenteVehiculo($incidente);
        if (!$iv) return response()->json(['message' => 'Completa el Paso 2 antes.'], 422);
        DeformacionMedicion::updateOrCreate(
            ['incidente_vehiculo_id' => $iv->id],
            array_merge($data, ['incidente_vehiculo_id' => $iv->id])
        );
        $mediciones = array_filter([$data['c1_m'], $data['c2_m'], $data['c3_m'], $data['c4_m'] ?? null, $data['c5_m'] ?? null, $data['c6_m'] ?? null], fn($v) => $v !== null);
        $dmed = count($mediciones) > 0 ? array_sum($mediciones) / count($mediciones) : 0;
        return response()->json(['message' => 'Paso 6 guardado.', 'dmed_calculado_m' => round($dmed, 4)]);
    }

    public function storePaso7(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $data = $this->lumenValidate($request, [
            'a_rigidez_n_m'              => 'nullable|numeric|min:0',
            'b_rigidez_n_m2'             => 'nullable|numeric|min:0',
            'ebs_m_s'                    => 'nullable|numeric|min:0',
            'velocidad_impacto_kmh'      => 'nullable|numeric|min:0',
            'dmed_m'                     => 'nullable|numeric|min:0',
            'velocidad_limpert_kmh'      => 'nullable|numeric|min:0',
            'e_frenado_julios'           => 'nullable|numeric|min:0',
            'velocidad_pre_impacto_kmh'  => 'nullable|numeric|min:0',
            'tiempo_respuesta_frenos_s'  => 'nullable|numeric|min:0',
            'velocidad_final_kmh'        => 'nullable|numeric|min:0',
            'delta_exceso_kmh'           => 'nullable|numeric',
        ]);
        $iv = $this->getIncidenteVehiculo($incidente);
        if (!$iv) return response()->json(['message' => 'Completa el Paso 2 antes.'], 422);
        if (isset($data['velocidad_final_kmh'])) {
            $velMax = optional($incidente->ubicacionVia)->velocidad_maxima_permitida_kmh;
            if ($velMax) {
                $data['exceso_velocidad'] = $data['velocidad_final_kmh'] > $velMax ? 1 : 0;
                $data['delta_exceso_kmh'] = $data['velocidad_final_kmh'] - $velMax;
            }
        }
        $calculo = CalculoVelocidad::updateOrCreate(
            ['incidente_vehiculo_id' => $iv->id],
            array_merge($data, ['incidente_vehiculo_id' => $iv->id])
        );
        return response()->json(['message' => 'Paso 7 guardado.', 'exceso_velocidad' => $calculo->exceso_velocidad]);
    }

    public function updatePaso8(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $data = $this->lumenValidate($request, [
            'narracion_hechos'            => 'nullable|string',
            'objeto_involucrado'          => 'nullable|string|max:200',
            'descripcion_objeto_fijo'     => 'nullable|string',
            'posicion_final_vehiculo'     => 'nullable|string|max:300',
            'direccion_circulacion'       => 'nullable|string|max:200',
            'distancia_ppr_al_pc_m'       => 'nullable|numeric|min:0',
            'tiempo_reaccion_conductor_s' => 'nullable|numeric|min:0',
            'huellas_frenado_m'           => 'nullable|numeric|min:0',
            'huellas_derrape_m'           => 'nullable|numeric|min:0',
        ]);
        $iv = $this->getIncidenteVehiculo($incidente);
        if ($iv) {
            NarrativaDinamica::updateOrCreate(['incidente_vehiculo_id' => $iv->id], $data);
        }
        return response()->json(['message' => 'Paso 8 guardado.']);
    }

    public function updatePaso9(Request $request, string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $data = $this->lumenValidate($request, [
            'principio_intercambio_materiales' => 'nullable|string',
            'principio_correspondencia'         => 'nullable|string',
            'conclusiones_texto'                => 'nullable|string',
            'tipo_documento'                    => 'required|in:informe,dictamen',
            'accion'                            => 'nullable|in:guardar,validar,emitir',
        ]);

        $iv = $this->getIncidenteVehiculo($incidente);

        DB::transaction(function () use ($data, $incidente, $iv) {
            if ($iv) {
                PrincipiosForenses::updateOrCreate(
                    ['incidente_vehiculo_id' => $iv->id],
                    [
                        'principio_intercambio_materiales' => $data['principio_intercambio_materiales'] ?? null,
                        'principio_correspondencia'         => $data['principio_correspondencia'] ?? null,
                    ]
                );
            }

            $reporte = Reporte::updateOrCreate(
                ['incidente_id' => $incidente->id],
                [
                    'id_usuario_perito' => $incidente->id_usuario_perito,
                    'tipo_documento'    => $data['tipo_documento'],
                ]
            );

            $accion = $data['accion'] ?? 'guardar';
            if ($accion === 'validar') {
                $incidente->update(['estado' => 1]);
            } elseif ($accion === 'emitir') {
                $incidente->update(['estado' => 2]);
            }
        });

        return response()->json(['message' => 'Paso 9 guardado.', 'estado_incidente' => $incidente->fresh()->estado]);
    }

    private function getIncidenteVehiculo(Incidente $incidente): ?IncidenteVehiculo
    {
        return IncidenteVehiculo::where('incidente_id', $incidente->id)->orderBy('id')->first();
    }
}