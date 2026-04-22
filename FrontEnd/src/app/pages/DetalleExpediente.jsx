import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Send, CheckCircle, AlertTriangle, FileText, User, Camera, Ruler, Calculator, BookOpen, RefreshCw } from "lucide-react";
import { getSiniestroById } from "../../services/siniestroService";

const TABS = [
  { id: "resumen", label: "Resumen", icon: <FileText size={14} /> },
  { id: "vehiculo", label: "Vehículo", icon: <User size={14} /> },
  { id: "evidencia", label: "Evidencia", icon: <Camera size={14} /> },
  { id: "deformacion", label: "Deformación", icon: <Ruler size={14} /> },
  { id: "calculos", label: "Cálculos", icon: <Calculator size={14} /> },
  { id: "narrativa", label: "Narrativa", icon: <BookOpen size={14} /> },
  { id: "reporte", label: "Reporte", icon: <FileText size={14} /> },
];

function Row({ label, val, highlight, isStatus }) {
  const isEnEspera = val === null || val === undefined || val === "En espera";
  const displayVal = isEnEspera ? "En espera" : val;
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
      <span className="text-xs text-gray-500">{label}</span>
      {isEnEspera ? (
        <span className="text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded text-xs">En espera</span>
      ) : (
        <span className={`text-xs font-medium ${highlight ? "text-red-600" : "text-gray-700"}`}>{displayVal}</span>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-MX");
}

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function normalizeExp(raw) {
  if (!raw) return null;
  return {
    id: raw.numero_siniestro || `SIN-${raw.id}`,
    fecha: formatDate(raw.fecha_hora_siniestro),
    hora: formatTime(raw.fecha_hora_siniestro),
    tipo: raw.tipo_accidente,
    estado: (raw.estado || "sin_estado").replaceAll("_", " "),
    perito: raw.perito_nombre,
    lugar: [raw.ubicacion_calle, raw.ubicacion_ciudad, raw.ubicacion_estado].filter(Boolean).join(", "),
    vehiculo: raw.numero_siniestro || `Vehículo asociado a ${raw.numero_siniestro || raw.id}`,
    vin: raw.vin || "No disponible",
    placas: raw.placas || "No disponible",
    color: raw.color || "No disponible",
    velocidad: raw.velocidad_preimpacto ? `${raw.velocidad_preimpacto} km/h` : null,
    limite: raw.limite_velocidad ? `${raw.limite_velocidad} km/h` : null,
    exceso: raw.exceso_velocidad !== null && raw.exceso_velocidad !== undefined ? `${raw.exceso_velocidad} km/h` : null,
    delta: raw.delta_v ? `${raw.delta_v} km/h` : null,
    descripcion: raw.descripcion_detallada || "Sin descripción detallada",
    perito_email: raw.perito_email || "—",
    perito_cedula: raw.perito_cedula || "—",
    entorno: raw.cat_entorno?.nombre || "—",
    evidencias: raw.evidencia_fotos || raw.evidenciaFotos || [],
    raw,
  };
}

function TabResumen({ exp }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">Datos del Incidente</div>
        <Row label="No. Expediente" val={exp.id} />
        <Row label="Fecha" val={exp.fecha} />
        <Row label="Hora" val={exp.hora} />
        <Row label="Tipo" val={exp.tipo} />
        <Row label="Estado" val={exp.estado} />
        <Row label="Perito" val={exp.perito} />
        <Row label="Lugar" val={exp.lugar} />
      </div>
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">Datos técnicos</div>
        <Row label="Entorno" val={exp.entorno} />
        <Row label="Email perito" val={exp.perito_email} />
        <Row label="Cédula" val={exp.perito_cedula} />
        <Row label="VIN" val={exp.vin} />
        <Row label="Placas" val={exp.placas} />
        <Row label="Color" val={exp.color} />
      </div>
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">Resultados</div>
        <Row label="Vel. pre-impacto" val={exp.velocidad} isStatus />
        <Row label="Límite permitido" val={exp.limite} isStatus />
        <Row label="Exceso" val={exp.exceso} highlight={exp.exceso !== null} isStatus />
        <Row label="Δv (delta)" val={exp.delta} isStatus />
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500" />
          <span className="text-xs text-red-700">La vista conserva UI vieja y muestra datos reales disponibles</span>
        </div>
      </div>
    </div>
  );
}

function TabVehiculo({ exp }) {
  const fields = [
    ["Expediente", exp.id],
    ["Tipo de accidente", exp.tipo],
    ["VIN", exp.vin],
    ["Placas", exp.placas],
    ["Color", exp.color],
    ["Ciudad", exp.raw.ubicacion_ciudad],
    ["Estado", exp.raw.ubicacion_estado],
    ["CP", exp.raw.ubicacion_cp],
  ];

  return (
    <div className="grid grid-cols-4 gap-x-6 gap-y-2">
      {fields.map(([l, v]) => (
        <Row key={l} label={l} val={v} />
      ))}
    </div>
  );
}

function TabEvidencia({ exp }) {
  const items = exp.evidencias;
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="border border-gray-200 rounded p-3 col-span-4">
        <div className="text-xs text-gray-600 mb-2">Evidencias registradas</div>
        {!items.length ? (
          <div className="text-xs text-gray-500">No hay evidencias asociadas.</div>
        ) : (
          <div className="grid grid-cols-6 gap-2">
            {items.map((item, index) => (
              <div
                key={item.id || index}
                className="aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-300 border border-gray-200"
              >
                <Camera size={14} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabPlaceholder({ title, description }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-600">
      <div className="font-medium text-gray-700 mb-2">{title}</div>
      <div>{description}</div>
    </div>
  );
}

function TabNarrativa({ exp }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">Narrativa Técnica del Hecho</div>
        <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-700 leading-6">
          {exp.descripcion}
        </div>
      </div>
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
            <Download size={13} /> Generar Word
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs" style={{ backgroundColor: "#00ADCF" }}>
            <Send size={13} /> Enviar a revisión
          </button>
        </div>
      </div>
      <div className="border border-gray-300 rounded bg-white h-80 flex flex-col items-center justify-center text-xs text-gray-400 gap-2">
        <FileText size={32} className="text-[#00ADCF] mb-2" />
        Vista previa del dictamen en Word (.docx)
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200 mt-2">Documento editable habilitado</span>
      </div>
    </div>
  );
}

export default function DetalleExpediente() {
  const { id } = useParams();
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
        const response = await getSiniestroById(id);
        if (!active) return;
        setExpediente(normalizeExp(response?.data || response));
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || err?.message || "No se pudo cargar el expediente");
      } finally {
        if (active) setLoading(false);
      }
    }
    
    loadData();
    return () => {
      active = false;
    };
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getSiniestroById(id);
      setExpediente(normalizeExp(response?.data || response));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudo cargar el expediente");
    } finally {
      setLoading(false);
    }
  };

  const content = useMemo(() => {
    if (!expediente) return null;
    switch (tab) {
      case "resumen":
        return <TabResumen exp={expediente} />;
      case "vehiculo":
        return <TabVehiculo exp={expediente} />;
      case "evidencia":
        return <TabEvidencia exp={expediente} />;
      case "deformacion":
        return (
          <TabPlaceholder
            title="Deformación"
            description="Conserva el espacio visual viejo. Aquí puedes conectar después las mediciones reales cuando el backend las exponga."
          />
        );
      case "calculos":
        return (
          <TabPlaceholder
            title="Cálculos"
            description="Conserva la pestaña vieja. Hoy muestra el expediente real y queda lista para colgar los cálculos periciales nuevos."
          />
        );
      case "narrativa":
        return <TabNarrativa exp={expediente} />;
      case "reporte":
        return <TabReporte exp={expediente} />;
      default:
        return null;
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
          <div className="text-xs text-gray-500">Vista híbrida: UI vieja + datos reales nuevos</div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded shadow-sm p-12 flex flex-col items-center justify-center gap-3">
          <RefreshCw size={24} className="text-[#00ADCF] animate-spin" />
          <span className="text-gray-500 text-sm">Cargando expediente...</span>
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded shadow-sm p-8 flex flex-col items-center justify-center gap-3">
          <AlertTriangle size={32} className="text-red-400" />
          <span className="text-red-500 text-sm">{error}</span>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-[#00ADCF] text-white rounded hover:bg-[#0095B3] mt-2 text-sm">
            <RefreshCw size={16} /> Reintentar
          </button>
        </div>
      ) : expediente ? (
        <>
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="text-base text-gray-800">{expediente.id}</div>
              <div className="text-xs text-gray-500 mt-1">
                {expediente.tipo} · {expediente.fecha} · {expediente.estado}
              </div>
            </div>
            <div className="text-xs text-gray-500">Perito: {expediente.perito || "—"}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`px-4 py-2.5 text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
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