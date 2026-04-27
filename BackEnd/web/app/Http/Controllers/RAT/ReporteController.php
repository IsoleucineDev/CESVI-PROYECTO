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
            ]);

            return response()->json([
                'message'      => 'Reporte generado exitosamente',
                'reporte_uuid' => $reporte->uuid,
                'url_descarga' => rtrim(env('APP_URL', 'http://localhost:8000'), '/') . "/v1/rat/reportes/{$incidente->uuid}/descargar",
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
        $scriptPath = base_path('scripts/rat/generar_reporte.mjs');
        $scriptDir  = dirname($scriptPath);

        if (!file_exists($scriptDir)) {
            mkdir($scriptDir, 0755, true);
        }

        $this->escribirScriptNode($scriptPath);

        // Escribir los datos a un archivo temporal para evitar límites/problemas de CLI
        $jsonTmp = $scriptDir . DIRECTORY_SEPARATOR . 'datos_tmp_' . uniqid() . '.json';
        file_put_contents($jsonTmp, json_encode($datos, JSON_UNESCAPED_UNICODE));

        $nodeExe    = $this->resolverNode();

        if (PHP_OS_FAMILY === 'Windows') {
            $scriptDirW  = str_replace('/', '\\', $scriptDir);
            $scriptPathW = str_replace('/', '\\', $scriptPath);
            $rutaSalidaW = str_replace('/', '\\', $rutaSalida);
            $jsonTmpW    = str_replace('/', '\\', $jsonTmp);
            $comando     = "cmd /c \"cd /d \"{$scriptDirW}\" && \"{$nodeExe}\" \"{$scriptPathW}\" \"{$rutaSalidaW}\" \"{$jsonTmpW}\" 2>&1\"";
        } else {
            $comando = "cd \"{$scriptDir}\" && \"{$nodeExe}\" \"{$scriptPath}\" \"{$rutaSalida}\" \"{$jsonTmp}\" 2>&1";
        }

        $salida = shell_exec($comando);

        // Limpiar temp
        if (file_exists($jsonTmp)) {
            unlink($jsonTmp);
        }

        if (!file_exists($rutaSalida)) {
            throw new \RuntimeException(
                "Node.js no generó el archivo.\n" .
                "Ruta node: {$nodeExe}\n" .
                "Comando: {$comando}\n" .
                "Salida: {$salida}"
            );
        }
    }

    private function resolverNode(): string
    {
        // Candidatos conocidos en Windows
        $candidatos = [
            'D:\\node.exe',
            'C:\\Program Files\\nodejs\\node.exe',
            'C:\\Program Files (x86)\\nodejs\\node.exe',
        ];
        foreach ($candidatos as $c) {
            if (file_exists($c)) return $c;
        }

        // Intentar detectar con where/which
        $cmd    = PHP_OS_FAMILY === 'Windows' ? 'where node 2>NUL' : 'which node 2>/dev/null';
        $resultado = trim(shell_exec($cmd) ?? '');
        $primera   = explode("\n", $resultado)[0];
        if ($primera && file_exists(trim($primera))) {
            return trim($primera);
        }

        // Fallback: esperar que esté en PATH
        return 'node';
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
  ImageRun, TabStopType,
  HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const rutaSalida = process.argv[2];
const datos = JSON.parse(fs.readFileSync(process.argv[3], 'utf-8'));

// ── Constantes de color ───────────────────────────────────────────────────────
const BLUE    = '1F6AA5';
const CYAN    = '00B0F0';
const GRAY_BG = 'F2F2F2';
const WHITE   = 'FFFFFF';
const BLACK   = '000000';

const val = (v) => (v && v !== 'null' && v !== 'undefined') ? String(v) : '---';

const borde  = (color = 'CCCCCC') => ({ style: BorderStyle.SINGLE, size: 6, color });
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
      text: txt, bold: opts.bold || false,
      size: opts.size || 20, color: opts.color || BLACK, font: 'Arial',
    })],
  })],
});

