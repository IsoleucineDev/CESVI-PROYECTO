<?php

namespace App\Http\Controllers\RAT;

use App\Http\Controllers\Controller;
use App\Models\Rat\{Incidente, Reporte, Plantilla, PlantillaVariable};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ReporteController extends Controller
{
    // =========================================================
    //  Colores corporativos CESVI México
    // =========================================================
    const CESVI_BLUE      = '1F6AA5';
    const CESVI_CYAN      = '00B0F0';
    const CESVI_GRAY_BG   = 'F2F2F2';
    const CESVI_HEADER_BG = 'D5E8F0';
    const CESVI_WHITE     = 'FFFFFF';
    const CESVI_BLACK     = '000000';

    // =========================================================
    //  GET /api/v1/rat/reportes/{uuid}
    // =========================================================
    public function show(string $uuid): JsonResponse
    {
        $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
        $reporte   = $incidente->reportes()->first();

        if (!$reporte) {
            return response()->json(['message' => 'No hay reporte generado aún'], 404);
        }

        return response()->json([
            'reporte_uuid'     => $reporte->uuid,
            'estado'           => $reporte->estado,
            'tipo_documento'   => $reporte->tipo_documento,
            'fecha_emision'    => $reporte->fecha_emision,
            'ruta_documento'   => $reporte->ruta_documento_word,
            'intentos_emision' => $reporte->intentos_emision,
        ]);
    }

    // =========================================================
    //  POST /api/v1/rat/reportes/{uuid}/generar
    // =========================================================
    public function generar(string $uuid): JsonResponse
    {
        try {
            $incidente = Incidente::where('uuid', $uuid)->firstOrFail();

            $reporte = $incidente->reportes()->first();
            if (!$reporte) {
                $reporte = $incidente->reportes()->create([
                    'id_usuario_perito' => $incidente->id_usuario_perito,
                    'tipo_documento'    => 'dictamen',
                    'estado'            => 0,
                ]);
            }

            $datos = $this->extraerDatosIncidente($incidente, $reporte);

            $carpeta       = "rat/reportes/{$incidente->uuid}";
            $nombreArchivo = "{$incidente->numero_siniestro}_{$incidente->uuid}.docx";
            $rutaSalida    = storage_path("app/public/{$carpeta}/{$nombreArchivo}");

            Storage::disk('public')->makeDirectory($carpeta);

            $this->generarWordCesvi($datos, $rutaSalida);

            $reporte->update([
                'ruta_documento_word' => "{$carpeta}/{$nombreArchivo}",
                'fecha_generacion'    => now(),
            ]);

            return response()->json([
                'message'      => 'Reporte generado exitosamente',
                'reporte_uuid' => $reporte->uuid,
                'url_descarga' => asset("storage/{$carpeta}/{$nombreArchivo}"),
                'estado'       => $reporte->estado,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error generando reporte RAT', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Error al generar reporte',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // =========================================================
    //  GET /api/v1/rat/reportes/{uuid}/descargar
    // =========================================================
    public function descargar(string $uuid)
    {
        try {
            $incidente = Incidente::where('uuid', $uuid)->firstOrFail();
            $reporte   = $incidente->reportes()->first();

            if (!$reporte || !$reporte->ruta_documento_word) {
                return response()->json(['message' => 'Reporte no generado'], 404);
            }

            $rutaCompleta = storage_path("app/public/{$reporte->ruta_documento_word}");

            if (!file_exists($rutaCompleta)) {
                return response()->json(['message' => 'Archivo no encontrado'], 404);
            }

            return response()->download($rutaCompleta, "{$incidente->numero_siniestro}.docx");

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al descargar',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // =========================================================
    //  HELPER: Genera el Word con Node.js (docx)
    // =========================================================
    private function generarWordCesvi(array $datos, string $rutaSalida): void
    {
        $jsonDatos  = base64_encode(json_encode($datos, JSON_UNESCAPED_UNICODE));
        $scriptPath = base_path('scripts/rat/generar_reporte.mjs');

        if (!file_exists(dirname($scriptPath))) {
            mkdir(dirname($scriptPath), 0755, true);
        }

        $this->escribirScriptNode($scriptPath);

        $comando = "node \"{$scriptPath}\" \"{$rutaSalida}\" \"{$jsonDatos}\" 2>&1";
        $salida  = shell_exec($comando);

        if (!file_exists($rutaSalida)) {
            throw new \RuntimeException("Node.js no generó el archivo. Salida: {$salida}");
        }
    }

    // =========================================================
    //  HELPER: Escribe el script Node.js que construye el .docx
    // =========================================================
    private function escribirScriptNode(string $scriptPath): void
    {
        $script = <<<'JS'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak,
  ImageRun, TabStopType, convertInchesToTwip
} from 'docx';
import fs from 'fs';
import path from 'path';

const rutaSalida = process.argv[2];
const datos = JSON.parse(Buffer.from(process.argv[3], 'base64').toString('utf-8'));

const BLUE    = '1F6AA5';
const CYAN    = '00B0F0';
const GRAY_BG = 'F2F2F2';
const WHITE   = 'FFFFFF';
const BLACK   = '000000';

const val = (v) => (v && v !== 'null' && v !== 'undefined') ? String(v) : '---';

const borde = (color = 'CCCCCC') => ({ style: BorderStyle.SINGLE, size: 6, color });
const bordes = (color = 'CCCCCC') => ({
  top: borde(color), bottom: borde(color),
  left: borde(color), right: borde(color),
});
const celda = (txt, opts = {}) => new TableCell({
  borders: bordes(opts.borderColor || 'CCCCCC'),
  width: { size: opts.width || 4680, type: WidthType.DXA },
  shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
  margins: { top: 80, bottom: 80, left: 140, right: 140 },
  verticalAlign: VerticalAlign.CENTER,
  columnSpan: opts.span,
  children: [new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({
      text: txt,
      bold: opts.bold || false,
      size: opts.size || 20,
      color: opts.color || BLACK,
      font: 'Arial',
    })],
  })],
});

const seccion = (num, titulo) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text: `${num}    ${titulo.toUpperCase()}`, bold: true, size: 24, color: BLUE, font: 'Arial' })],
});
const subseccion = (num, titulo) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 160, after: 80 },
  children: [new TextRun({ text: `${num}    ${titulo}`, bold: true, size: 22, color: BLUE, font: 'Arial' })],
});
const parrafo = (texto, opts = {}) => new Paragraph({
  alignment: opts.align || AlignmentType.JUSTIFIED,
  spacing: { before: opts.before || 80, after: opts.after || 80, line: 276 },
  children: [new TextRun({
    text: texto,
    size: opts.size || 20,
    bold: opts.bold || false,
    color: opts.color || BLACK,
    font: 'Arial',
  })],
});
const lineaVacia = () => new Paragraph({ children: [new TextRun({ text: '' })] });

