<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use App\Models\Rat\{Incidente, Reporte, Plantilla, PlantillaVariable};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\TemplateProcessor;

class ReporteController extends Controller
{
    /**
     * GET /v1/rat/reportes/{uuid}
     * Devuelve el estado del reporte (si existe, ruta, etc.)
     */
    public function show(string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $reporte = $incidente->reportes()->first();

        if (!$reporte) {
            return response()->json(['message' => 'No hay reporte generado aún'], 404);
        }

        return response()->json([
            'reporte_uuid'      => $reporte->uuid,
            'estado'            => $reporte->estado, // 0=creado, 1=en revisión, 2=emitido
            'tipo_documento'    => $reporte->tipo_documento,
            'fecha_emision'     => $reporte->fecha_emision,
            'ruta_documento'    => $reporte->ruta_documento_word,
            'intentos_emision'  => $reporte->intentos_emision,
        ]);
    }

    /**
     * POST /v1/rat/reportes/{uuid}/generar
     * 
     * Genera el documento Word desde la plantilla activa
     * e inyecta todos los datos del incidente.
     */
    public function generar(string $uuid): JsonResponse
    {
        try {
            $incidente = Incidente::where('uuid', $uuid)->firstOrFail();

            // Obtener o crear el reporte
            $reporte = $incidente->reportes()->first();
            if (!$reporte) {
                $reporte = $incidente->reportes()->create([
                    'id_usuario_perito' => $incidente->id_usuario_perito,
                    'tipo_documento'    => 'informe',
                    'estado'            => 0,
                ]);
            }

            // Obtener plantilla activa
            $plantilla = Plantilla::where('activa', true)->first();
            if (!$plantilla) {
                return response()->json(['message' => 'No hay plantilla activa'], 422);
            }

            // Cargar plantilla base (.dotx o .docx)
            $plantillaPath = storage_path("app/plantillas/{$plantilla->nombre_archivo}");
            if (!file_exists($plantillaPath)) {
                return response()->json(['message' => 'Archivo de plantilla no encontrado'], 422);
            }

            // ===== PROCESAMIENTO MASIVO DE DATOS =====
            $datosParaInyectar = $this->extraerDatosIncidente($incidente, $reporte);

            // Crear documento desde plantilla
            $templateProcessor = new TemplateProcessor($plantillaPath);

            // Inyectar variables simples
            foreach ($datosParaInyectar as $clave => $valor) {
                $templateProcessor->setValue($clave, $valor ?? '---');
            }

            // ===== GENERAR Y GUARDAR =====
            $carpetaReportes = "rat/reportes/{$incidente->uuid}";
            Storage::disk('public')->makeDirectory($carpetaReportes);

            $nombreArchivo = "{$incidente->numero_siniestro}_{$incidente->uuid}.docx";
            $rutaSalida = storage_path("app/public/{$carpetaReportes}/{$nombreArchivo}");

            $templateProcessor->saveAs($rutaSalida);

            // Actualizar reporte
            $reporte->update([
                'ruta_documento_word' => "{$carpetaReportes}/{$nombreArchivo}",
                'fecha_generacion'    => now(),
            ]);

            return response()->json([
                'message'           => 'Reporte generado exitosamente',
                'reporte_uuid'      => $reporte->uuid,
                'url_descarga'      => asset("storage/{$carpetaReportes}/{$nombreArchivo}"),
                'estado'            => $reporte->estado,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar reporte',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /v1/rat/reportes/{uuid}/descargar
     * 
     * Descarga el documento Word ya generado.
     */
    public function descargar(string $uuid)
    {
        try {
            $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
            $reporte = $incidente->reportes()->first();

            if (!$reporte || !$reporte->ruta_documento_word) {
                return response()->json(['message' => 'Reporte no generado'], 404);
            }

            $rutaCompleta = storage_path("app/public/{$reporte->ruta_documento_word}");

            if (!file_exists($rutaCompleta)) {
                return response()->json(['message' => 'Archivo no encontrado'], 404);
            }

            return response()->download(
                $rutaCompleta,
                "{$incidente->numero_siniestro}.docx"
            );

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al descargar',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * HELPER: Extrae todos los datos del incidente
     * para inyectarlos en la plantilla
     */
    private function extraerDatosIncidente(Incidente $incidente, Reporte $reporte): array
    {
        $iv = $incidente->vehiculos()->first();
        $ubicacion = $incidente->ubicacionVia;
        $deformacion = $iv?->deformacionMedicion;
        $calculo = $iv?->calculoVelocidad;
        $narrativa = $iv?->narrativaDinamica;
        $principios = $iv?->principiosForenses;
        $perito = $incidente->perito;

        return [
            // Incidente
            'numero_siniestro'      => $incidente->numero_siniestro,
            'fecha_hecho'           => $incidente->fecha_hecho?->format('d/m/Y'),
            'hora_hecho'            => $incidente->hora_hecho,
            'tipo_hecho'            => $incidente->tipoHecho?->nombre,

            // Perito
            'nombre_perito'         => $perito?->name,
            'cedula_perito'         => $perito?->id_user, // Ajusta si tienes otro campo

            // Reporte
            'tipo_documento'        => $reporte->tipo_documento == 'informe' ? 'Informe' : 'Dictamen',
            'numero_formato'        => $reporte->numero_formato,
            'fecha_elaboracion'     => $reporte->fecha_elaboracion?->format('d/m/Y'),
            'nivel_emergencia'      => $reporte->nivel_emergencia,

            // Vehículo
            'vin'                   => $iv?->vehiculo?->vin,
            'marca'                 => $iv?->vehiculo?->marca,
            'submarca'              => $iv?->vehiculo?->submarca,
            'modelo'                => $iv?->vehiculo?->nombre_modelo,
            'anio'                  => $iv?->vehiculo?->anio_modelo,
            'numero_placas'         => $iv?->numero_placas,
            'color'                 => $iv?->color?->nombre,
            'rol'                   => $iv?->rol,

            // Ubicación / Vía
            'calle'                 => $ubicacion?->calle,
            'municipio'             => $ubicacion?->municipio,
            'estado'                => $ubicacion?->estado_republica,
            'km_punto'              => $ubicacion?->km_punto,
            'lat'                   => $ubicacion?->lat,
            'lng'                   => $ubicacion?->lng,
            'velocidad_maxima'      => $ubicacion?->velocidad_maxima_permitida_kmh,
            'tipo_via'              => $ubicacion?->tipoVia?->nombre,
            'tipo_trazo'            => $ubicacion?->tipoTrazo?->nombre,
            'clima'                 => $ubicacion?->clima?->nombre,
            'pavimento'             => $ubicacion?->tipoPavimento?->nombre,
            'mu'                    => $ubicacion?->mu_coeficiente_adherencia,

            // Deformación
            'tipo_golpe'            => $deformacion?->tipoGolpe?->nombre,
            'c1'                    => $deformacion?->c1_m,
            'c2'                    => $deformacion?->c2_m,
            'c3'                    => $deformacion?->c3_m,
            'c4'                    => $deformacion?->c4_m,
            'c5'                    => $deformacion?->c5_m,
            'c6'                    => $deformacion?->c6_m,

            // Cálculo de velocidad
            'velocidad_impacto'     => $calculo?->velocidad_impacto_kmh,
            'velocidad_final'       => $calculo?->velocidad_final_kmh,
            'exceso_velocidad'      => $calculo?->exceso_velocidad ? 'SÍ' : 'NO',
            'delta_exceso'          => $calculo?->delta_exceso_kmh,

            // Narrativa
            'narracion_hechos'      => $narrativa?->narracion_hechos,
            'posicion_final'        => $narrativa?->posicion_final_vehiculo,

            // Principios forenses
            'intercambio_materiales' => $principios?->principio_intercambio_materiales,
            'correspondencia'        => $principios?->principio_correspondencia,
            'dinamica_fases'         => $principios?->dinamica_colision_fases,

            // Conclusión (primera)
            'conclusiones'           => $principios?->conclusiones()->pluck('texto_conclusion')->join(' '),
        ];
    }
}