const heading1 = (num, titulo) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text: `${num}    ${titulo.toUpperCase()}`, bold: true, size: 24, color: BLUE, font: 'Arial' })],
});
const heading2 = (num, titulo) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 160, after: 80 },
  children: [new TextRun({ text: `${num}    ${titulo}`, bold: true, size: 22, color: BLUE, font: 'Arial' })],
});
const parrafo = (texto, opts = {}) => new Paragraph({
  alignment: opts.align || AlignmentType.JUSTIFIED,
  spacing: { before: opts.before || 80, after: opts.after || 80, line: 276 },
  children: [new TextRun({
    text: texto, size: opts.size || 20, bold: opts.bold || false,
    color: opts.color || BLACK, font: 'Arial',
  })],
});
const lineaVacia = () => new Paragraph({ children: [new TextRun({ text: '' })] });

// ── Logo CESVI ────────────────────────────────────────────────────────────────
let logoRun = null;
const logoPath = path.join(__dirname, '..', '..', 'public', 'img', 'cesvi_logo.png');
if (fs.existsSync(logoPath)) {
  logoRun = new ImageRun({
    data: fs.readFileSync(logoPath),
    transformation: { width: 130, height: 55 },
    type: 'png',
  });
}

// ── Imágenes de fondo (opcionales) ───────────────────────────────────────────
// Coloca los PNGs en BackEnd/web/public/templates/
//   cesvi_portada.png  →  fondo para la portada
//   cesvi_pagina.png   →  fondo para las páginas de contenido
// Genera estos PNGs exportando cada página de tu PDF plantilla a 150+ DPI.
let bgPortada = null;
let bgPagina  = null;

try {
  const p = path.join(__dirname, '..', '..', 'public', 'templates', 'cesvi_portada.png');
  if (fs.existsSync(p)) bgPortada = fs.readFileSync(p);
} catch (_) {}
try {
  const p = path.join(__dirname, '..', '..', 'public', 'templates', 'cesvi_pagina.png');
  if (fs.existsSync(p)) bgPagina = fs.readFileSync(p);
} catch (_) {}

const usarBackground = bgPortada !== null || bgPagina !== null;


// Crea un Paragraph con la imagen de fondo flotante para insertar en el Header.
// Al estar en el encabezado con behindDocument=true, la imagen aparece detrás
// del texto en TODAS las páginas de esa sección (técnica de marca de agua Word).
function bgParaFullPage(buffer) {
  return new Paragraph({
    children: [
      new ImageRun({
        data: buffer,
        transformation: { width: 816, height: 1056 }, // 8.5" × 11" a 96 DPI
        type: 'png',
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.PAGE,
            offset: 0,
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            offset: 0,
          },
          behindDocument: true,
          allowOverlap: true,
          wrap: { type: TextWrappingType.NONE },
        },
      }),
    ],
  });
}

// ── Encabezado y pie programáticos (se usan cuando no hay fondo PNG) ──────────
const headerEstandar = new Header({
  children: [
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: CYAN, space: 4 } },
      children: [
        ...(logoRun
          ? [logoRun]
          : [new TextRun({ text: 'CESVI MÉXICO', bold: true, size: 28, color: BLUE, font: 'Arial' })]),
        new TextRun({ text: '\t\t', font: 'Arial' }),
        new TextRun({ text: 'FOR-MPT-RAT-04 Rev. 00', size: 16, color: '888888', font: 'Arial' }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
    }),
  ],
});

const footerEstandar = new Footer({
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

// Pie solo con número de página (cuando el fondo PNG ya incluye el diseño del pie)
const footerSoloPagina = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: 'Página ', size: 18, color: '888888', font: 'Arial' }),
        new TextRun({ children: [PageNumber.CURRENT] }),
      ],
    }),
  ],
});

const headerVacio = new Header({ children: [new Paragraph({ children: [] })] });
const footerVacio = new Footer({ children: [new Paragraph({ children: [] })] });

// ── Selección de header/footer según disponibilidad de fondo ─────────────────
const headerPortadaFinal    = (usarBackground && bgPortada)
  ? new Header({ children: [bgParaFullPage(bgPortada)] })
  : headerVacio;  // portada sin encabezado programático da aspecto más limpio

const headerContenidoFinal  = (usarBackground && bgPagina)
  ? new Header({ children: [bgParaFullPage(bgPagina)] })
  : headerEstandar;

const footerContenidoFinal  = usarBackground
  ? footerSoloPagina
  : footerEstandar;

// ── Márgenes de página ────────────────────────────────────────────────────────
const pageSize = { width: 12240, height: 15840 }; // Carta 8.5" × 11"

