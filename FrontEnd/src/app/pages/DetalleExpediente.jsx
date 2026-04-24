import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Download,
  Send,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  Camera,
  Ruler,
  Calculator,
  BookOpen,
} from "lucide-react";

const TABS = [
  { id: "resumen", label: "Resumen", icon: <FileText size={14} /> },
  { id: "vehiculo", label: "Vehículo", icon: <User size={14} /> },
  { id: "evidencia", label: "Evidencia", icon: <Camera size={14} /> },
  { id: "deformacion", label: "Deformación", icon: <Ruler size={14} /> },
  { id: "calculos", label: "Cálculos", icon: <Calculator size={14} /> },
  { id: "narrativa", label: "Narrativa", icon: <BookOpen size={14} /> },
  { id: "reporte", label: "Reporte", icon: <FileText size={14} /> },
];

function Row({ label, val, highlight }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-red-600" : "text-gray-700"}`}>{val}</span>
    </div>
  );
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
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">Datos del Vehículo</div>
        <Row label="Vehículo" val={exp.vehiculo} />
        <Row label="VIN" val={exp.vin} />
        <Row label="Placas" val={exp.placas} />
        <Row label="Color" val={exp.color} />
        <Row label="Masa total" val="1,360 kg" />
        <Row label="Ocupantes" val="1 conductor" />
      </div>
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">Resultados de Velocidad</div>
        <Row label="Vel. pre-impacto" val={exp.velocidad} />
        <Row label="Límite permitido" val={exp.limite} />
        <Row label="Exceso" val={exp.exceso} highlight />
        <Row label="Δv (delta)" val={exp.delta} />
        <Row label="EBS" val="53.6 km/h" />
        <Row label="Verificación Limpert" val="84.3 km/h" />
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500" />
          <span className="text-xs text-red-700">Exceso de velocidad confirmado</span>
        </div>
      </div>
    </div>
  );
}

function TabVehiculo({ exp }) {
  const fields = [
    ["Marca", "Toyota"], ["Modelo", "Corolla"], ["Año", "2019"],
    ["Color", "Blanco"], ["Placas", exp.placas], ["VIN", exp.vin],
    ["Peso Tara", "1,285 kg"], ["MMA", "1,750 kg"], ["Ancho", "1,780 mm"],
    ["Largo", "4,630 mm"], ["Alto", "1,430 mm"], ["Batalla", "2,700 mm"],
    ["Voladizo anterior", "890 mm"], ["Voladizo posterior", "1,040 mm"],
    ["Entrevía delantera", "1,520 mm"], ["Entrevía trasera", "1,510 mm"],
  ];

  return (
    <div className="grid grid-cols-4 gap-x-6 gap-y-2">
      {fields.map(([l, v]) => <Row key={l} label={l} val={v} />)}
    </div>
  );
}

