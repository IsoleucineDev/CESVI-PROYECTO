import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  AlertCircle,
  RefreshCw,
  FileText,
  Zap,
} from "lucide-react";

const STEPS = [
  { id: 0, label: "Incidente" },
  { id: 1, label: "Vehículo" },
  { id: 2, label: "Ocupantes" },
  { id: 3, label: "Vía" },
  { id: 4, label: "Evidencia" },
  { id: 5, label: "Deformación" },
  { id: 6, label: "Cálculo" },
  { id: 7, label: "Narrativa" },
  { id: 8, label: "Reporte" },
];

function Field({ label, req, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">
        {label} {req && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inp =
  "w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]";
const sel =
  "w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white";
const autoInp =
  "w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-gray-50 text-gray-500 cursor-not-allowed";

function StepIncidente() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Número de Siniestro" req>
        <input className={inp} placeholder="RAT-2026-025" />
      </Field>
      <Field label="Perito Responsable" req>
        <select className={sel}>
          <option>Seleccionar...</option>
          <option>Ing. Carlos Méndez</option>
          <option>Ing. Roberto García</option>
          <option>Ing. Miguel López</option>
          <option>Ing. Jorge Torres</option>
        </select>
      </Field>
      <Field label="Fecha del Hecho" req>
        <input type="date" className={inp} />
      </Field>
      <Field label="Hora del Hecho" req>
        <input type="time" className={inp} />
      </Field>
      <Field label="Tipo de Hecho" req>
        <select className={sel}>
          <option>Seleccionar...</option>
          <option>Colisión frontal</option>
          <option>Colisión lateral</option>
          <option>Colisión trasera</option>
          <option>Volcadura</option>
          <option>Atropellamiento</option>
          <option>Salida de camino</option>
        </select>
      </Field>
      <Field label="Estado del Análisis">
        <select className={sel}>
          <option>Abierto</option>
          <option>En revisión</option>
          <option>Finalizado</option>
        </select>
      </Field>
      <div className="col-span-2">
        <Field label="Descripción Breve del Hecho" req>
          <textarea className={`${inp} h-20 resize-none`} placeholder="Descripción general del siniestro vial..." />
        </Field>
      </div>
      <div className="col-span-2">
        <Field label="Observaciones Iniciales">
          <textarea className={`${inp} h-16 resize-none`} placeholder="Observaciones preliminares del perito..." />
        </Field>
      </div>
    </div>
  );
}

function StepVehiculo() {
  const [autoFilled, setAutoFilled] = useState(false);

  return (
    <div>
      <div className="mb-4 p-3 bg-[#E0F7FA] border border-[#00ADCF]/30 rounded flex items-center gap-3">
        <div className="flex-1">
          <Field label="VIN / Número de Serie" req>
            <input className={inp} placeholder="3VWFE21C04M000001" />
          </Field>
        </div>
        <button
          onClick={() => setAutoFilled(true)}
          className="mt-5 flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs whitespace-nowrap"
          style={{ backgroundColor: "#00ADCF" }}
        >
          <Zap size={13} /> Autocompletar specs
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Marca" req>
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "Volkswagen" : ""} placeholder="Marca" />
        </Field>
        <Field label="Modelo" req>
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "Jetta" : ""} placeholder="Modelo" />
        </Field>
        <Field label="Año" req>
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "2020" : ""} placeholder="Año" />
        </Field>
        <Field label="Color">
          <input className={inp} placeholder="Blanco" />
        </Field>
        <Field label="Placas" req>
          <input className={inp} placeholder="ABC-123-4" />
        </Field>
        <Field label="Peso Tara (kg)" req>
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "1.285" : ""} placeholder="kg" />
        </Field>
        <Field label="MMA (kg)">
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "1.750" : ""} placeholder="kg" />
        </Field>
        <Field label="Ancho (mm)">
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "1.799" : ""} placeholder="mm" />
        </Field>
        <Field label="Largo (mm)">
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "4.644" : ""} placeholder="mm" />
        </Field>
        <Field label="Alto (mm)">
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "1.474" : ""} placeholder="mm" />
        </Field>
        <Field label="Batalla (mm)">
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "2.683" : ""} placeholder="mm" />
        </Field>
        <Field label="Voladizo Anterior (mm)">
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "892" : ""} placeholder="mm" />
        </Field>
        <Field label="Voladizo Posterior (mm)">
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "1.069" : ""} placeholder="mm" />
        </Field>
        <Field label="Entrevía Delantera (mm)">
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "1.548" : ""} placeholder="mm" />
        </Field>
        <Field label="Entrevía Trasera (mm)">
          <input className={autoFilled ? autoInp : inp} readOnly={autoFilled} defaultValue={autoFilled ? "1.522" : ""} placeholder="mm" />
        </Field>
        <Field label="Redondez de Vértices (mm)">
          <input className={inp} placeholder="mm" />
        </Field>
      </div>

      {autoFilled && (
        <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          <Check size={13} /> Especificaciones autocompletadas desde base de datos de vehículos. Verificar con documentación física.
        </div>
      )}
    </div>
  );
}

