import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, Send, CheckCircle, AlertTriangle,
  FileText, User, Camera, Ruler, Calculator, BookOpen,
} from "lucide-react";
import { useIncidente } from "../../hooks/useIncidente";
import { generarReporte, getUrlDescarga } from "../../services/reporteService";

const TABS = [
  { id: "resumen",    label: "Resumen",     icon: <FileText size={14} /> },
  { id: "vehiculo",   label: "Vehículo",    icon: <User size={14} /> },
  { id: "evidencia",  label: "Evidencia",   icon: <Camera size={14} /> },
  { id: "deformacion",label: "Deformación", icon: <Ruler size={14} /> },
  { id: "calculos",   label: "Cálculos",    icon: <Calculator size={14} /> },
  { id: "narrativa",  label: "Narrativa",   icon: <BookOpen size={14} /> },
  { id: "reporte",    label: "Reporte",     icon: <FileText size={14} /> },
];

const ESTADO_LABEL = { 0: "Abierto", 1: "En revisión", 2: "Finalizado", 3: "Archivado" };
const ESTADO_BADGE = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
  3: "bg-gray-100 text-gray-700",
};

function Row({ label, val, highlight }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-red-600" : "text-gray-700"}`}>{val ?? "—"}</span>
    </div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function TabResumen({ inc }) {
  const iv  = inc.vehiculos?.[0];
  const ub  = inc.ubicacion_via;
  const cal = iv?.calculo_velocidad;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">Datos del Incidente</div>
        <Row label="No. Siniestro" val={inc.numero_siniestro} />
        <Row label="Fecha"         val={inc.fecha_hecho} />
        <Row label="Hora"          val={inc.hora_hecho} />
        <Row label="Tipo"          val={inc.tipo_hecho?.nombre} />
        <Row label="Estado"        val={ESTADO_LABEL[inc.estado] ?? inc.estado} />
        <Row label="Perito"        val={inc.perito?.name} />
        <Row label="Lugar"         val={ub ? `${ub.calle}, ${ub.municipio}, ${ub.estado_republica}` : null} />
      </div>
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">Datos del Vehículo</div>
        <Row label="Marca / Modelo" val={iv ? `${iv.vehiculo?.marca} ${iv.vehiculo?.submarca}` : null} />
        <Row label="Año"            val={iv?.vehiculo?.anio_modelo} />
        <Row label="VIN"            val={iv?.vehiculo?.vin} />
        <Row label="Placas"         val={iv?.numero_placas} />
        <Row label="Color"          val={iv?.color?.nombre} />
        <Row label="Rol"            val={iv?.rol} />
      </div>
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">Resultados de Velocidad</div>
        <Row label="Vel. pre-impacto" val={cal?.velocidad_impacto_kmh ? `${cal.velocidad_impacto_kmh} km/h` : null} />
        <Row label="Vel. final"       val={cal?.velocidad_final_kmh   ? `${cal.velocidad_final_kmh} km/h`   : null} />
        <Row label="Δv exceso"        val={cal?.delta_exceso_kmh       ? `+${cal.delta_exceso_kmh} km/h`    : null} highlight />
        <Row label="Límite permitido" val={ub?.velocidad_maxima_permitida_kmh ? `${ub.velocidad_maxima_permitida_kmh} km/h` : null} />
        <Row label="μ adherencia"     val={ub?.mu_coeficiente_adherencia} />
        {cal?.exceso_velocidad === 1 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-xs text-red-700">Exceso de velocidad confirmado</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TabVehiculo({ inc }) {
  const iv = inc.vehiculos?.[0];
  const v  = iv?.vehiculo ?? {};
  const fields = [
    ["Marca",       v.marca],       ["Submarca",  v.submarca],
    ["Año",         v.anio_modelo], ["Modelo",    v.nombre_modelo],
    ["VIN",         v.vin],         ["Placas",    iv?.numero_placas],
    ["Color",       iv?.color?.nombre],
    ["Peso Tara",   v.peso_tara_kg  ? `${v.peso_tara_kg} kg`   : null],
    ["MMA",         v.mma_kg        ? `${v.mma_kg} kg`         : null],
    ["Ancho",       v.ancho_mm      ? `${v.ancho_mm} mm`       : null],
    ["Largo",       v.largo_mm      ? `${v.largo_mm} mm`       : null],
    ["Alto",        v.alto_mm       ? `${v.alto_mm} mm`        : null],
    ["Batalla",     v.batalla_mm    ? `${v.batalla_mm} mm`     : null],
  ];
  return (
    <div className="grid grid-cols-4 gap-x-6 gap-y-2">
      {fields.map(([l, val]) => <Row key={l} label={l} val={val} />)}
    </div>
  );
}

function TabEvidencia({ inc }) {
  const iv   = inc.vehiculos?.[0];
  const fotos = iv?.fotos ?? [];
  const cats  = ["Frontal","Lateral Derecho","Lateral Izquierdo","Posterior","Partes Bajas","Habitáculo","Lugar de Hechos","Objeto Involucrado"];
  const countMap = fotos.reduce((acc, f) => {
    const tipo = f.tipo_foto?.nombre ?? "Otro";
    acc[tipo] = (acc[tipo] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-4 gap-4">
      {cats.map((cat) => {
        const count = countMap[cat] ?? 0;
        return (
          <div key={cat} className="border border-gray-200 rounded p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">{cat}</span>
              <span className={`text-xs rounded-full px-1.5 ${count > 0 ? "bg-[#E0F7FA] text-[#00ADCF]" : "bg-gray-100 text-gray-400"}`}>{count}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                <div key={j} className="aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-300">
                  <Camera size={14} />
                </div>
              ))}
              {count === 0 && (
                <div className="col-span-3 text-center text-xs text-gray-300 py-2">Sin evidencia</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TabDeformacion({ inc }) {
  const iv  = inc.vehiculos?.[0];
  const def = iv?.deformacion_medicion;

  const mediciones = def
    ? [
        { label: "C1", val: def.c1_m ? `${def.c1_m * 1000} mm` : "—" },
        { label: "C2", val: def.c2_m ? `${def.c2_m * 1000} mm` : "—" },
        { label: "C3", val: def.c3_m ? `${def.c3_m * 1000} mm` : "—" },
        { label: "C4", val: def.c4_m ? `${def.c4_m * 1000} mm` : "—" },
        { label: "C5", val: def.c5_m ? `${def.c5_m * 1000} mm` : "—" },
        { label: "C6", val: def.c6_m ? `${def.c6_m * 1000} mm` : "—" },
      ]
    : [];

  const cValues = def ? [def.c1_m, def.c2_m, def.c3_m, def.c4_m, def.c5_m, def.c6_m].map((v) => (v ?? 0) * 1000) : [];

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">
          Mediciones C1–C6 ({def?.tipo_golpe?.nombre ?? "—"}, {def?.numero_mediciones ?? 6} puntos)
        </div>
        {mediciones.length > 0
          ? (
            <div className="grid grid-cols-2 gap-3">
              {mediciones.map((m) => (
                <div key={m.label} className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
                  <div className="text-xs text-gray-500">{m.label}</div>
                  <div className="text-sm font-semibold text-gray-700">{m.val}</div>
                </div>
              ))}
            </div>
          )
          : <div className="text-xs text-gray-400">Sin mediciones registradas.</div>}

        {def && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ["Ancho contacto L", def.ancho_contacto_l_mm ? `${def.ancho_contacto_l_mm} mm` : "—"],
              ["Ángulo FPI",       def.angulo_fpi_grados   ? `${def.angulo_fpi_grados}°`      : "—"],
              ["Arqueamiento",     def.arqueamiento_mm      ? `${def.arqueamiento_mm} mm`      : "—"],
              ["Dmed",             def.d_med_m              ? `${(def.d_med_m * 1000).toFixed(1)} mm` : "—"],
            ].map(([l, v]) => (
              <div key={l} className="bg-[#E0F7FA] border border-[#00ADCF]/30 rounded px-3 py-2">
                <div className="text-xs text-gray-500">{l}</div>
                <div className="text-sm font-semibold" style={{ color: "#00ADCF" }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-500 mb-2">Diagrama de deformación</div>
        {cValues.length > 0
          ? (
            <svg width="200" height="140" viewBox="0 0 200 140">
              <rect x="10" y="20" width="180" height="110" rx="8" stroke="#9CA3AF" strokeWidth="2" fill="#F9FAFB" />
              {cValues.map((v, i) => {
                const x = 20 + i * 32;
                const h = (v / 400) * 80;
                return (
                  <g key={i}>
                    <rect x={x - 8} y={30} width={16} height={h} fill="#FCA5A5" opacity="0.6" />
                    <circle cx={x} cy={30 + h} r={4} fill="#EF4444" />
                    <text x={x} y={135} textAnchor="middle" fontSize="9" fill="#374151">C{i + 1}</text>
                  </g>
                );
              })}
            </svg>
          )
          : <div className="text-xs text-gray-400 mt-8">Sin datos de deformación.</div>}
      </div>
    </div>
  );
}

function TabCalculos({ inc }) {
  const iv  = inc.vehiculos?.[0];
  const cal = iv?.calculo_velocidad;

  if (!cal) return <div className="text-xs text-gray-400 py-4">Sin cálculos registrados.</div>;

  const resultados = [
    ["EBS",                    cal.ebs_kmh           ? `${cal.ebs_kmh} km/h`         : "—"],
    ["Velocidad de impacto",   cal.velocidad_impacto_kmh ? `${cal.velocidad_impacto_kmh} km/h` : "—"],
    ["Velocidad pre-impacto",  cal.velocidad_impacto_kmh ? `${cal.velocidad_impacto_kmh} km/h` : "—"],
    ["Velocidad final",        cal.velocidad_final_kmh   ? `${cal.velocidad_final_kmh} km/h`   : "—"],
    ["Δv (delta)",             cal.delta_exceso_kmh      ? `${cal.delta_exceso_kmh} km/h`      : "—"],
    ["Exceso de velocidad",    cal.exceso_velocidad === 1 ? `+${cal.delta_exceso_kmh ?? "?"} km/h` : "No"],
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">Parámetros</div>
        {[
          ["Rigidez A",         cal.rigidez_a],
          ["Rigidez B",         cal.rigidez_b],
          ["μ corregido",       cal.mu_corregido],
          ["Tiempo reacción",   cal.tiempo_reaccion_s ? `${cal.tiempo_reaccion_s} s` : null],
          ["Distancia frenado", cal.distancia_frenado_m ? `${cal.distancia_frenado_m} m` : null],
        ].map(([l, v]) => <Row key={l} label={l} val={v} />)}
      </div>
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1 flex items-center gap-2">
          Resultados <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">Calculados</span>
        </div>
        {resultados.map(([l, v]) => (
          <Row key={l} label={l} val={v} highlight={l === "Exceso de velocidad"} />
        ))}
      </div>
    </div>
  );
}

function TabNarrativa({ inc }) {
  const iv        = inc.vehiculos?.[0];
  const narrativa = iv?.narrativa_dinamica;
  const principios= iv?.principios_forenses;

  return (
    <div className="flex flex-col gap-4">
      {narrativa && (
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Narración del Hecho</div>
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-700 leading-6">
            {narrativa.narracion_hechos ?? "Sin narración."}
          </div>
        </div>
      )}
      {principios && (
        <>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Intercambio de materiales</div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700">
              {principios.principio_intercambio_materiales ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Correspondencia de características</div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700">
              {principios.principio_correspondencia ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Dinámica de la colisión</div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700">
              {principios.dinamica_colision_fases ?? "—"}
            </div>
          </div>
        </>
      )}
      {!narrativa && !principios && (
        <div className="text-xs text-gray-400 py-4">Sin narrativa registrada.</div>
      )}
    </div>
  );
}

function TabReporte({ uuid }) {
  const [generando, setGenerando] = useState(false);
  const [url,       setUrl]       = useState(null);
  const [error,     setError]     = useState("");

  const handleGenerar = async () => {
    setGenerando(true); setError("");
    try {
      const data = await generarReporte(uuid);
      setUrl(data.url_descarga ?? getUrlDescarga(uuid));
    } catch (e) {
      setError(e.message ?? "Error al generar reporte");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-xs">
          <CheckCircle size={14} /> Conclusiones validadas por perito responsable
        </div>
        {error && <span className="text-xs text-red-600">{error}</span>}
        <div className="ml-auto flex gap-2">
          {url && (
            <a href={url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:border-[#00ADCF]">
              <Download size={13} /> Descargar Word
            </a>
          )}
          <button onClick={handleGenerar} disabled={generando}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs disabled:opacity-60"
            style={{ backgroundColor: "#00ADCF" }}>
            <Send size={13} /> {generando ? "Generando..." : "Generar Reporte"}
          </button>
        </div>
      </div>
      <div className="border border-gray-300 rounded bg-gray-50 h-48 flex items-center justify-center text-xs text-gray-400">
        {url ? "Reporte generado — descarga disponible arriba." : "Presiona 'Generar Reporte' para crear el documento Word."}
      </div>
    </div>
  );
}

export default function DetalleExpediente() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [tab, setTab] = useState("resumen");
  const { incidente, loading, error } = useIncidente(id);

  const inc = incidente ?? {};
  const iv  = inc.vehiculos?.[0];
  const cal = iv?.calculo_velocidad;
  const estadoLabel = ESTADO_LABEL[inc.estado] ?? (inc.estado ?? "—");

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-3 flex items-center gap-3">
        <button onClick={() => navigate("/expedientes")}
          className="p-1.5 rounded border border-gray-300 text-gray-600 hover:border-[#00ADCF] hover:text-[#00ADCF]">
          <ArrowLeft size={15} />
        </button>

        {loading
          ? <div className="flex-1"><div className="animate-pulse bg-gray-200 h-4 w-48 rounded mb-1" /><div className="animate-pulse bg-gray-100 h-3 w-64 rounded" /></div>
          : (
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-800">{inc.numero_siniestro ?? id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[inc.estado] ?? "bg-gray-100 text-gray-700"}`}>
                  {estadoLabel}
                </span>
                {cal?.exceso_velocidad === 1 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle size={11} /> Exceso de velocidad
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {inc.tipo_hecho?.nombre} · {inc.fecha_hecho} {inc.hora_hecho} · {inc.perito?.name}
              </div>
            </div>
          )}

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:border-[#00ADCF]">
            <Download size={13} /> Word
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-xs text-red-700">{error}</div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex border-b border-gray-200">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs border-b-2 transition-colors ${
                tab === t.id ? "border-[#00ADCF] text-[#00ADCF]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {loading
            ? <div className="flex flex-col gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse bg-gray-100 h-5 rounded" />)}</div>
            : (
              <>
                {tab === "resumen"     && <TabResumen     inc={inc} />}
                {tab === "vehiculo"    && <TabVehiculo    inc={inc} />}
                {tab === "evidencia"   && <TabEvidencia   inc={inc} />}
                {tab === "deformacion" && <TabDeformacion inc={inc} />}
                {tab === "calculos"    && <TabCalculos    inc={inc} />}
                {tab === "narrativa"   && <TabNarrativa   inc={inc} />}
                {tab === "reporte"     && <TabReporte     uuid={id} />}
              </>
            )}
        </div>
      </div>
    </div>
  );
}