function TabEvidencia() {
  const cats = ["Frontal", "Lateral Derecho", "Lateral Izquierdo", "Posterior", "Partes Bajas", "Habitáculo", "Lugar de Hechos", "Objeto Involucrado"];
  const counts = [3, 4, 3, 2, 1, 2, 5, 2];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cats.map((cat, i) => (
        <div key={cat} className="border border-gray-200 rounded p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">{cat}</span>
            <span className="text-xs bg-[#E0F7FA] text-[#00ADCF] px-1.5 rounded-full">{counts[i]}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: Math.min(counts[i], 3) }).map((_, j) => (
              <div key={j} className="aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-300">
                <Camera size={14} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TabDeformacion() {
  const mediciones = [
    { label: "C1", val: "285.0 mm" }, { label: "C2", val: "320.5 mm" },
    { label: "C3", val: "344.0 mm" }, { label: "C4", val: "338.0 mm" },
    { label: "C5", val: "305.0 mm" }, { label: "C6", val: "274.5 mm" },
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">Mediciones C1–C6 (Frontal, 6 puntos)</div>
        <div className="grid grid-cols-2 gap-3">
          {mediciones.map((m) => (
            <div key={m.label} className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
              <div className="text-xs text-gray-500">{m.label}</div>
              <div className="text-sm font-semibold text-gray-700">{m.val}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[["Ancho de contacto L", "1,640 mm"], ["Ángulo FPI", "18°"], ["Arqueamiento", "12.0 mm"], ["Dmed", "311.2 mm"]].map(([l, v]) => (
            <div key={l} className="bg-[#E0F7FA] border border-[#00ADCF]/30 rounded px-3 py-2">
              <div className="text-xs text-gray-500">{l}</div>
              <div className="text-sm font-semibold" style={{ color: "#00ADCF" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-500 mb-2">Diagrama de deformación frontal</div>
        <svg width="200" height="140" viewBox="0 0 200 140">
          <rect x="10" y="20" width="180" height="110" rx="8" stroke="#9CA3AF" strokeWidth="2" fill="#F9FAFB" />
          <path d="M10,30 Q30,20 50,25 Q70,15 90,22 Q110,15 130,22 Q150,20 170,25 Q190,30 190,35" stroke="#EF4444" strokeWidth="2.5" fill="none" />
          {[285, 320.5, 344, 338, 305, 274.5].map((v, i) => {
            const x = 20 + i * 32;
            const h = (v / 380) * 80;
            return (
              <g key={i}>
                <rect x={x - 8} y={30} width={16} height={h} fill="#FCA5A5" opacity="0.6" />
                <circle cx={x} cy={30 + h} r={4} fill="#EF4444" />
                <text x={x} y={135} textAnchor="middle" fontSize="9" fill="#374151">C{i + 1}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function TabCalculos() {
  const resultados = [
    ["Energía de deformación Ed", "48.72 kJ"],
    ["Energía corregida (ángulo 18°)", "46.30 kJ"],
    ["EBS", "53.6 km/h"],
    ["Velocidad de impacto Vi", "76.4 km/h"],
    ["Velocidad pre-impacto Vpre", "87.1 km/h"],
    ["Velocidad final post-impacto", "12.0 km/h"],
    ["Δv (delta)", "75.1 km/h"],
    ["Verificación Limpert", "84.3 km/h"],
    ["Límite permitido", "80.0 km/h"],
    ["Exceso de velocidad", "+7.1 km/h"],
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">Parámetros McHenry</div>
        {[["Categoría", "NASS-2"], ["Coeficiente A", "33.58 N/m"], ["Coeficiente B", "6.84 N/m²"], ["Dmed", "311.2 mm"], ["μ corregido", "0.71"], ["Tiempo reacción", "0.75 s"], ["Distancia frenado", "18.5 m"]].map(([l, v]) => (
          <Row key={l} label={l} val={v} />
        ))}
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

function TabNarrativa() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">Datos de la Dinámica</div>
        <div className="grid grid-cols-3 gap-3">
          {[["Objeto involucrado", "Barra contención Jersey"], ["Posición final", "Carril derecho, orientación N-S"], ["Dirección circulación", "Norte"], ["Distancia PPR al PC", "28.3 m"], ["Tiempo reacción", "0.75 s"], ["Huellas de derrape", "18.5 m"]].map(([l, v]) => (
            <div key={l} className="bg-gray-50 border border-gray-100 rounded px-3 py-2">
              <div className="text-xs text-gray-400">{l}</div>
              <div className="text-xs text-gray-700 font-medium">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">Narrativa Técnica del Hecho</div>
        <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-700 leading-6">
          Con base en el análisis de las evidencias fotográficas, mediciones de deformación y cálculos realizados conforme a la metodología McHenry, se determina que el vehículo Toyota Corolla con placas ABD-123-4 circulaba en dirección norte por la Autopista México-Querétaro a una velocidad estimada de 87.1 km/h, superior al límite permitido de 80 km/h, cuando colisionó frontalmente contra la barra de contención metálica tipo Jersey. Las huellas de frenado de 18.5 m indican maniobra de emergencia previa al impacto.
        </div>
      </div>
    </div>
  );
}

function TabReporte() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-xs">
          <CheckCircle size={14} /> Conclusiones validadas por perito responsable
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
        Vista previa del reporte pericial – RAT-2026-024.pdf
      </div>
    </div>
  );
}

export default function DetalleExpediente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("resumen");

  const expediente = {
    id: id || "RAT-2026-024",
    fecha: "08/03/2026",
    hora: "14:30",
    tipo: "Colisión frontal",
    estado: "Abierto",
    perito: "Ing. Carlos Méndez",
    vehiculo: "Toyota Corolla 2019",
    vin: "3VWFE21C04M000001",
    placas: "ABD-123-4",
    color: "Blanco",
    velocidad: "87.1 km/h",
    limite: "80 km/h",
    exceso: "+7.1 km/h",
    delta: "75.1 km/h",
    lugar: "Autopista México-Querétaro, Km 14+500, Tepotzotlán, Estado de México",
    mu: "0.71",
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded shadow-sm p-3 flex items-center gap-3">
        <button onClick={() => navigate("/expedientes")} className="p-1.5 rounded border border-gray-300 text-gray-600 hover:border-[#00ADCF] hover:text-[#00ADCF]">
          <ArrowLeft size={15} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-800">{expediente.id}</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{expediente.estado}</span>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle size={11} /> Exceso de velocidad
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {expediente.tipo} · {expediente.fecha} {expediente.hora} · {expediente.perito}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:border-[#00ADCF]">
            <Edit2 size={13} /> Editar
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:border-[#00ADCF]">
            <Download size={13} /> PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs" style={{ backgroundColor: "#00ADCF" }}>
            <Send size={13} /> Enviar a revisión
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs border-b-2 transition-colors ${
                tab === t.id ? "border-[#00ADCF] text-[#00ADCF]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === "resumen" && <TabResumen exp={expediente} />}
          {tab === "vehiculo" && <TabVehiculo exp={expediente} />}
          {tab === "evidencia" && <TabEvidencia />}
          {tab === "deformacion" && <TabDeformacion />}
          {tab === "calculos" && <TabCalculos />}
          {tab === "narrativa" && <TabNarrativa />}
          {tab === "reporte" && <TabReporte />}
        </div>
      </div>
    </div>
  );
}
