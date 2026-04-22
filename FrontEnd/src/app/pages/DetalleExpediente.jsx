import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, Send, CheckCircle,
  AlertTriangle, FileText, User, Camera,
  Ruler, Calculator, BookOpen,
} from "lucide-react";
import { getSiniestroById } from "../../services/siniestroService";

const TABS = [
  { id: "resumen",    label: "Resumen",    icon: <FileText size={14} /> },
  { id: "vehiculo",   label: "Vehículo",   icon: <User size={14} /> },
  { id: "evidencia",  label: "Evidencia",  icon: <Camera size={14} /> },
  { id: "deformacion",label: "Deformación",icon: <Ruler size={14} /> },
  { id: "calculos",   label: "Cálculos",   icon: <Calculator size={14} /> },
  { id: "narrativa",  label: "Narrativa",  icon: <BookOpen size={14} /> },
  { id: "reporte",    label: "Reporte",    icon: <FileText size={14} /> },
];

const ESTADO_BADGE = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
};
const ESTADO_LABEL = { 0: "Abierto", 1: "En revisión", 2: "Finalizado" };

function Row({ label, val, highlight }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-red-600" : "text-gray-700"}`}>
        {val || "—"}
      </span>
    </div>
  );
}

function formatFecha(val) {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d) ? val : d.toLocaleDateString("es-MX");
}