let logoRun = null;
const logoPath = path.resolve('public/img/cesvi_logo.png');
if (fs.existsSync(logoPath)) {
  const logoData = fs.readFileSync(logoPath);
  logoRun = new ImageRun({ data: logoData, transformation: { width: 130, height: 55 }, type: 'png' });
}

const header = new Header({
  children: [
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: CYAN, space: 4 } },
      children: [
        ...(logoRun ? [logoRun] : [new TextRun({ text: 'CESVI MÉXICO', bold: true, size: 28, color: BLUE, font: 'Arial' })]),
        new TextRun({ text: '\t\t', font: 'Arial' }),
        new TextRun({ text: 'FOR-MPT-RAT-04 Rev. 00', size: 16, color: '888888', font: 'Arial' }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
    }),
  ],
});

const footer = new Footer({
  children: [
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: CYAN, space: 4 } },
      children: [
        new TextRun({ text: 'Calle Uno Sur No. 101 Parque Industrial Toluca 2000  |  C.P. 50233 Toluca, Estado de México.', size: 16, color: '888888', font: 'Arial' }),
        new TextRun({ text: '\t', font: 'Arial' }),
        new TextRun({ text: 'Página ', size: 16, color: '888888', font: 'Arial' }),
        new TextRun({ children: [PageNumber.CURRENT] }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
    }),
  ],
});

const tipoDoc   = val(datos.tipo_documento).toUpperCase();
const modalidad = val(datos.tipo_hecho).toUpperCase();

