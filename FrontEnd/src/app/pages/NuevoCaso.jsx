import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { createIncidentePaso1 } from "../../services/siniestroService";
import { getCatalogos, getPeritos } from "../../services/catalogosService";

// ── Contexto compartido entre pasos ───────────────────────────────────────────
const FormCtx = createContext(null);
function useForm() { return useContext(FormCtx); }

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

const inp = "w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]";
const sel = "w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white";

function Field({ label, req, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── PASO 0: Incidente ─────────────────────────────────────────────────────────
function StepIncidente() {
  const { form, setField } = useForm();
  const [tiposHecho, setTiposHecho] = useState([]);
  const [peritos, setPeritos]       = useState([]);

  useEffect(() => {
    // Carga catálogos y peritos en paralelo
    Promise.all([getCatalogos(), getPeritos()])
      .then(([cats, per]) => {
        setTiposHecho(cats?.tipos_hecho ?? []);
        setPeritos(Array.isArray(per) ? per : []);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">

        <Field label="Número de Siniestro" req>
          <input
            className={inp}
            placeholder="RAT-2026-025"
            value={form.numero_siniestro}
            onChange={(e) => setField("numero_siniestro", e.target.value)}
          />
        </Field>

        <Field label="Tipo de Hecho" req>
          <select
            className={sel}
            value={form.tipo_hecho_id}
            onChange={(e) => setField("tipo_hecho_id", Number(e.target.value))}
          >
            <option value="">Seleccionar...</option>
            {tiposHecho.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </Field>

        <Field label="Fecha del Hecho" req>
          <input
            type="date"
            className={inp}
            value={form.fecha_hecho}
            onChange={(e) => setField("fecha_hecho", e.target.value)}
          />
        </Field>

        <Field label="Hora del Hecho">
          <input
            type="time"
            className={inp}
            value={form.hora_hecho}
            onChange={(e) => setField("hora_hecho", e.target.value)}
          />
        </Field>

        <div className="col-span-2">
          <Field label="Perito Responsable" req>
            <select
              className={sel}
              value={form.id_usuario_perito}
              onChange={(e) => setField("id_usuario_perito", Number(e.target.value))}
            >
              <option value="">Seleccionar perito...</option>
              {peritos.map((p) => (
                <option key={p.id_user} value={p.id_user}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>

      </div>
    </div>
  );
}

// ── Pasos pendientes (se implementan después del paso 1) ─────────────────────
function StepPendiente({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs">Guarda el Paso 1 primero para continuar.</span>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function NuevoCaso() {
  const navigate = useNavigate();
  const [step, setStep]                   = useState(0);
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState("");
  const [incidenteUuid, setIncidenteUuid] = useState(null);

  const [form, setForm] = useState({
    numero_siniestro  : "",
    tipo_hecho_id     : "",
    fecha_hecho       : "",
    hora_hecho        : "",
    id_usuario_perito : "",
  });

  const setField = useCallback((key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  // ── Guardar Paso 1 → crea fila en RAT_INCIDENTE ───────────────────────────
  const handleGuardarPaso1 = useCallback(async () => {
    setSaveError("");

    if (!form.numero_siniestro.trim()) return setSaveError("El Número de Siniestro es obligatorio.");
    if (!form.tipo_hecho_id)          return setSaveError("Selecciona el Tipo de Hecho.");
    if (!form.fecha_hecho)            return setSaveError("La Fecha del Hecho es obligatoria.");
    if (!form.id_usuario_perito)      return setSaveError("Selecciona el Perito Responsable.");

    setSaving(true);
    try {
      const payload = {
        numero_siniestro  : form.numero_siniestro.trim(),
        tipo_hecho_id     : Number(form.tipo_hecho_id),
        fecha_hecho       : form.fecha_hecho,
        hora_hecho        : form.hora_hecho || null,
        id_usuario_perito : Number(form.id_usuario_perito),
        estado            : 0,
      };

      const res = await createIncidentePaso1(payload);
      // Respuesta: { incidente_uuid, numero_siniestro }
      setIncidenteUuid(res.incidente_uuid);
      setStep(1);
    } catch (err) {
      setSaveError(err?.message || "No se pudo guardar el expediente. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [form]);

  const STEP_COMPONENTS = [
    <StepIncidente key="incidente" />,
    <StepPendiente key="vehiculo"    label="Paso 2 — Vehículo" />,
    <StepPendiente key="ocupantes"   label="Paso 3 — Ocupantes" />,
    <StepPendiente key="via"         label="Paso 4 — Vía" />,
    <StepPendiente key="evidencia"   label="Paso 5 — Evidencia Fotográfica" />,
    <StepPendiente key="deformacion" label="Paso 6 — Deformación" />,
    <StepPendiente key="calculo"     label="Paso 7 — Cálculo de Velocidad" />,
    <StepPendiente key="narrativa"   label="Paso 8 — Narrativa Dinámica" />,
    <StepPendiente key="reporte"     label="Paso 9 — Reporte Final" />,
  ];

  const isLast = step === STEPS.length - 1;

  return (
    <FormCtx.Provider value={{ form, setField }}>
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h1 className="text-base font-semibold text-gray-800">Nuevo Expediente</h1>
          {incidenteUuid && (
            <span className="text-[11px] bg-green-50 border border-green-200 text-green-700 rounded px-2 py-0.5">
              ✓ Guardado — UUID: {incidenteUuid}
            </span>
          )}
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100 bg-gray-50 overflow-x-auto">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-1 shrink-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${i < step ? "bg-[#00ADCF] text-white"
                    : i === step ? "bg-[#00ADCF] text-white ring-2 ring-[#00ADCF]/30"
                    : "bg-gray-200 text-gray-500"}`}>
                  {i < step ? <Check size={10} /> : i + 1}
                </div>
                <span className={`text-[11px] ${i === step ? "text-[#00ADCF] font-medium" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px min-w-[8px] ${i < step ? "bg-[#00ADCF]" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {STEP_COMPONENTS[step]}
        </div>

        {/* Error */}
        {saveError && (
          <div className="mx-6 mb-2 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {saveError}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-white">
          <button
            disabled={saving}
            onClick={() => step === 0 ? navigate("/expedientes") : setStep((s) => s - 1)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            {step === 0 ? "Cancelar" : "Anterior"}
          </button>

          {isLast ? (
            <button
              onClick={() => navigate("/expedientes")}
              className="flex items-center gap-1 text-xs bg-[#00ADCF] text-white px-4 py-1.5 rounded hover:bg-[#008eaa]"
            >
              <Check size={14} /> Finalizar
            </button>
          ) : step === 0 ? (
            <button
              onClick={handleGuardarPaso1}
              disabled={saving}
              className="flex items-center gap-1 text-xs bg-[#00ADCF] text-white px-4 py-1.5 rounded hover:bg-[#008eaa] disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar y continuar"}
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1 text-xs bg-[#00ADCF] text-white px-4 py-1.5 rounded hover:bg-[#008eaa]"
            >
              Siguiente <ChevronRight size={14} />
            </button>
          )}
        </div>

      </div>
    </FormCtx.Provider>
  );
}