function StepOcupantes() {
  const [numOcupantes, setNumOcupantes] = useState("1");
  const [pesoCond, setPesoCond] = useState("75");
  const [pesoPasaj, setPesoPasaj] = useState("0");
  const [pesoCarga, setPesoCarga] = useState("0");

  const taraTon = 1285;
  const masaTotal = taraTon + parseInt(pesoCond || "0") + parseInt(pesoPasaj || "0") + parseInt(pesoCarga || "0");

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-4">
        <Field label="Número de Ocupantes" req>
          <input type="number" min="1" max="9" className={inp} value={numOcupantes} onChange={(e) => setNumOcupantes(e.target.value)} />
        </Field>
        <Field label="Peso del Conductor (kg)" req>
          <input type="number" className={inp} value={pesoCond} onChange={(e) => setPesoCond(e.target.value)} />
        </Field>
        <Field label="Peso Total de Pasajeros (kg)">
          <input type="number" className={inp} value={pesoPasaj} onChange={(e) => setPesoPasaj(e.target.value)} />
        </Field>
        <Field label="Peso de Equipaje / Carga (kg)">
          <input type="number" className={inp} value={pesoCarga} onChange={(e) => setPesoCarga(e.target.value)} />
        </Field>
        <Field label="Notas adicionales">
          <textarea className={`${inp} h-16 resize-none`} placeholder="Condición de los ocupantes, lesiones previas conocidas..." />
        </Field>
      </div>

      <div>
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">Resumen de masas</div>
          <div className="flex flex-col gap-2">
            {[
              { label: "Peso tara vehículo (kg)", val: taraTon.toLocaleString() },
              { label: "Conductor (kg)", val: pesoCond || "0" },
              { label: "Pasajeros (kg)", val: pesoPasaj || "0" },
              { label: "Carga/Equipaje (kg)", val: pesoCarga || "0" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-gray-500">{r.label}</span>
                <span className="text-gray-700 font-medium">{r.val}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-300 flex justify-between items-center">
            <span className="text-xs text-gray-700">Masa total al momento del accidente</span>
            <span className="text-base font-semibold" style={{ color: "#00ADCF" }}>
              {masaTotal.toLocaleString()} kg
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">* Calculado automáticamente a partir de los datos ingresados.</p>
        </div>
      </div>
    </div>
  );
}

function StepVia() {
  const [loadingIA, setLoadingIA] = useState(false);
  const [mensajeIA, setMensajeIA] = useState("");

  const autocompletarViaIA = () => {
    setLoadingIA(true);
    setMensajeIA("Generando sugerencias...");

    setTimeout(() => {
      setLoadingIA(false);
      setMensajeIA("Datos sugeridos cargados");
    }, 1500);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-gray-600">Datos de la vía</div>
        <button
          onClick={autocompletarViaIA}
          disabled={loadingIA}
          className="flex items-center gap-1 px-3 py-1 text-xs border border-gray-300 rounded hover:border-[#00ADCF]"
        >
          {loadingIA ? "Generando..." : "Autocompletar con IA"}
        </button>
      </div>

      {mensajeIA && <div className="text-xs text-gray-500 mb-3">{mensajeIA}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Field label="Descripción del Lugar" req>
            <textarea
              className={`${inp} h-16 resize-none`}
              placeholder="Descripción física del lugar del hecho..."
              defaultValue={mensajeIA ? "Vía urbana con flujo medio y buena visibilidad." : ""}
            />
          </Field>
        </div>

        <Field label="Km / Punto de Referencia">
          <input className={inp} placeholder="Km 14+500 Autopista México-Querétaro" defaultValue={mensajeIA ? "Km 14+500" : ""} />
        </Field>

        <Field label="Municipio / Estado" req>
          <input className={inp} placeholder="Tepotzotlán, Estado de México" defaultValue={mensajeIA ? "Toluca, Estado de México" : ""} />
        </Field>

        <Field label="Coordenadas GPS (lat,lon)">
          <input className={inp} placeholder="19.7231, -99.2189" defaultValue={mensajeIA ? "19.2826, -99.6557" : ""} />
        </Field>

        <Field label="Velocidad Máxima Permitida (km/h)" req>
          <input type="number" className={inp} placeholder="80" defaultValue={mensajeIA ? "60" : ""} />
        </Field>

        <Field label="Tipo de Vía" req>
          <select className={sel}>
            <option>Seleccionar...</option>
            <option>Autopista</option>
            <option>Avenida</option>
          </select>
        </Field>

        <Field label="Tipo de Trazo">
          <select className={sel}>
            <option>Seleccionar...</option>
            <option>Recto</option>
            <option>Curva</option>
          </select>
        </Field>

        <Field label="Condición de Superficie" req>
          <select className={sel}>
            <option>Seleccionar...</option>
            <option>Seca</option>
            <option>Húmeda</option>
          </select>
        </Field>

        <Field label="Tipo de Pavimento">
          <select className={sel}>
            <option>Seleccionar...</option>
            <option>Asfalto</option>
            <option>Concreto</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

const CATEGORIAS_FOTO = [
  "Frontal",
  "Lateral Derecho",
  "Lateral Izquierdo",
  "Posterior",
  "Partes Bajas",
  "Habitáculo",
  "Lugar de Hechos",
  "Objeto Involucrado",
];

function StepEvidencia() {
  const [uploaded, setUploaded] = useState({});
  const [completitud] = useState(3);

  const handleDrop = (cat, e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).map((f) => f.name);
    setUploaded((prev) => ({ ...prev, [cat]: [...(prev[cat] || []), ...files] }));
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${(completitud / CATEGORIAS_FOTO.length) * 100}%`, backgroundColor: "#00ADCF" }}
          />
        </div>
        <span className="text-xs text-gray-500">
          {completitud}/{CATEGORIAS_FOTO.length} categorías con evidencia
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {CATEGORIAS_FOTO.map((cat) => {
          const files = uploaded[cat] || [];
          return (
            <div key={cat}>
              <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                {cat}
                {files.length > 0 && <span className="text-xs bg-green-100 text-green-700 rounded-full px-1.5">{files.length}</span>}
              </div>
              <div
                className="border-2 border-dashed border-gray-300 rounded p-3 text-center hover:border-[#00ADCF] transition-colors cursor-pointer min-h-[80px] flex flex-col items-center justify-center gap-1"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(cat, e)}
                onClick={() => {}}
              >
                <Upload size={16} className="text-gray-400" />
                <span className="text-xs text-gray-400">Arrastrar o clic</span>
              </div>
              {files.map((f, i) => (
                <div
                  key={i}
                  className="mt-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1 flex items-center gap-1"
                >
                  <FileText size={11} />
                  <span className="truncate">{f}</span>
                  <button className="ml-auto text-gray-300 hover:text-red-400">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-start gap-2">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <span>
          Evidencia mínima requerida: Frontal, Lateral Derecho, Lateral Izquierdo, Posterior y Lugar de Hechos. Las imágenes se
          almacenan en el servidor y forman parte del expediente oficial.
        </span>
      </div>
    </div>
  );
}

function StepDeformacion() {
  const [tipoGolpe, setTipoGolpe] = useState("Frontal");
  const [numMed, setNumMed] = useState("6");
  const campos = parseInt(numMed, 10);
  const cLabels = Array.from({ length: campos }, (_, i) => `C${i + 1}`);

  const [valores, setValores] = useState({});
  const [loadingIA, setLoadingIA] = useState(false);
  const [mostrarSelectorIA, setMostrarSelectorIA] = useState(false);
  const [camposSeleccionados, setCamposSeleccionados] = useState([]);

  const toggleCampo = (campo) => {
    setCamposSeleccionados((prev) => (prev.includes(campo) ? prev.filter((c) => c !== campo) : [...prev, campo]));
  };

  const ejecutarIA = () => {
    setLoadingIA(true);
    setTimeout(() => {
      setValores((prev) => {
        const nuevos = { ...prev };
        camposSeleccionados.forEach((campo) => {
          if (!nuevos[campo]) nuevos[campo] = (Math.random() * 50 + 1).toFixed(1);
        });
        return nuevos;
      });
      setLoadingIA(false);
      setMostrarSelectorIA(false);
      setCamposSeleccionados([]);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-3 grid grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded p-3">
        <Field label="Tipo de Golpe" req>
          <select className={sel} value={tipoGolpe} onChange={(e) => setTipoGolpe(e.target.value)}>
            {["Frontal", "Trasero", "Lateral Derecho", "Lateral Izquierdo"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>

        <Field label="Número de Mediciones" req>
          <select className={sel} value={numMed} onChange={(e) => setNumMed(e.target.value)}>
            {["2", "4", "6"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>

        <Field label="Línea de Referencia (mm)">
          <input type="number" className={inp} placeholder="0" />
        </Field>
      </div>

      <div className="col-span-1 bg-gray-50 border border-gray-200 rounded p-3 flex flex-col items-center gap-2">
        <div className="text-xs text-gray-500 mb-1">Diagrama {tipoGolpe}</div>
        <svg width="120" height="160" viewBox="0 0 120 160">
          <rect x="20" y="40" width="80" height="100" rx="8" stroke="#9CA3AF" strokeWidth="2" fill="#F9FAFB" />
        </svg>
        <div className="text-xs text-gray-400 text-center">Puntos de medición activos: {campos}</div>
      </div>

      <div className="col-span-1 flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-gray-200 pb-1">
          <span className="text-xs text-gray-600">Mediciones de deformación</span>
          <button
            onClick={() => setMostrarSelectorIA(true)}
            className="text-xs px-3 py-1 border border-[#00ADCF] text-[#00ADCF] rounded hover:bg-[#00ADCF] hover:text-white transition"
          >
            Usar IA
          </button>
        </div>

        {mostrarSelectorIA && (
          <div className="bg-white border border-gray-200 rounded p-3 flex flex-col gap-2 shadow-sm">
            <div className="text-xs text-gray-600">Selecciona campos:</div>
            {cLabels.map((c) => (
              <label key={c} className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={camposSeleccionados.includes(c)} onChange={() => toggleCampo(c)} />
                {c}
              </label>
            ))}
            <button onClick={ejecutarIA} className="mt-2 text-xs px-3 py-1 bg-[#00ADCF] text-white rounded hover:opacity-90">
              Generar
            </button>
          </div>
        )}

        {loadingIA && <div className="text-xs text-[#00ADCF] animate-pulse">Generando valores...</div>}

        <div className="grid grid-cols-2 gap-3">
          {cLabels.map((c) => (
            <Field key={c} label={`${c} (mm)`} req>
              <input
                type="number"
                className={inp}
                value={valores[c] || ""}
                onChange={(e) => setValores((prev) => ({ ...prev, [c]: e.target.value }))}
                placeholder="0.0"
              />
            </Field>
          ))}
        </div>
      </div>

      <div className="col-span-1 flex flex-col gap-3">
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1">Variables adicionales</div>
        <Field label="Ancho de contacto L (mm)" req>
          <input type="number" className={inp} placeholder="mm" />
        </Field>
        <Field label="Ángulo FPI (°)">
          <input type="number" className={inp} placeholder="0.0" />
        </Field>
        <Field label="Arqueamiento (mm)">
          <input type="number" className={inp} placeholder="0.0" />
        </Field>

        <div className="bg-[#E0F7FA] border border-[#00ADCF]/30 rounded p-2 mt-2">
          <div className="text-xs text-gray-600 mb-1">Dmed calculado:</div>
          <div className="text-sm font-semibold text-[#00ADCF]">—</div>
          <div className="text-xs text-gray-400">Promedio de C1–C{campos}</div>
        </div>
      </div>
    </div>
  );
}

function StepCalculo() {
  const vars = [
    { label: "Categoría McHenry", val: "NASS-2", calc: false },
    { label: "Coeficiente A (N/m)", val: "33.58", calc: false },
    { label: "Coeficiente B (N/m²)", val: "6.84", calc: false },
    { label: "Dmed (mm)", val: "312.0", calc: false },
    { label: "Energía de deformación Ed (kJ)", val: "48.72", calc: true },
    { label: "Energía corregida por ángulo (kJ)", val: "46.30", calc: true },
    { label: "Equivalent Barrier Speed EBS (km/h)", val: "53.6", calc: true },
    { label: "Velocidad de impacto Vi (km/h)", val: "76.4", calc: true },
    { label: "Tiempo reacción frenos (s)", val: "0.75", calc: false },
    { label: "Distancia de frenado pre-impacto (m)", val: "18.5", calc: false },
    { label: "Velocidad pre-impacto (km/h)", val: "87.1", calc: true },
    { label: "Velocidad final post-impacto (km/h)", val: "12.0", calc: false },
    { label: "Límite permitido (km/h)", val: "80.0", calc: false },
    { label: "Exceso de velocidad (km/h)", val: "7.1", calc: true },
    { label: "Δ km/h (delta)", val: "75.1", calc: true },
    { label: "Verificación Limpert (km/h)", val: "84.3", calc: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1 mb-3">Parámetros de entrada</div>
        <div className="flex flex-col gap-2">
          {vars
            .filter((v) => !v.calc)
            .map((v) => (
              <div key={v.label} className="flex items-center gap-2">
                <label className="text-xs text-gray-500 w-48 shrink-0">{v.label}</label>
                <input className={inp} defaultValue={v.val} />
              </div>
            ))}
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
          Resultados calculados
          <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">Automático</span>
        </div>
        <div className="flex flex-col gap-2">
          {vars
            .filter((v) => v.calc)
            .map((v) => (
              <div key={v.label} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-1.5">
                <span className="text-xs text-gray-600">{v.label}</span>
                <span className="text-xs font-semibold" style={{ color: "#00ADCF" }}>
                  {v.val}
                </span>
              </div>
            ))}
        </div>

        <div className="mt-4 p-3 border rounded" style={{ borderColor: "#00ADCF", backgroundColor: "#E0F7FA" }}>
          <div className="text-xs text-gray-600 mb-1">Diagnóstico de velocidad</div>
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-semibold text-sm">EXCESO DETECTADO</span>
            <span className="text-xs text-red-500">+7.1 km/h sobre límite</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Consistente con método Limpert (84.3 km/h). Δv = 75.1 km/h indica colisión de alta energía.
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xs text-gray-600 mb-2">Trazabilidad del cálculo</div>
          <div className="bg-gray-800 text-green-400 text-xs p-3 rounded font-mono leading-5">
            <div>1. Ed = A·Dmed + B·Dmed² → 48.72 kJ</div>
            <div>2. Ecorr = Ed·cos(FPI) → 46.30 kJ</div>
            <div>3. EBS = √(2·Ecorr/masa) → 53.6 km/h</div>
            <div>4. Vi = f(EBS, masa, restitución) → 76.4 km/h</div>
            <div>5. Vpre = Vi + v_frenado → 87.1 km/h</div>
            <div>6. Exceso = 87.1 - 80.0 → +7.1 km/h ⚠</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepNarrativa() {
  const [narrativa, setNarrativa] = useState("");
  const [sugerida] = useState(
    "Con base en el análisis de las evidencias fotográficas, mediciones de deformación y cálculos realizados conforme a la metodología McHenry, se determina que el vehículo Toyota Corolla con placas ABD-123-4 circulaba en dirección norte por la Autopista México-Querétaro a una velocidad estimada de 87.1 km/h, superior al límite permitido de 80 km/h, cuando colisionó frontalmente contra el objeto fijo identificado como barra de contención metálica tipo Jersey. Las huellas de frenado de 18.5 m indican maniobra de emergencia previa al impacto. El conductor presentó un tiempo de reacción de 0.75 segundos."
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Field label="Objeto involucrado" req>
          <select className={sel}>
            <option>Seleccionar...</option>
            <option>Vehículo automotor</option>
            <option>Barra de contención (Jersey)</option>
            <option>Poste de alumbrado</option>
            <option>Árbol</option>
            <option>Peatón</option>
            <option>Motocicleta</option>
          </select>
        </Field>
        <Field label="Descripción del objeto fijo">
          <input className={inp} placeholder="Ej: Barra de contención metálica tipo Jersey" />
        </Field>
        <Field label="Posición final del vehículo">
          <input className={inp} placeholder="Ej: Carril derecho, orientación norte-sur" />
        </Field>
        <Field label="Dirección de circulación">
          <select className={sel}>
            <option>Norte</option>
            <option>Sur</option>
            <option>Este</option>
            <option>Oeste</option>
            <option>Noreste</option>
            <option>Noroeste</option>
            <option>Sureste</option>
            <option>Suroeste</option>
          </select>
        </Field>
        <Field label="Distancia PPR al PC (m)">
          <input type="number" step="0.1" className={inp} placeholder="m" />
        </Field>
        <Field label="Tiempo de reacción conductor (s)">
          <input type="number" step="0.01" className={inp} placeholder="s" />
        </Field>
        <Field label="Huellas de derrape (m)">
          <input type="number" step="0.1" className={inp} placeholder="m" />
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1">Narrativa del Hecho</div>
        <textarea
          className={`${inp} h-28 resize-none`}
          placeholder="Redacte la narrativa técnica del hecho..."
          value={narrativa}
          onChange={(e) => setNarrativa(e.target.value)}
        />

        <div className="p-3 bg-[#E0F7FA] border border-[#00ADCF]/30 rounded">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-700">Narrativa sugerida por IA</span>
            <span className="text-xs bg-[#00ADCF] text-white px-1.5 rounded">Beta</span>
          </div>
          <p className="text-xs text-gray-600 leading-5">{sugerida}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setNarrativa(sugerida)} className="px-3 py-1.5 text-xs rounded text-white" style={{ backgroundColor: "#00ADCF" }}>
              Aceptar sugerencia
            </button>
            <button onClick={() => setNarrativa("")} className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 hover:border-[#00ADCF]">
              Editar
            </button>
            <button className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 flex items-center gap-1 hover:border-[#00ADCF]">
              <RefreshCw size={12} /> Regenerar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepReporte() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 flex flex-col gap-4">
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Principio de Intercambio de Materiales</div>
          <textarea
            className={`${inp} h-20 resize-none`}
            defaultValue="Se identificaron transferencias de pintura color blanco en el panel frontal derecho, consistentes con la barrera metálica tipo Jersey del lugar de los hechos."
          />
        </div>
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Principio de Correspondencia</div>
          <textarea
            className={`${inp} h-20 resize-none`}
            defaultValue="Las deformaciones registradas en el vehículo son compatibles morfológica y dimensionalmente con la estructura de la barrera, corroborando el mecanismo de colisión descrito."
          />
        </div>
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Dinámica de la Colisión por Fases</div>
          <textarea
            className={`${inp} h-28 resize-none`}
            defaultValue={
              "Fase 1 – Pre-impacto: El vehículo circulaba a 87.1 km/h; el conductor inicia maniobra de frenado 0.75 s antes del impacto, reduciendo la velocidad a aprox. 76.4 km/h al momento del contacto.\n\nFase 2 – Impacto: Colisión frontal con la barrera, duración estimada 150 ms. Δv = 75.1 km/h.\n\nFase 3 – Post-impacto: El vehículo queda detenido en el carril derecho."
            }
          />
        </div>
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Conclusiones Periciales</div>
          <textarea
            className={`${inp} h-24 resize-none`}
            defaultValue="Con base en la investigación pericial realizada, se concluye que la causa eficiente del siniestro fue el exceso de velocidad del conductor del vehículo Toyota Corolla 2019, el cual circulaba a 87.1 km/h en zona con límite máximo de 80 km/h, aunado a la pérdida de control del mismo al intentar tomar una curva en la Autopista México-Querétaro."
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">Resumen del Caso</div>
          {[
            { label: "Expediente", val: "RAT-2026-025" },
            { label: "Tipo de hecho", val: "Colisión frontal" },
            { label: "Vehículo", val: "Toyota Corolla 2019" },
            { label: "Perito", val: "Ing. Carlos Méndez" },
            { label: "Vel. pre-impacto", val: "87.1 km/h" },
            { label: "Límite", val: "80 km/h" },
            { label: "Exceso", val: "+7.1 km/h" },
            { label: "Δv", val: "75.1 km/h" },
          ].map((r) => (
            <div key={r.label} className="flex justify-between text-xs py-0.5 border-b border-gray-100">
              <span className="text-gray-500">{r.label}</span>
              <span className="text-gray-700 font-medium">{r.val}</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Vista previa del reporte</div>
          <div className="bg-white border border-gray-300 rounded h-28 flex items-center justify-center text-xs text-gray-400">
            PDF Preview – Placeholder
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button className="w-full py-2 text-xs rounded text-white" style={{ backgroundColor: "#00ADCF" }}>
            Validar Conclusiones
          </button>
          <button className="w-full py-2 text-xs rounded border border-gray-300 text-gray-700 hover:border-[#00ADCF]">Generar PDF</button>
          <button className="w-full py-2 text-xs rounded border border-gray-300 text-gray-700 hover:border-[#00ADCF]">Exportar</button>
          <button className="w-full py-2 text-xs rounded border border-yellow-400 text-yellow-700 hover:bg-yellow-50">Enviar a Revisión</button>
        </div>
      </div>
    </div>
  );
}

export default function NuevoCaso() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const STEP_COMPONENTS = [
    <StepIncidente key="incidente" />,
    <StepVehiculo key="vehiculo" />,
    <StepOcupantes key="ocupantes" />,
    <StepVia key="via" />,
    <StepEvidencia key="evidencia" />,
    <StepDeformacion key="deformacion" />,
    <StepCalculo key="calculo" />,
    <StepNarrativa key="narrativa" />,
    <StepReporte key="reporte" />,
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded shadow-sm p-3">
        <div className="flex items-center">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <button onClick={() => setActiveStep(i)} className="flex flex-col items-center gap-1 group">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                    ${i < activeStep ? "text-white" : i === activeStep ? "text-white ring-2 ring-offset-1" : "bg-gray-100 text-gray-400"}`}
                  style={{ backgroundColor: i <= activeStep ? "#00ADCF" : undefined }}
                >
                  {i < activeStep ? <Check size={13} /> : i + 1}
                </div>
                <span className={`text-xs whitespace-nowrap ${i === activeStep ? "text-[#00ADCF] font-medium" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2 mt-[-12px]" style={{ backgroundColor: i < activeStep ? "#00ADCF" : "#E5E7EB" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-500 rounded-t">
          <span className="text-white text-sm">| {STEPS[activeStep].label}</span>
        </div>
        <div className="p-4">{STEP_COMPONENTS[activeStep]}</div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/expedientes")}
          className="px-4 py-2 text-xs border border-gray-300 rounded text-gray-600 hover:border-red-400 hover:text-red-600"
        >
          Cancelar
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="flex items-center gap-1 px-3 py-2 text-xs border border-gray-300 rounded text-gray-600 disabled:opacity-40 hover:border-[#00ADCF]"
          >
            <ChevronLeft size={14} /> Anterior
          </button>

          {activeStep < STEPS.length - 1 ? (
            <button
              onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))}
              className="flex items-center gap-1 px-3 py-2 text-xs rounded text-white"
              style={{ backgroundColor: "#00ADCF" }}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          ) : (
            <button className="px-4 py-2 text-xs rounded text-white font-medium" style={{ backgroundColor: "#10B981" }} onClick={() => navigate("/expedientes")}>
              Guardar Expediente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