const portada = [
  lineaVacia(), lineaVacia(), lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text: `${tipoDoc} TÉCNICO DEL HECHO DE TRÁNSITO`, bold: true, size: 28, color: BLUE, font: 'Arial' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text: `EN SU MODALIDAD DE ${modalidad}`, bold: true, size: 24, color: BLUE, font: 'Arial' })],
  }),
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({
      text: `EN EL QUE SE VIO INVOLUCRADO EL VEHÍCULO: MARCA ${val(datos.marca).toUpperCase()}, ` +
            `TIPO ${val(datos.modelo).toUpperCase()}, COLOR ${val(datos.color).toUpperCase()}, ` +
            `MODELO ${val(datos.anio)}, PLACAS DE CIRCULACIÓN ${val(datos.numero_placas).toUpperCase()}, ` +
            `NÚMERO DE SERIE ${val(datos.vin).toUpperCase()}`,
      bold: true, size: 22, color: BLACK, font: 'Arial',
    })],
  }),
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80 },
    children: [new TextRun({ text: `SINIESTRO: ${val(datos.numero_siniestro)}`, bold: true, size: 24, color: BLUE, font: 'Arial' })],
  }),
  lineaVacia(), lineaVacia(), lineaVacia(),
  new Paragraph({ children: [new PageBreak()] }),
];

const seccionesIdx = [
  ['1', 'OBJETIVO TÉCNICO', '3'],
  ['2', 'FUNDAMENTOS DEL ESTUDIO', '3'],
  ['3', 'CARACTERÍSTICAS DEL VEHÍCULO BAJO ESTUDIO', '3'],
  ['4', 'OBSERVACIÓN DE DAÑOS EN EL VEHÍCULO', '3'],
  ['5', 'LUGAR DE INTERVENCIÓN', 'X'],
  ['6', 'CONSIDERACIONES', 'X'],
  ['7', 'CONSIDERACIONES ADICIONALES', 'X'],
  ['8', 'CONCLUSIONES', 'X'],
];
const filasIdx = seccionesIdx.map(([n, t, p]) =>
  new TableRow({ children: [
    celda(n, { width: 600 }),
    celda(t, { width: 7560 }),
    celda(p, { width: 1200, align: AlignmentType.RIGHT }),
  ]}),
);
const tablaContenido = [
  seccion('', 'CONTENIDO'),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [600, 7560, 1200],
    rows: filasIdx,
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

const seccion1 = [
  seccion('1', 'OBJETIVO TÉCNICO'),
  parrafo(
    `El presente ${tipoDoc.toLowerCase()} tiene como objetivo determinar si los daños que presenta el ` +
    `vehículo: marca ${val(datos.marca)}, tipo ${val(datos.modelo)}, color ${val(datos.color)}, ` +
    `modelo ${val(datos.anio)}, placas de circulación ${val(datos.numero_placas)}, número de serie ` +
    `${val(datos.vin)}, se generan conforme a lo establecido en la narrativa del accidente, además de ` +
    `brindar comentarios objetivos y técnico-científicos que auxilien a quien corresponda para la toma ` +
    `de decisiones que así se consideren.`
  ),
  lineaVacia(),
];

const seccion2 = [
  seccion('2', 'FUNDAMENTOS DEL ESTUDIO'),
  parrafo(
    `Se analizará el hecho bajo estudio aplicando los métodos científicos, las técnicas de investigación ` +
    `desarrolladas por las ciencias auxiliares de la criminalística; así como en la observación de los ` +
    `daños que exhiben los vehículos bajo estudio, por medio de fotografías; con información proporcionada ` +
    `por la compañía de seguros e información desarrollada por CESVI México.`
  ),
  lineaVacia(),
];

const filasVehiculo = [
  ['DATOS', 'VEHÍCULO A'],
  ['MARCA',        val(datos.marca)],
  ['TIPO',         val(datos.modelo)],
  ['MODELO',       val(datos.anio)],
  ['COLOR',        val(datos.color)],
  ['NO. DE SERIE', val(datos.vin)],
  ['PLACAS',       val(datos.numero_placas)],
].map(([k, v], i) => new TableRow({
  children: [
    celda(k, { width: 4680, bold: i === 0, fill: i === 0 ? BLUE : (i % 2 === 0 ? GRAY_BG : WHITE), color: i === 0 ? WHITE : BLACK }),
    celda(v, { width: 4680, bold: i === 0, fill: i === 0 ? BLUE : (i % 2 === 0 ? GRAY_BG : WHITE), color: i === 0 ? WHITE : BLACK, align: AlignmentType.CENTER }),
  ],
}));
const seccion3 = [
  seccion('3', 'CARACTERÍSTICAS DEL VEHÍCULO BAJO ESTUDIO'),
  new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [4680, 4680], rows: filasVehiculo }),
  lineaVacia(),
];