// Con fondo PNG: márgenes más generosos para que el texto caiga dentro del
// área de contenido del template (ajusta si tu plantilla tiene otras proporciones)
// Portada: top grande para que el texto quede en la zona blanca central
// (la plantilla CESVI tiene el logo arriba y decoración lateral izquierda)
const marginPortada = usarBackground
  ? { top: 4680, right: 1440, bottom: 2880, left: 1800 }  // 3.25" top, 2" bottom, 1.25" left
  : { top: 1080, right: 1080, bottom: 1080, left: 1080 };

// Contenido: márgenes razonables dentro del área blanca del template
const marginContenido = usarBackground
  ? { top: 1800, right: 1080, bottom: 1440, left: 1800 }  // 1.25" top/left, 1" bottom/right
  : { top: 1080, right: 1080, bottom: 1080, left: 1080 };

// ── Portada ───────────────────────────────────────────────────────────────────
const tipoDoc   = val(datos.tipo_documento).toUpperCase();
const modalidad = val(datos.tipo_hecho).toUpperCase();

// Texto de portada en un solo bloque, igual que los reportes reales:
// "[TIPO], HECHO DE TRÁNSITO, EN SU MODALIDAD [TIPO_HECHO] EN EL QUE SE VIO INVOLUCRADO..."
const textoCubierta =
  `${tipoDoc}, HECHO DE TRÁNSITO, EN SU MODALIDAD ${modalidad} ` +
  `EN EL QUE SE VIO INVOLUCRADO EL VEHÍCULO MARCA ${val(datos.marca).toUpperCase()}, ` +
  `TIPO ${val(datos.modelo).toUpperCase()}, COLOR ${val(datos.color).toUpperCase()} ` +
  `MODELO ${val(datos.anio)}, CON PLACAS DE CIRCULACIÓN ${val(datos.numero_placas).toUpperCase()}, ` +
  `NÚMERO DE SERIE ${val(datos.vin).toUpperCase()} ` +
  `CON DIRECCIÓN EN ${val(datos.calle).toUpperCase()}, ${val(datos.municipio).toUpperCase()}.`;

const portada = [
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: textoCubierta, bold: true, size: 22, color: BLACK, font: 'Arial' })],
  }),
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text: `SINIESTRO: ${val(datos.numero_siniestro)}.`, bold: true, size: 22, color: BLACK, font: 'Arial' })],
  }),
];

// ── Tabla de contenido ────────────────────────────────────────────────────────
const seccionesIdx = [
  ['1', 'OBJETIVO TÉCNICO', ''],
  ['2', 'FUNDAMENTOS DEL ESTUDIO', ''],
  ['3', 'CARACTERÍSTICAS DEL VEHÍCULO BAJO ESTUDIO', ''],
  ['4', 'OBSERVACIÓN DE DAÑOS EN EL VEHÍCULO', ''],
  ['5', 'LUGAR DE INTERVENCIÓN', ''],
  ['6', 'CONSIDERACIONES', ''],
  ['7', 'CONCLUSIONES', ''],
];
const filasIdx = seccionesIdx.map(([n, t, p]) =>
  new TableRow({ children: [
    celda(n, { width: 600 }),
    celda(t, { width: 7560 }),
    celda(p, { width: 1200, align: AlignmentType.RIGHT }),
  ]}),
);
const tablaContenido = [
  heading1('', 'CONTENIDO'),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [600, 7560, 1200],
    rows: filasIdx,
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── Sección 1 – Objetivo técnico ──────────────────────────────────────────────
const seccion1 = [
  heading1('1', 'OBJETIVO TÉCNICO'),
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

// ── Sección 2 – Fundamentos del estudio ──────────────────────────────────────
const seccion2 = [
  heading1('2', 'FUNDAMENTOS DEL ESTUDIO'),
  parrafo(
    `Se analizará el hecho bajo estudio aplicando los métodos científicos, las técnicas de investigación ` +
    `desarrolladas por las ciencias auxiliares de la criminalística; así como en la observación de los ` +
    `daños que exhiben los vehículos bajo estudio, por medio de fotografías; con información proporcionada ` +
    `por la compañía de seguros e información desarrollada por CESVI México.`
  ),
  lineaVacia(),
];

// ── Sección 3 – Características del vehículo ─────────────────────────────────
const filasVehiculo = [
  ['DATOS', `VEHÍCULO ${val(datos.rol)}`],
  ['MARCA',        val(datos.marca)],
  ['TIPO',         val(datos.modelo)],
  ['MODELO',       val(datos.anio)],
  ['COLOR',        val(datos.color)],
  ['NO. DE SERIE', val(datos.vin)],
  ['PLACAS',       val(datos.numero_placas)],
  ['ROL',          val(datos.rol)],
].map(([k, v], i) => new TableRow({
  children: [
    celda(k, { width: 4680, bold: i === 0, fill: i === 0 ? BLUE : (i % 2 === 0 ? GRAY_BG : WHITE), color: i === 0 ? WHITE : BLACK }),
    celda(v, { width: 4680, bold: i === 0, fill: i === 0 ? BLUE : (i % 2 === 0 ? GRAY_BG : WHITE), color: i === 0 ? WHITE : BLACK, align: AlignmentType.CENTER }),
  ],
}));
const seccion3 = [
  heading1('3', 'CARACTERÍSTICAS DEL VEHÍCULO BAJO ESTUDIO'),
  new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [4680, 4680], rows: filasVehiculo }),
  lineaVacia(),
];