// ── Normaliza la respuesta del backend al shape que usan las tabs ─────────────
// Rat\IncidenteController@show devuelve el modelo Incidente con relaciones:
//   tipoHecho, ubicacionVia, vehiculos.vehiculo, vehiculos.calculoVelocidad,
//   vehiculos.narrativaDinamica, vehiculos.principiosForenses.conclusiones, reportes
function normalizeExp(raw) {
  if (!raw) return null;

  const iv       = raw.vehiculos?.[0];           // primer incidente_vehiculo
  const vehiculo = iv?.vehiculo;                  // RAT_VEHICULO
  const calculo  = iv?.calculoVelocidad;          // RAT_CALCULO_VELOCIDAD
  const narrativa= iv?.narrativaDinamica;         // RAT_NARRATIVA_DINAMICA
  const ubicacion= raw.ubicacionVia;              // RAT_UBICACION_VIA
  const reporte  = raw.reportes?.[0];             // RAT_REPORTE
  const principios = iv?.principiosForenses;       // RAT_PRINCIPIOS_FORENSES
  const fotos    = iv?.fotos ?? [];               // RAT_FOTO[]

  return {
    // Datos principales
    uuid            : raw.uuid,
    numero_siniestro: raw.numero_siniestro,
    fecha_hecho     : formatFecha(raw.fecha_hecho),
    hora_hecho      : raw.hora_hecho ?? "—",
    tipo_hecho      : raw.tipoHecho?.nombre ?? "—",
    estado          : raw.estado,
    estado_label    : ESTADO_LABEL[raw.estado] ?? "—",
    estado_badge    : ESTADO_BADGE[raw.estado] ?? "bg-gray-100 text-gray-700",

    // Ubicación
    lugar: [ubicacion?.calle, ubicacion?.municipio, ubicacion?.estado_republica]
      .filter(Boolean).join(", ") || "—",
    velocidad_limite: ubicacion?.velocidad_maxima_permitida_kmh
      ? `${ubicacion.velocidad_maxima_permitida_kmh} km/h` : "—",

    // Vehículo
    vehiculo_str : vehiculo
      ? [vehiculo.marca, vehiculo.submarca, vehiculo.anio_modelo].filter(Boolean).join(" ")
      : "—",
    vin    : vehiculo?.vin ?? "—",
    placas : iv?.numero_placas ?? "—",
    color  : iv?.color?.nombre ?? "—",

    // Cálculos
    velocidad_preimpacto: calculo?.velocidad_pre_impacto_kmh
      ? `${calculo.velocidad_pre_impacto_kmh} km/h` : "—",
    velocidad_impacto: calculo?.velocidad_impacto_kmh
      ? `${calculo.velocidad_impacto_kmh} km/h` : "—",
    exceso: calculo?.exceso_velocidad === 1
      ? `+${calculo.delta_exceso_kmh ?? "?"} km/h` : "Sin exceso",
    delta_v: calculo?.delta_exceso_kmh ? `${calculo.delta_exceso_kmh} km/h` : "—",
    hay_exceso: calculo?.exceso_velocidad === 1,

    // Narrativa
    narracion        : narrativa?.narracion_hechos ?? "Sin narrativa registrada.",
    objeto_involucrado: narrativa?.objeto_involucrado ?? "—",

    // Principios forenses
    principio_intercambio: principios?.principio_intercambio_materiales ?? "—",
    principio_correspondencia: principios?.principio_correspondencia ?? "—",

    // Fotos
    fotos,

    // Reporte
    reporte_uuid: reporte?.uuid,

    // Raw por si alguna tab necesita más datos
    raw,
  };
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function TabResumen({ exp }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">
          Datos del Incidente
        </div>
        <Row label="No. Expediente" val={exp.numero_siniestro} />
        <Row label="Fecha"          val={exp.fecha_hecho} />
        <Row label="Hora"           val={exp.hora_hecho} />
        <Row label="Tipo de hecho"  val={exp.tipo_hecho} />
        <Row label="Estado"         val={exp.estado_label} />
        <Row label="Lugar"          val={exp.lugar} />
      </div>
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">
          Vehículo
        </div>
        <Row label="Vehículo"  val={exp.vehiculo_str} />
        <Row label="VIN"       val={exp.vin} />
        <Row label="Placas"    val={exp.placas} />
        <Row label="Color"     val={exp.color} />
        <Row label="Vel. límite" val={exp.velocidad_limite} />
        <Row label="Objeto involucrado" val={exp.objeto_involucrado} />
      </div>
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">
          Resultados
        </div>
        <Row label="Vel. pre-impacto"  val={exp.velocidad_preimpacto} />
        <Row label="Vel. impacto"      val={exp.velocidad_impacto} />
        <Row label="Exceso"            val={exp.exceso} highlight={exp.hay_exceso} />
        <Row label="Δv (delta)"        val={exp.delta_v} />

        {exp.hay_exceso && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500 shrink-0" />
            <span className="text-xs text-red-700">Exceso de velocidad confirmado</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TabVehiculo({ exp }) {
  const iv  = exp.raw.vehiculos?.[0];
  const veh = iv?.vehiculo;
  if (!veh) {
    return <div className="text-xs text-gray-400 py-6 text-center">Sin vehículo registrado (completa el Paso 2 del wizard).</div>;
  }
  return (
    <div className="grid grid-cols-3 gap-x-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">Identificación</div>
        <Row label="Marca"       val={veh.marca} />
        <Row label="Submarca"    val={veh.submarca} />
        <Row label="Año modelo"  val={veh.anio_modelo} />
        <Row label="VIN"         val={veh.vin} />
        <Row label="Placas"      val={iv.numero_placas} />
        <Row label="Color"       val={iv.color?.nombre} />
      </div>
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">Dimensiones</div>
        <Row label="Peso tara (kg)"  val={veh.peso_tara_kg} />
        <Row label="MMA (kg)"        val={veh.masa_maxima_autorizada_kg} />
        <Row label="Ancho (mm)"      val={veh.ancho_mm} />
        <Row label="Largo (mm)"      val={veh.largo_mm} />
        <Row label="Alto (mm)"       val={veh.alto_mm} />
        <Row label="Batalla (mm)"    val={veh.batalla_mm} />
      </div>
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">Estado</div>
        <Row label="Estado neumático" val={iv.estadoNeumatico?.nombre} />
        <Row label="Rol en siniestro" val={iv.rol} />
        <Row label="Tipo vehículo"    val={veh.tipo_vehiculo} />
      </div>
    </div>
  );
}

function TabEvidencia({ exp }) {
  const fotos = exp.fotos;
  return (
    <div>
      <div className="text-xs text-gray-600 mb-3">
        {fotos.length} foto(s) registrada(s)
      </div>
      {fotos.length === 0 ? (
        <div className="text-xs text-gray-400 text-center py-8">
          Sin evidencias fotográficas registradas (completa el Paso 5 del wizard).
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-3">
          {fotos.map((foto, i) => (
            <div key={foto.id ?? i} className="flex flex-col gap-1">
              <div className="aspect-square bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                {foto.url
                  ? <img src={foto.url} alt={foto.descripcion ?? ""} className="w-full h-full object-cover" />
                  : <Camera size={20} className="text-gray-300" />}
              </div>
              <span className="text-[10px] text-gray-500 truncate">{foto.tipoFoto?.nombre ?? `Foto ${i + 1}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabDeformacion({ exp }) {
  const dm = exp.raw.vehiculos?.[0]?.deformacionMedicion;
  if (!dm) {
    return <div className="text-xs text-gray-400 text-center py-8">Sin mediciones de deformación registradas.</div>;
  }
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">Parámetros</div>
        <Row label="Tipo de golpe"    val={dm.tipoGolpe?.nombre} />
        <Row label="Línea referencia" val={dm.linea_referencia_mm ? `${dm.linea_referencia_mm} mm` : null} />
        <Row label="Ancho contacto L" val={dm.l_ancho_contacto_m ? `${dm.l_ancho_contacto_m} m` : null} />
        <Row label="Ángulo FPI"       val={dm.angulo_fpi_grados ? `${dm.angulo_fpi_grados}°` : null} />
      </div>
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">Mediciones C (m)</div>
        {["c1_m","c2_m","c3_m","c4_m","c5_m","c6_m"].map((k, i) =>
          dm[k] != null ? <Row key={k} label={`C${i+1}`} val={`${dm[k]} m`} /> : null
        )}
      </div>
    </div>
  );
}

function TabCalculos({ exp }) {
  const cal = exp.raw.vehiculos?.[0]?.calculoVelocidad;
  if (!cal) {
    return <div className="text-xs text-gray-400 text-center py-8">Sin cálculos de velocidad registrados.</div>;
  }
  const rows = [
    ["Coef. A (N/m)",          cal.a_rigidez_n_m],
    ["Coef. B (N/m²)",         cal.b_rigidez_n_m2],
    ["Dmed (m)",               cal.dmed_m],
    ["E deformación (J)",      cal.e_deformacion_julios],
    ["E corregida (J)",        cal.e_def_corregida_julios],
    ["EBS (m/s)",              cal.ebs_m_s],
    ["Vel. impacto (km/h)",    cal.velocidad_impacto_kmh],
    ["Vel. pre-impacto (km/h)",cal.velocidad_pre_impacto_kmh],
    ["Vel. final (km/h)",      cal.velocidad_final_kmh],
    ["Vel. Limpert (km/h)",    cal.velocidad_limpert_kmh],
    ["Exceso (km/h)",          cal.delta_exceso_kmh],
    ["Margen error (km/h)",    cal.margen_error_kmh],
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        {rows.slice(0, 6).map(([l, v]) => <Row key={l} label={l} val={v} />)}
      </div>
      <div>
        {rows.slice(6).map(([l, v]) => <Row key={l} label={l} val={v} />)}
        {cal.exceso_velocidad === 1 && (
          <div className="mt-3 p-3 border rounded" style={{ borderColor: "#00ADCF", backgroundColor: "#E0F7FA" }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-red-600 font-semibold text-sm">EXCESO DETECTADO</span>
              <span className="text-xs text-red-500">+{cal.delta_exceso_kmh} km/h</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabNarrativa({ exp }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">Narrativa Técnica del Hecho</div>
        <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-700 leading-6">
          {exp.narracion}
        </div>
      </div>
      {(exp.principio_intercambio !== "—" || exp.principio_correspondencia !== "—") && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Principio de Intercambio de Materiales</div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700 leading-5">
              {exp.principio_intercambio}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-1">Principio de Correspondencia</div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700 leading-5">
              {exp.principio_correspondencia}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabReporte({ exp }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-xs">
          <CheckCircle size={14} /> Expediente cargado correctamente
        </div>
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:border-[#00ADCF]">
            <Download size={13} /> Generar PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs" style={{ backgroundColor: "#00ADCF" }}>
            <Send size={13} /> Enviar a revisión
          </button>
        </div>
      </div>
      <div className="border border-gray-300 rounded bg-white h-80 flex items-center justify-center text-xs text-gray-400">
        Vista previa del reporte pericial – {exp.numero_siniestro}.pdf
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function DetalleExpediente() {
  const { id: uuid } = useParams(); // la ruta es /expedientes/:id pero el valor es un uuid
  const navigate = useNavigate();
  const [tab, setTab] = useState("resumen");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expediente, setExpediente] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getSiniestroById(uuid);
        if (!active) return;
        setExpediente(normalizeExp(response?.data || response));
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || err?.message || "No se pudo cargar el expediente");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [uuid]);

  const content = useMemo(() => {
    if (!expediente) return null;
    switch (tab) {
      case "resumen":     return <TabResumen     exp={expediente} />;
      case "vehiculo":    return <TabVehiculo    exp={expediente} />;
      case "evidencia":   return <TabEvidencia   exp={expediente} />;
      case "deformacion": return <TabDeformacion exp={expediente} />;
      case "calculos":    return <TabCalculos    exp={expediente} />;
      case "narrativa":   return <TabNarrativa   exp={expediente} />;
      case "reporte":     return <TabReporte     exp={expediente} />;
      default: return null;
    }
  }, [expediente, tab]);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/expedientes")}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:border-[#00ADCF]"
        >
          <ArrowLeft size={13} /> Volver
        </button>
        <div>
          <div className="text-sm text-gray-800">Detalle de expediente</div>
          <div className="text-xs text-gray-400">{uuid}</div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded shadow-sm p-8 text-center text-sm text-gray-500">
          Cargando expediente...
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded shadow-sm p-8 text-center text-sm text-red-600">
          {error}
        </div>
      ) : expediente ? (
        <>
          {/* Header del expediente */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="text-base font-medium text-gray-800">{expediente.numero_siniestro}</div>
              <div className="text-xs text-gray-500 mt-1">
                {expediente.tipo_hecho} · {expediente.fecha_hecho}
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${expediente.estado_badge}`}>
              {expediente.estado_label}
            </span>
          </div>

          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded shadow-sm">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`px-4 py-2.5 text-xs border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    tab === item.id
                      ? "border-[#00ADCF] text-[#00ADCF]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
            <div className="p-4">{content}</div>
          </div>
        </>
      ) : null}
    </div>
  );
}