const seccion4 = [
  seccion('4', 'OBSERVACIÓN DE DAÑOS EN EL VEHÍCULO'),
  subseccion('4.1', `VEHÍCULO MARCA ${val(datos.marca).toUpperCase()}, TIPO ${val(datos.modelo).toUpperCase()}, COLOR ${val(datos.color).toUpperCase()}, MODELO ${val(datos.anio)}, PLACAS ${val(datos.numero_placas)}`),
  subseccion('4.1.1', 'PARTE FRONTAL'),   parrafo('.'),
  subseccion('4.1.2', 'LATERAL DERECHO'), parrafo('.'),
  subseccion('4.1.3', 'PARTE POSTERIOR'), parrafo('.'),
  subseccion('4.1.4', 'LATERAL IZQUIERDO'), parrafo('.'),
  subseccion('4.1.5', 'COMPARTIMIENTO DEL MOTOR'), parrafo('.'),
  lineaVacia(),
];

const seccion5 = [
  seccion('5', 'LUGAR DE INTERVENCIÓN'),
  parrafo(
    `El lugar declarado como de intervención se ubica en ${val(datos.calle)}, ` +
    `perteneciente a ${val(datos.municipio)}, en el estado de ${val(datos.estado)}.`
  ),
  parrafo(
    `La vía de intervención es de tipo ${val(datos.tipo_via)}, con trazo ${val(datos.tipo_trazo)}, ` +
    `velocidad máxima permitida de ${val(datos.velocidad_maxima)} km/h, ` +
    `pavimento tipo ${val(datos.pavimento)}, condiciones climáticas: ${val(datos.clima)}, ` +
    `coeficiente de adherencia (μ) = ${val(datos.mu)}.`
  ),
  lineaVacia(),
];

const seccion6 = [
  seccion('6', 'CONSIDERACIONES'),
  parrafo('Se analizará el hecho bajo estudio aplicando los métodos científicos, técnicas de investigación desarrolladas por las ciencias Auxiliares de la Criminalística; así como en información proporcionada por la compañía de seguros e información desarrollada por CESVI MÉXICO.'),
  lineaVacia(),
  subseccion('6.1', 'Declaración del conductor'),
  parrafo(val(datos.narracion_hechos)),
  lineaVacia(),
  subseccion('6.2', 'Principio de intercambio o transferencia de materiales'),
  parrafo(val(datos.intercambio_materiales)),
  lineaVacia(),
  subseccion('6.3', 'Principio de correspondencia de características'),
  parrafo(val(datos.correspondencia)),
  lineaVacia(),
];

const seccion7 = [
  seccion('7', 'CONSIDERACIONES ADICIONALES'),
  parrafo('---'),
  lineaVacia(),
];

const conclusionesTxt = val(datos.conclusiones);
const conclusionesParrafos = conclusionesTxt.split('\n').filter(Boolean).map((c, i) =>
  parrafo(`${i + 1}.- ${c}`, { before: 100, after: 100 })
);
const seccion8 = [
  seccion('8', 'CONCLUSIONES'),
  ...(conclusionesParrafos.length > 0 ? conclusionesParrafos : [parrafo('---')]),
  lineaVacia(),
];