// ── Sección 4 – Observación de daños (fotos) ─────────────────────────────────
function buildFotoGrid(fotos) {
  const rows = [];
  for (let i = 0; i < fotos.length; i += 2) {
    const cells = [];
    for (let j = i; j < Math.min(i + 2, fotos.length); j++) {
      let imgChild;
      try {
        const imgData = fs.readFileSync(fotos[j].ruta);
        const ext = fotos[j].ruta.split('.').pop().toLowerCase();
        imgChild = new ImageRun({ data: imgData, transformation: { width: 275, height: 206 }, type: ext === 'png' ? 'png' : 'jpg' });
      } catch (_) {
        imgChild = new TextRun({ text: '[imagen no disponible]', size: 18, color: '888888', font: 'Arial' });
      }
      const cellChildren = [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [imgChild] }),
      ];
      if (fotos[j].descripcion) {
        cellChildren.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: fotos[j].descripcion, size: 16, color: '666666', font: 'Arial', italics: true })],
        }));
      }
      cells.push(new TableCell({
        width: { size: 4680, type: WidthType.DXA },
        borders: bordes('DDDDDD'),
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: cellChildren,
      }));
    }
    if (cells.length === 1) {
      cells.push(new TableCell({
        width: { size: 4680, type: WidthType.DXA },
        borders: bordes('DDDDDD'),
        children: [new Paragraph({ children: [] })],
      }));
    }
    rows.push(new TableRow({ children: cells }));
  }
  return rows;
}

const fotosArr  = Array.isArray(datos.fotos) ? datos.fotos : [];
const ORDEN_FOTOS = ['Frontal','Lateral Derecho','Lateral Izquierdo','Posterior','Partes Bajas','Habitaculo','Lugar de los Hechos','Objeto Involucrado'];
const fotosPorTipo = fotosArr.reduce((acc, f) => {
  const t = f.tipo || 'Fotografías';
  if (!acc[t]) acc[t] = [];
  acc[t].push(f);
  return acc;
}, {});
const tiposOrdenados = [
  ...ORDEN_FOTOS.filter(t => fotosPorTipo[t]),
  ...Object.keys(fotosPorTipo).filter(t => !ORDEN_FOTOS.includes(t)),
];

const seccion4 = [
  heading1('4', 'OBSERVACIÓN DE DAÑOS EN EL VEHÍCULO'),
  parrafo(
    `A continuación se presentan las fotografías del vehículo: MARCA ${val(datos.marca).toUpperCase()}, ` +
    `TIPO ${val(datos.modelo).toUpperCase()}, COLOR ${val(datos.color).toUpperCase()}, ` +
    `MODELO ${val(datos.anio)}, PLACAS ${val(datos.numero_placas)}.`
  ),
  lineaVacia(),
];

if (fotosArr.length === 0) {
  seccion4.push(parrafo('Sin fotografías registradas.'));
} else {
  tiposOrdenados.forEach((tipo, idx) => {
    seccion4.push(heading2(`4.${idx + 1}`, tipo.toUpperCase()));
    seccion4.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [4680, 4680],
      rows: buildFotoGrid(fotosPorTipo[tipo]),
    }));
    seccion4.push(lineaVacia());
  });
}
seccion4.push(lineaVacia());