const firma = [
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({ text: `Toluca, Estado de México a ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}.`, size: 20, font: 'Arial' })],
  }),
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Atentamente', size: 20, font: 'Arial' })],
  }),
  lineaVacia(), lineaVacia(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: { top: borde(CYAN), bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          width: { size: 4680, type: WidthType.DXA },
          margins: { top: 120, bottom: 80, left: 200, right: 200 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: val(datos.nombre_perito), size: 20, font: 'Arial' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Analista de Seguridad Vial', bold: true, size: 20, font: 'Arial' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'y RAT CESVI Méx.', bold: true, size: 20, font: 'Arial' })] }),
          ],
        }),
        new TableCell({
          borders: { top: borde(CYAN), bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          width: { size: 4680, type: WidthType.DXA },
          margins: { top: 120, bottom: 80, left: 200, right: 200 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Supervisor RAT CESVI Méx.', size: 20, font: 'Arial' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Analista de Seguridad Vial', bold: true, size: 20, font: 'Arial' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'y RAT CESVI Méx.', bold: true, size: 20, font: 'Arial' })] }),
          ],
        }),
      ],
    })],
  }),
];

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 20, color: BLACK } },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, color: BLUE, font: 'Arial' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, color: BLUE, font: 'Arial' },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 1 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    headers: { default: header },
    footers: { default: footer },
    children: [
      ...portada,
      ...tablaContenido,
      ...seccion1,
      ...seccion2,
      ...seccion3,
      ...seccion4,
      ...seccion5,
      ...seccion6,
      ...seccion7,
      ...seccion8,
      ...firma,
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(rutaSalida, buf);
  console.log('OK: ' + rutaSalida);
}).catch(err => {
  console.error('ERROR: ' + err.message);
  process.exit(1);
});
JS;

        file_put_contents($scriptPath, $script);
    }

    // =========================================================
    //  HELPER: Extrae todos los datos del incidente
    // =========================================================
    private function extraerDatosIncidente(Incidente $incidente, Reporte $reporte): array
    {
        $iv          = $incidente->vehiculos()->first();
        $ubicacion   = $incidente->ubicacionVia;
        $deformacion = $iv?->deformacionMedicion;
        $calculo     = $iv?->calculoVelocidad;
        $narrativa   = $iv?->narrativaDinamica;
        $principios  = $iv?->principiosForenses;
        $perito      = $incidente->perito;

        return [
            // Incidente
            'numero_siniestro'       => $incidente->numero_siniestro,
            'fecha_hecho'            => $incidente->fecha_hecho?->format('d/m/Y'),
            'hora_hecho'             => $incidente->hora_hecho,
            'tipo_hecho'             => $incidente->tipoHecho?->nombre ?? 'CHOQUE',

            // Perito
            'nombre_perito'          => $perito?->name,
            'cedula_perito'          => $perito?->id_user,

            // Reporte
            'tipo_documento'         => $reporte->tipo_documento === 'informe' ? 'Informe' : 'Dictamen',
            'numero_formato'         => $reporte->numero_formato,
            'fecha_elaboracion'      => $reporte->fecha_elaboracion?->format('d/m/Y'),
            'nivel_emergencia'       => $reporte->nivel_emergencia,

            // Vehículo
            'vin'                    => $iv?->vehiculo?->vin,
            'marca'                  => $iv?->vehiculo?->marca,
            'submarca'               => $iv?->vehiculo?->submarca,
            'modelo'                 => $iv?->vehiculo?->nombre_modelo,
            'anio'                   => $iv?->vehiculo?->anio_modelo,
            'numero_placas'          => $iv?->numero_placas,
            'color'                  => $iv?->color?->nombre,
            'rol'                    => $iv?->rol,

            // Ubicación / Vía
            'calle'                  => $ubicacion?->calle,
            'municipio'              => $ubicacion?->municipio,
            'estado'                 => $ubicacion?->estado_republica,
            'km_punto'               => $ubicacion?->km_punto,
            'lat'                    => $ubicacion?->lat,
            'lng'                    => $ubicacion?->lng,
            'velocidad_maxima'       => $ubicacion?->velocidad_maxima_permitida_kmh,
            'tipo_via'               => $ubicacion?->tipoVia?->nombre,
            'tipo_trazo'             => $ubicacion?->tipoTrazo?->nombre,
            'clima'                  => $ubicacion?->clima?->nombre,
            'pavimento'              => $ubicacion?->tipoPavimento?->nombre,
            'mu'                     => $ubicacion?->mu_coeficiente_adherencia,

            // Deformación
            'tipo_golpe'             => $deformacion?->tipoGolpe?->nombre,

            // Cálculo de velocidad
            'velocidad_impacto'      => $calculo?->velocidad_impacto_kmh,
            'velocidad_final'        => $calculo?->velocidad_final_kmh,
            'exceso_velocidad'       => $calculo?->exceso_velocidad ? 'SÍ' : 'NO',
            'delta_exceso'           => $calculo?->delta_exceso_kmh,

            // Narrativa / Principios
            'narracion_hechos'       => $narrativa?->narracion_hechos,
            'posicion_final'         => $narrativa?->posicion_final_vehiculo,
            'intercambio_materiales' => $principios?->principio_intercambio_materiales,
            'correspondencia'        => $principios?->principio_correspondencia,
            'dinamica_fases'         => $principios?->dinamica_colision_fases,

            // Conclusiones (unidas por salto de línea para el script Node)
            'conclusiones'           => $principios?->conclusiones()->pluck('texto_conclusion')->join("\n"),
        ];
    }
}