// ── Sección 5 – Lugar de intervención ────────────────────────────────────────
const seccion5 = [
  heading1('5', 'LUGAR DE INTERVENCIÓN'),
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

// ── Sección 6 – Consideraciones ──────────────────────────────────────────────
const dinamicaFases = val(datos.dinamica_fases);
const seccion6 = [
  heading1('6', 'CONSIDERACIONES'),
  parrafo(
    'Se realizará el hecho bajo estudio aplicando los métodos científicos, método inductivo, método ' +
    'deductivo y método descriptivo, así como técnicas de investigación desarrolladas por las ciencias ' +
    'Auxiliares de la Criminalística; así como en la información proporcionada por la compañía de seguros ' +
    'e información desarrollada por CESVI MÉXICO.'
  ),
  lineaVacia(),
  heading2('6.1', 'Declaración del conductor'),
  parrafo(val(datos.narracion_hechos)),
  lineaVacia(),
  heading2('6.2', 'Principio de intercambio o transferencia de materiales'),
  parrafo(val(datos.intercambio_materiales)),
  lineaVacia(),
  heading2('6.3', 'Principio de correspondencia de características'),
  parrafo(val(datos.correspondencia)),
  lineaVacia(),
  heading2('6.4', 'Dinámica de colisión'),
  parrafo(dinamicaFases !== '---' ? dinamicaFases : 'Sin dinámica de colisión registrada.'),
  lineaVacia(),
];

// ── Sección 7 – Conclusiones ──────────────────────────────────────────────────
const conclusionesTxt      = val(datos.conclusiones);
const conclusionesParrafos = conclusionesTxt
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean)
  .map((c, i) => parrafo(`${i + 1}.- ${c}`, { before: 100, after: 100 }));

const seccion7 = [
  heading1('7', 'CONCLUSIONES'),
  ...(conclusionesParrafos.length > 0 ? conclusionesParrafos : [parrafo('Sin conclusiones registradas.')]),
  lineaVacia(),
];

// ── Bloque de firmas ──────────────────────────────────────────────────────────
const firma = [
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({
      text: `Toluca, Estado de México a ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
      size: 20, font: 'Arial',
    })],
  }),
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Atentamente', size: 20, font: 'Arial' })],
  }),
  lineaVacia(), lineaVacia(), lineaVacia(), lineaVacia(), lineaVacia(), lineaVacia(), lineaVacia(), lineaVacia(),
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

// ── Documento Word con 2 secciones ────────────────────────────────────────────
// Sección 1: Portada (sin encabezado/pie visibles, fondo propio si hay PNG)
// Sección 2: Contenido (encabezado/pie CESVI, fondo propio si hay PNG)
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
  sections: [
    // ── Portada ──────────────────────────────────────────────────────────────
    {
      properties: {
        page: { size: pageSize, margin: marginPortada },
      },
      headers: { default: headerPortadaFinal },
      footers: { default: footerVacio },
      children: portada,
    },
    // ── Contenido ─────────────────────────────────────────────────────────────
    {
      properties: {
        page: { size: pageSize, margin: marginContenido },
      },
      headers: { default: headerContenidoFinal },
      footers: { default: footerContenidoFinal },
      children: [
        ...tablaContenido,
        ...seccion1,
        ...seccion2,
        ...seccion3,
        ...seccion4,
        ...seccion5,
        ...seccion6,
        ...seccion7,
        ...firma,
      ],
    },
  ],
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
            'conclusiones'           => $principios
                ? $principios->conclusiones()->pluck('texto_conclusion')->join("\n")
                : null,

            // Fotografías — rutas absolutas del disco para que Node las lea
            'fotos' => $iv ? $iv->fotos()->with('tipoFoto')->get()
                ->map(fn($f) => [
                    'ruta'        => storage_path("app/public/{$f->url}"),
                    'tipo'        => $f->tipoFoto?->nombre ?? 'Fotografías',
                    'descripcion' => $f->descripcion ?? null,
                ])
                ->filter(fn($f) => file_exists($f['ruta']))
                ->values()
                ->toArray() : [],
        ];
    }
}
