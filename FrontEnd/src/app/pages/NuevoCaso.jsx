import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, ChevronLeft, ChevronRight,
  Upload, X, AlertCircle, RefreshCw, FileText,
} from "lucide-react";
import {
  createIncidentePaso1,
  updatePaso2Vehiculo,
  updatePaso3Ocupantes,
  updatePaso4Via,
  updatePaso6Deformacion,
  storePaso7Calculo,
  updatePaso8Narrativa,
  updatePaso9Reporte,
} from "../../services/incidenteService";
import { getCatalogos, getPeritos } from "../../services/catalogosService";

// ── Contexto: form + catálogos disponibles en todos los pasos ─────────────────
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
        {label} {req && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function CatSel({ field, label, req, items, placeholder = "Seleccionar..." }) {
  const { form, setField } = useForm();
  return (
    <Field label={label} req={req}>
      <select className={sel} value={form[field] ?? ""}
        onChange={(e) => setField(field, e.target.value)}>
        <option value="">{placeholder}</option>
        {(items ?? []).map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>
    </Field>
  );
}

// ── PASO 0: Incidente ─────────────────────────────────────────────────────────
function StepIncidente() {
  const { form, setField, cats, peritos } = useForm();
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Número de Siniestro" req>
        <input className={inp} placeholder="RAT-2026-025"
          value={form.numero_siniestro ?? ""}
          onChange={(e) => setField("numero_siniestro", e.target.value)} />
      </Field>
      <Field label="Perito Responsable" req>
        <select className={sel} value={form.id_usuario_perito ?? ""}
          onChange={(e) => setField("id_usuario_perito", Number(e.target.value))}>
          <option value="">Seleccionar...</option>
          {peritos.map((p) => (
            <option key={p.id_user} value={p.id_user}>{p.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Fecha del Hecho" req>
        <input type="date" className={inp} value={form.fecha_hecho ?? ""}
          onChange={(e) => setField("fecha_hecho", e.target.value)} />
      </Field>
      <Field label="Hora del Hecho">
        <input type="time" className={inp} value={form.hora_hecho ?? ""}
          onChange={(e) => setField("hora_hecho", e.target.value)} />
      </Field>
      <Field label="Tipo de Hecho" req>
        <select className={sel} value={form.tipo_hecho_id ?? ""}
          onChange={(e) => setField("tipo_hecho_id", Number(e.target.value))}>
          <option value="">Seleccionar...</option>
          {(cats?.tipos_hecho ?? []).map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
      </Field>
      <Field label="Estado del Análisis">
        <select className={sel} value={form.estado ?? 0}
          onChange={(e) => setField("estado", Number(e.target.value))}>
          <option value={0}>Abierto</option>
          <option value={1}>En revisión</option>
          <option value={2}>Finalizado</option>
        </select>
      </Field>
    </div>
  );
}

// ── PASO 1: Vehículo ──────────────────────────────────────────────────────────
function StepVehiculo() {
  const { form, setField, cats } = useForm();
  const f = (k) => form[k] ?? "";
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-3">
        <Field label="VIN / Número de Serie" req>
          <input className={inp} placeholder="3VWFE21C04M000001"
            value={f("vin")} onChange={(e) => setField("vin", e.target.value)} />
        </Field>
      </div>
      <Field label="Marca" req>
        <input className={inp} placeholder="Volkswagen"
          value={f("marca")} onChange={(e) => setField("marca", e.target.value)} />
      </Field>
      <Field label="Submarca">
        <input className={inp} placeholder="Jetta"
          value={f("submarca")} onChange={(e) => setField("submarca", e.target.value)} />
      </Field>
      <Field label="Año" req>
        <input type="number" className={inp} placeholder="2020"
          value={f("anio_modelo")} onChange={(e) => setField("anio_modelo", e.target.value)} />
      </Field>
      <Field label="Tipo de Vehículo" req>
        <select className={sel} value={f("tipo_vehiculo")}
          onChange={(e) => setField("tipo_vehiculo", e.target.value)}>
          <option value="">Seleccionar...</option>
          <option value="ligero">Ligero</option>
          <option value="pesado">Pesado</option>
        </select>
      </Field>
      <CatSel field="color_id" label="Color" items={cats?.colores} />
      <Field label="Placas">
        <input className={inp} placeholder="ABC-123-4"
          value={f("numero_placas")} onChange={(e) => setField("numero_placas", e.target.value)} />
      </Field>
      <Field label="Rol" req>
        <select className={sel} value={f("rol")} onChange={(e) => setField("rol", e.target.value)}>
          <option value="">Seleccionar...</option>
          <option value="A">A (Principal)</option>
          <option value="B">B (Involucrado)</option>
          <option value="C">C (Tercero)</option>
        </select>
      </Field>
      <CatSel field="estado_neumatico_id" label="Estado Neumático" items={cats?.estados_neumatico} />
      <Field label="Peso Tara (kg)">
        <input type="number" className={inp} placeholder="1285"
          value={f("peso_tara_kg")} onChange={(e) => setField("peso_tara_kg", e.target.value)} />
      </Field>
      <Field label="MMA (kg)">
        <input type="number" className={inp} placeholder="1750"
          value={f("masa_maxima_autorizada_kg")} onChange={(e) => setField("masa_maxima_autorizada_kg", e.target.value)} />
      </Field>
      <Field label="Ancho (mm)">
        <input type="number" className={inp}
          value={f("ancho_mm")} onChange={(e) => setField("ancho_mm", e.target.value)} />
      </Field>
      <Field label="Largo (mm)">
        <input type="number" className={inp}
          value={f("largo_mm")} onChange={(e) => setField("largo_mm", e.target.value)} />
      </Field>
      <Field label="Alto (mm)">
        <input type="number" className={inp}
          value={f("alto_mm")} onChange={(e) => setField("alto_mm", e.target.value)} />
      </Field>
      <Field label="Batalla (mm)">
        <input type="number" className={inp}
          value={f("batalla_mm")} onChange={(e) => setField("batalla_mm", e.target.value)} />
      </Field>
      <Field label="Entrevía Delantera (mm)">
        <input type="number" className={inp}
          value={f("entrevia_delantera_mm")} onChange={(e) => setField("entrevia_delantera_mm", e.target.value)} />
      </Field>
      <Field label="Entrevía Trasera (mm)">
        <input type="number" className={inp}
          value={f("entrevia_trasera_mm")} onChange={(e) => setField("entrevia_trasera_mm", e.target.value)} />
      </Field>
    </div>
  );
}

// ── PASO 2: Ocupantes ─────────────────────────────────────────────────────────
function StepOcupantes() {
  const { form, setField } = useForm();
  const tara  = Number(form.peso_tara_kg || 0);
  const total = tara
    + Number(form.peso_conductor_kg || 75)
    + Number(form.peso_pasajeros_kg || 0)
    + Number(form.peso_equipaje_kg  || 0);
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-4">
        <Field label="Número de Ocupantes" req>
          <input type="number" min="1" max="9" className={inp}
            value={form.numero_ocupantes ?? "1"}
            onChange={(e) => setField("numero_ocupantes", e.target.value)} />
        </Field>
        <Field label="Peso del Conductor (kg)" req>
          <input type="number" className={inp}
            value={form.peso_conductor_kg ?? "75"}
            onChange={(e) => setField("peso_conductor_kg", e.target.value)} />
        </Field>
        <Field label="Peso Total de Pasajeros (kg)">
          <input type="number" className={inp}
            value={form.peso_pasajeros_kg ?? "0"}
            onChange={(e) => setField("peso_pasajeros_kg", e.target.value)} />
        </Field>
        <Field label="Peso de Equipaje / Carga (kg)">
          <input type="number" className={inp}
            value={form.peso_equipaje_kg ?? "0"}
            onChange={(e) => setField("peso_equipaje_kg", e.target.value)} />
        </Field>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded p-4">
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">Resumen de masas</div>
        {[
          ["Peso tara vehículo (kg)", tara || "—"],
          ["Conductor (kg)", form.peso_conductor_kg ?? "75"],
          ["Pasajeros (kg)", form.peso_pasajeros_kg ?? "0"],
          ["Carga/Equipaje (kg)", form.peso_equipaje_kg ?? "0"],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">{l}</span>
            <span className="text-gray-700 font-medium">{v}</span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-300 flex justify-between items-center">
          <span className="text-xs text-gray-700">Masa total</span>
          <span className="text-base font-semibold" style={{ color: "#00ADCF" }}>
            {total.toLocaleString()} kg
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">* Calculado automáticamente.</p>
      </div>
    </div>
  );
}

// ── PASO 3: Vía ───────────────────────────────────────────────────────────────
function StepVia() {
  const { form, setField, cats } = useForm();
  const f = (k) => form[k] ?? "";
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Km / Punto de Referencia">
        <input className={inp} placeholder="Km 14+500"
          value={f("km_punto")} onChange={(e) => setField("km_punto", e.target.value)} />
      </Field>
      <Field label="Municipio / Estado" req>
        <input className={inp} placeholder="Toluca, Estado de México"
          value={f("municipio")} onChange={(e) => setField("municipio", e.target.value)} />
      </Field>
      <Field label="Calle / Referencia">
        <input className={inp} placeholder="Av. Principal s/n"
          value={f("calle")} onChange={(e) => setField("calle", e.target.value)} />
      </Field>
      <Field label="Velocidad Máxima Permitida (km/h)" req>
        <input type="number" className={inp} placeholder="80"
          value={f("velocidad_maxima_permitida_kmh")}
          onChange={(e) => setField("velocidad_maxima_permitida_kmh", e.target.value)} />
      </Field>
      <CatSel field="tipo_via_id"             label="Tipo de Vía"             items={cats?.tipos_via} />
      <CatSel field="tipo_trazo_id"           label="Tipo de Trazo"           items={cats?.tipos_trazo} />
      <CatSel field="condicion_superficie_id" label="Condición de Superficie" items={cats?.condiciones_superficie} />
      <CatSel field="condicion_pavimento_id"  label="Condición de Pavimento"  items={cats?.condiciones_pavimento} />
      <CatSel field="tipo_pavimento_id"       label="Tipo de Pavimento"       items={cats?.tipos_pavimento} />
      <CatSel field="clima_id"                label="Clima"                   items={cats?.climas} />
      <CatSel field="orientacion_id"          label="Orientación de Vía"      items={cats?.orientaciones_via} />
      <CatSel field="sentido_vialidad_id"     label="Sentido de Vialidad"     items={cats?.sentidos_vialidad} />
      <Field label="Lat">
        <input type="number" step="0.000001" className={inp} placeholder="19.4326"
          value={f("lat")} onChange={(e) => setField("lat", e.target.value)} />
      </Field>
      <Field label="Lng">
        <input type="number" step="0.000001" className={inp} placeholder="-99.1332"
          value={f("lng")} onChange={(e) => setField("lng", e.target.value)} />
      </Field>
    </div>
  );
}

// ── PASO 4: Evidencia ─────────────────────────────────────────────────────────
const CATEGORIAS_FOTO = [
  "Frontal", "Lateral Derecho", "Lateral Izquierdo", "Posterior",
  "Partes Bajas", "Habitáculo", "Lugar de Hechos", "Objeto Involucrado",
];

function StepEvidencia() {
  const [uploaded, setUploaded] = useState({});
  const completitud = Object.keys(uploaded).filter((k) => uploaded[k]?.length > 0).length;
  const handleFile  = (cat, e) => {
    const files = Array.from(e.target.files).map((f) => f.name);
    setUploaded((prev) => ({ ...prev, [cat]: [...(prev[cat] || []), ...files] }));
  };
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div className="h-2 rounded-full transition-all"
            style={{ width: `${(completitud / CATEGORIAS_FOTO.length) * 100}%`, backgroundColor: "#00ADCF" }} />
        </div>
        <span className="text-xs text-gray-500">{completitud}/{CATEGORIAS_FOTO.length} categorías</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {CATEGORIAS_FOTO.map((cat) => {
          const files = uploaded[cat] || [];
          return (
            <div key={cat}>
              <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                {cat}
                {files.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 rounded-full px-1.5">{files.length}</span>
                )}
              </div>
              <label className="border-2 border-dashed border-gray-300 rounded p-3 text-center hover:border-[#00ADCF] cursor-pointer min-h-[80px] flex flex-col items-center justify-center gap-1 block">
                <Upload size={16} className="text-gray-400" />
                <span className="text-xs text-gray-400">Arrastrar o clic</span>
                <input type="file" className="hidden" multiple accept="image/*"
                  onChange={(e) => handleFile(cat, e)} />
              </label>
              {files.map((f, i) => (
                <div key={i} className="mt-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1 flex items-center gap-1">
                  <FileText size={11} />
                  <span className="truncate flex-1">{f}</span>
                  <button onClick={() => setUploaded((prev) => ({ ...prev, [cat]: prev[cat].filter((_, j) => j !== i) }))}
                    className="text-gray-300 hover:text-red-400"><X size={11} /></button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-start gap-2">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <span>Las fotos se suben al servidor en el Paso 5. Aquí selecciona los archivos por categoría.</span>
      </div>
    </div>
  );
}

// ── PASO 5: Deformación ───────────────────────────────────────────────────────
function StepDeformacion() {
  const { form, setField, cats } = useForm();
  const numMed = Number(form.numero_mediciones_id
    ? (cats?.numeros_mediciones ?? []).find((c) => String(c.id) === String(form.numero_mediciones_id))?.nombre ?? 6
    : 6);
  const campos  = isNaN(numMed) ? 6 : numMed;
  const cLabels = Array.from({ length: campos }, (_, i) => `C${i + 1}`);
  const dmed = (() => {
    const vals = cLabels.map((c) => Number(form[`medicion_${c}`] || 0)).filter((v) => v > 0);
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(4);
  })();

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-3 grid grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded p-3">
        <CatSel field="tipo_golpe_id"       label="Tipo de Golpe"        req items={cats?.tipos_golpe} />
        <CatSel field="numero_mediciones_id" label="Número de Mediciones" req items={cats?.numeros_mediciones} />
        <Field label="Línea de Referencia (mm)">
          <input type="number" className={inp} placeholder="0"
            value={form.linea_referencia_mm ?? ""}
            onChange={(e) => setField("linea_referencia_mm", e.target.value)} />
        </Field>
      </div>

      <div className="col-span-1 bg-gray-50 border border-gray-200 rounded p-3 flex flex-col items-center gap-2">
        <div className="text-xs text-gray-500 mb-1">Diagrama</div>
        <svg width="120" height="160" viewBox="0 0 120 160">
          <rect x="20" y="40" width="80" height="100" rx="8" stroke="#9CA3AF" strokeWidth="2" fill="#F9FAFB" />
        </svg>
        <div className="text-xs text-gray-400 text-center">Puntos activos: {campos}</div>
      </div>

      <div className="col-span-1 flex flex-col gap-3">
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1">Mediciones (mm)</div>
        <div className="grid grid-cols-2 gap-3">
          {cLabels.map((c) => (
            <Field key={c} label={`${c} (mm)`} req>
              <input type="number" className={inp}
                value={form[`medicion_${c}`] ?? ""}
                onChange={(e) => setField(`medicion_${c}`, e.target.value)}
                placeholder="0.0" />
            </Field>
          ))}
        </div>
      </div>

      <div className="col-span-1 flex flex-col gap-3">
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1">Variables adicionales</div>
        <Field label="Ancho de contacto L (m)" req>
          <input type="number" className={inp} placeholder="0.0"
            value={form.l_ancho_contacto_m ?? ""}
            onChange={(e) => setField("l_ancho_contacto_m", e.target.value)} />
        </Field>
        <Field label="Ángulo FPI (°)">
          <input type="number" className={inp} placeholder="0.0"
            value={form.angulo_fpi_grados ?? ""}
            onChange={(e) => setField("angulo_fpi_grados", e.target.value)} />
        </Field>
        <div className="bg-[#E0F7FA] border border-[#00ADCF]/30 rounded p-2 mt-2">
          <div className="text-xs text-gray-600 mb-1">Dmed calculado:</div>
          <div className="text-sm font-semibold text-[#00ADCF]">{dmed ? `${dmed} mm` : "—"}</div>
          <div className="text-xs text-gray-400">Promedio C1–C{campos}</div>
        </div>
      </div>
    </div>
  );
}

// ── PASO 6: Cálculo ───────────────────────────────────────────────────────────
function StepCalculo() {
  const { form, setField } = useForm();
  const params = [
    { label: "Coeficiente A (N/m)",               key: "a_rigidez_n_m" },
    { label: "Coeficiente B (N/m²)",              key: "b_rigidez_n_m2" },
    { label: "Dmed (m)",                           key: "dmed_m" },
    { label: "Tiempo reacción frenos (s)",         key: "tiempo_respuesta_frenos_s" },
    { label: "Velocidad final post-impacto (km/h)",key: "velocidad_final_kmh" },
  ];
  const resultados = [
    { label: "Energía deformación Ed (kJ)",   key: "e_deformacion_julios" },
    { label: "Energía corregida (kJ)",        key: "e_def_corregida_julios" },
    { label: "EBS (m/s)",                     key: "ebs_m_s" },
    { label: "Vel. impacto Vi (km/h)",        key: "velocidad_impacto_kmh" },
    { label: "Vel. pre-impacto (km/h)",       key: "velocidad_pre_impacto_kmh" },
    { label: "Vel. Limpert (km/h)",           key: "velocidad_limpert_kmh" },
    { label: "Exceso de velocidad (km/h)",    key: "delta_exceso_kmh" },
  ];
  const hayExceso = Number(form.delta_exceso_kmh) > 0;
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1 mb-3">Parámetros de entrada</div>
        <div className="flex flex-col gap-2">
          {params.map((v) => (
            <div key={v.label} className="flex items-center gap-2">
              <label className="text-xs text-gray-500 w-52 shrink-0">{v.label}</label>
              <input className={inp} value={form[v.key] ?? ""}
                onChange={(e) => setField(v.key, e.target.value)} />
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
          {resultados.map((v) => (
            <div key={v.label} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-1.5">
              <span className="text-xs text-gray-600">{v.label}</span>
              <input
                className="text-xs font-semibold text-[#00ADCF] bg-transparent border-none outline-none w-20 text-right"
                value={form[v.key] ?? ""}
                onChange={(e) => setField(v.key, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 border rounded" style={{ borderColor: "#00ADCF", backgroundColor: "#E0F7FA" }}>
          <div className="text-xs text-gray-600 mb-1">Diagnóstico de velocidad</div>
          {hayExceso ? (
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-semibold text-sm">EXCESO DETECTADO</span>
              <span className="text-xs text-red-500">+{form.delta_exceso_kmh} km/h</span>
            </div>
          ) : (
            <span className="text-green-600 font-semibold text-sm">Sin exceso de velocidad</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PASO 7: Narrativa ─────────────────────────────────────────────────────────
function StepNarrativa() {
  const { form, setField } = useForm();
  const sugerida = "Con base en el análisis de las evidencias fotográficas, mediciones de deformación y cálculos realizados conforme a la metodología McHenry, se determina que el vehículo circulaba a una velocidad estimada superior al límite permitido cuando ocurrió el hecho vial.";
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Field label="Objeto involucrado" req>
          <select className={sel} value={form.objeto_involucrado ?? ""}
            onChange={(e) => setField("objeto_involucrado", e.target.value)}>
            <option value="">Seleccionar...</option>
            {["Vehículo automotor","Barra de contención (Jersey)","Poste de alumbrado","Árbol","Peatón","Motocicleta"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Descripción del objeto fijo">
          <input className={inp} placeholder="Ej: Barra de contención metálica tipo Jersey"
            value={form.descripcion_objeto_fijo ?? ""}
            onChange={(e) => setField("descripcion_objeto_fijo", e.target.value)} />
        </Field>
        <Field label="Posición final del vehículo">
          <input className={inp} placeholder="Ej: Carril derecho, orientación norte-sur"
            value={form.posicion_final_vehiculo ?? ""}
            onChange={(e) => setField("posicion_final_vehiculo", e.target.value)} />
        </Field>
        <Field label="Dirección de circulación">
          <select className={sel} value={form.direccion_circulacion ?? ""}
            onChange={(e) => setField("direccion_circulacion", e.target.value)}>
            {["Norte","Sur","Este","Oeste","Noreste","Noroeste","Sureste","Suroeste"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Distancia PPR al PC (m)">
          <input type="number" step="0.1" className={inp}
            value={form.distancia_ppr_al_pc_m ?? ""}
            onChange={(e) => setField("distancia_ppr_al_pc_m", e.target.value)} />
        </Field>
        <Field label="Tiempo de reacción conductor (s)">
          <input type="number" step="0.01" className={inp}
            value={form.tiempo_reaccion_conductor_s ?? ""}
            onChange={(e) => setField("tiempo_reaccion_conductor_s", e.target.value)} />
        </Field>
        <Field label="Huellas de derrape (m)">
          <input type="number" step="0.1" className={inp}
            value={form.huellas_derrape_m ?? ""}
            onChange={(e) => setField("huellas_derrape_m", e.target.value)} />
        </Field>
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1">Narrativa del Hecho</div>
        <textarea className={`${inp} h-28 resize-none`}
          placeholder="Redacte la narrativa técnica del hecho..."
          value={form.narracion_hechos ?? ""}
          onChange={(e) => setField("narracion_hechos", e.target.value)} />
        <div className="p-3 bg-[#E0F7FA] border border-[#00ADCF]/30 rounded">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-700">Narrativa sugerida por IA</span>
            <span className="text-xs bg-[#00ADCF] text-white px-1.5 rounded">Beta</span>
          </div>
          <p className="text-xs text-gray-600 leading-5">{sugerida}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setField("narracion_hechos", sugerida)}
              className="px-3 py-1.5 text-xs rounded text-white" style={{ backgroundColor: "#00ADCF" }}>
              Aceptar sugerencia
            </button>
            <button onClick={() => setField("narracion_hechos", "")}
              className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600">
              Limpiar
            </button>
            <button className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 flex items-center gap-1">
              <RefreshCw size={12} /> Regenerar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PASO 8: Reporte ───────────────────────────────────────────────────────────
function StepReporte() {
  const { form, setField } = useForm();
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 flex flex-col gap-4">
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Principio de Intercambio de Materiales</div>
          <textarea className={`${inp} h-20 resize-none`}
            value={form.principio_intercambio_materiales ?? ""}
            onChange={(e) => setField("principio_intercambio_materiales", e.target.value)}
            placeholder="Se identificaron transferencias de pintura..." />
        </div>
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Principio de Correspondencia</div>
          <textarea className={`${inp} h-20 resize-none`}
            value={form.principio_correspondencia ?? ""}
            onChange={(e) => setField("principio_correspondencia", e.target.value)}
            placeholder="Las deformaciones son compatibles con..." />
        </div>
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Conclusiones Periciales</div>
          <textarea className={`${inp} h-24 resize-none`}
            value={form.conclusiones_texto ?? ""}
            onChange={(e) => setField("conclusiones_texto", e.target.value)}
            placeholder="Con base en la investigación pericial realizada..." />
        </div>
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Tipo de documento</div>
          <select className={sel} value={form.tipo_documento ?? "informe"}
            onChange={(e) => setField("tipo_documento", e.target.value)}>
            <option value="informe">Informe</option>
            <option value="dictamen">Dictamen</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">Resumen del Caso</div>
          {[
            ["Expediente", form.numero_siniestro || "—"],
            ["Estado", form.estado === 0 ? "Abierto" : form.estado === 1 ? "En revisión" : "Finalizado"],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs py-0.5 border-b border-gray-100">
              <span className="text-gray-500">{l}</span>
              <span className="text-gray-700 font-medium">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <button onClick={() => setField("accion", "validar")}
            className="w-full py-2 text-xs rounded text-white" style={{ backgroundColor: "#00ADCF" }}>
            Validar Conclusiones
          </button>
          <button className="w-full py-2 text-xs rounded border border-gray-300 text-gray-700 hover:border-[#00ADCF]">
            Generar PDF
          </button>
          <button onClick={() => setField("accion", "emitir")}
            className="w-full py-2 text-xs rounded border border-yellow-400 text-yellow-700 hover:bg-yellow-50">
            Enviar a Revisión
          </button>
        </div>
      </div>
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
  const [cats, setCats]                   = useState(null);
  const [peritos, setPeritos]             = useState([]);

  const [form, setFormState] = useState({
    numero_siniestro: "", tipo_hecho_id: "", fecha_hecho: "",
    hora_hecho: "", id_usuario_perito: "", estado: 0,
    tipo_documento: "informe",
  });

  const setField = useCallback((key, val) => {
    setFormState((prev) => ({ ...prev, [key]: val }));
  }, []);

  // Cargar catálogos una sola vez
  useEffect(() => {
    Promise.all([getCatalogos(), getPeritos()])
      .then(([c, p]) => { setCats(c); setPeritos(Array.isArray(p) ? p : []); })
      .catch(() => {});
  }, []);

  // ── Lógica de guardado por paso ────────────────────────────────────────────
  const handleGuardar = useCallback(async () => {
    setSaveError("");
    setSaving(true);
    try {

      // ── PASO 0: Crear incidente ──
      if (step === 0) {
        if (!form.numero_siniestro?.trim()) throw new Error("El Número de Siniestro es obligatorio.");
        if (!form.tipo_hecho_id)            throw new Error("Selecciona el Tipo de Hecho.");
        if (!form.fecha_hecho)              throw new Error("La Fecha del Hecho es obligatoria.");
        if (!form.id_usuario_perito)        throw new Error("Selecciona el Perito Responsable.");

        const res = await createIncidentePaso1({
          numero_siniestro  : form.numero_siniestro.trim(),
          tipo_hecho_id     : Number(form.tipo_hecho_id),
          fecha_hecho       : form.fecha_hecho,
          hora_hecho        : form.hora_hecho || null,
          id_usuario_perito : Number(form.id_usuario_perito),
          estado            : form.estado ?? 0,
        });
        setIncidenteUuid(res.incidente_uuid);

      } else if (!incidenteUuid) {
        throw new Error("Primero completa y guarda el Paso 1 (Incidente).");

      // ── PASO 1: Vehículo ──
      } else if (step === 1) {
        if (!form.vin?.trim())    throw new Error("El VIN es obligatorio.");
        if (!form.marca?.trim())  throw new Error("La Marca es obligatoria.");
        if (!form.anio_modelo)    throw new Error("El Año es obligatorio.");
        if (!form.tipo_vehiculo)  throw new Error("Selecciona el Tipo de Vehículo.");
        if (!form.rol)            throw new Error("Selecciona el Rol del vehículo.");

        await updatePaso2Vehiculo(incidenteUuid, {
          vin                      : form.vin.trim(),
          marca                    : form.marca.trim(),
          submarca                 : form.submarca || null,
          nombre_modelo            : form.nombre_modelo || null,
          anio_modelo              : Number(form.anio_modelo),
          tipo_vehiculo            : form.tipo_vehiculo,
          peso_tara_kg             : form.peso_tara_kg             ? Number(form.peso_tara_kg) : null,
          masa_maxima_autorizada_kg: form.masa_maxima_autorizada_kg ? Number(form.masa_maxima_autorizada_kg) : null,
          ancho_mm                 : form.ancho_mm                 ? Number(form.ancho_mm) : null,
          largo_mm                 : form.largo_mm                 ? Number(form.largo_mm) : null,
          alto_mm                  : form.alto_mm                  ? Number(form.alto_mm) : null,
          batalla_mm               : form.batalla_mm               ? Number(form.batalla_mm) : null,
          entrevia_delantera_mm    : form.entrevia_delantera_mm    ? Number(form.entrevia_delantera_mm) : null,
          entrevia_trasera_mm      : form.entrevia_trasera_mm      ? Number(form.entrevia_trasera_mm) : null,
          numero_placas            : form.numero_placas || null,
          color_id                 : form.color_id     ? Number(form.color_id) : null,
          estado_neumatico_id      : form.estado_neumatico_id ? Number(form.estado_neumatico_id) : null,
          rol                      : form.rol,
        });

      // ── PASO 2: Ocupantes ──
      } else if (step === 2) {
        await updatePaso3Ocupantes(incidenteUuid, {
          numero_ocupantes  : form.numero_ocupantes  ? Number(form.numero_ocupantes) : null,
          peso_conductor_kg : form.peso_conductor_kg ? Number(form.peso_conductor_kg) : null,
          peso_pasajeros_kg : form.peso_pasajeros_kg ? Number(form.peso_pasajeros_kg) : null,
          peso_equipaje_kg  : form.peso_equipaje_kg  ? Number(form.peso_equipaje_kg) : null,
        });

      // ── PASO 3: Vía ──
      } else if (step === 3) {
        await updatePaso4Via(incidenteUuid, {
          calle                          : form.calle || null,
          municipio                      : form.municipio || null,
          km_punto                       : form.km_punto || null,
          lat                            : form.lat ? Number(form.lat) : null,
          lng                            : form.lng ? Number(form.lng) : null,
          velocidad_maxima_permitida_kmh : form.velocidad_maxima_permitida_kmh ? Number(form.velocidad_maxima_permitida_kmh) : null,
          tipo_via_id                    : form.tipo_via_id             ? Number(form.tipo_via_id) : null,
          tipo_trazo_id                  : form.tipo_trazo_id           ? Number(form.tipo_trazo_id) : null,
          condicion_superficie_id        : form.condicion_superficie_id ? Number(form.condicion_superficie_id) : null,
          condicion_pavimento_id         : form.condicion_pavimento_id  ? Number(form.condicion_pavimento_id) : null,
          tipo_pavimento_id              : form.tipo_pavimento_id       ? Number(form.tipo_pavimento_id) : null,
          clima_id                       : form.clima_id                ? Number(form.clima_id) : null,
          orientacion_id                 : form.orientacion_id          ? Number(form.orientacion_id) : null,
          sentido_vialidad_id            : form.sentido_vialidad_id     ? Number(form.sentido_vialidad_id) : null,
        });

      // ── PASO 4: Evidencia — por ahora solo avanza (subida de archivos se hace en servidor) ──
      } else if (step === 4) {
        // TODO: conectar subida real de fotos cuando el servidor tenga almacenamiento configurado

      // ── PASO 5: Deformación ──
      } else if (step === 5) {
        if (!form.tipo_golpe_id)        throw new Error("Selecciona el Tipo de Golpe.");
        if (!form.numero_mediciones_id) throw new Error("Selecciona el Número de Mediciones.");
        if (!form.medicion_C1)          throw new Error("La medición C1 es obligatoria.");
        if (!form.medicion_C2)          throw new Error("La medición C2 es obligatoria.");
        if (!form.medicion_C3)          throw new Error("La medición C3 es obligatoria.");

        await updatePaso6Deformacion(incidenteUuid, {
          tipo_golpe_id        : Number(form.tipo_golpe_id),
          numero_mediciones_id : Number(form.numero_mediciones_id),
          c1_m                 : Number(form.medicion_C1),
          c2_m                 : Number(form.medicion_C2),
          c3_m                 : Number(form.medicion_C3),
          c4_m                 : form.medicion_C4 ? Number(form.medicion_C4) : null,
          c5_m                 : form.medicion_C5 ? Number(form.medicion_C5) : null,
          c6_m                 : form.medicion_C6 ? Number(form.medicion_C6) : null,
          l_ancho_contacto_m   : form.l_ancho_contacto_m ? Number(form.l_ancho_contacto_m) : null,
          angulo_fpi_grados    : form.angulo_fpi_grados  ? Number(form.angulo_fpi_grados) : null,
        });

      // ── PASO 6: Cálculo ──
      } else if (step === 6) {
        await storePaso7Calculo(incidenteUuid, {
          a_rigidez_n_m              : form.a_rigidez_n_m              ? Number(form.a_rigidez_n_m) : null,
          b_rigidez_n_m2             : form.b_rigidez_n_m2             ? Number(form.b_rigidez_n_m2) : null,
          dmed_m                     : form.dmed_m                     ? Number(form.dmed_m) : null,
          tiempo_respuesta_frenos_s  : form.tiempo_respuesta_frenos_s  ? Number(form.tiempo_respuesta_frenos_s) : null,
          velocidad_final_kmh        : form.velocidad_final_kmh        ? Number(form.velocidad_final_kmh) : null,
          e_deformacion_julios       : form.e_deformacion_julios       ? Number(form.e_deformacion_julios) : null,
          e_def_corregida_julios     : form.e_def_corregida_julios     ? Number(form.e_def_corregida_julios) : null,
          ebs_m_s                    : form.ebs_m_s                    ? Number(form.ebs_m_s) : null,
          velocidad_impacto_kmh      : form.velocidad_impacto_kmh      ? Number(form.velocidad_impacto_kmh) : null,
          velocidad_pre_impacto_kmh  : form.velocidad_pre_impacto_kmh  ? Number(form.velocidad_pre_impacto_kmh) : null,
          velocidad_limpert_kmh      : form.velocidad_limpert_kmh      ? Number(form.velocidad_limpert_kmh) : null,
          delta_exceso_kmh           : form.delta_exceso_kmh           ? Number(form.delta_exceso_kmh) : null,
        });

      // ── PASO 7: Narrativa ──
      } else if (step === 7) {
        await updatePaso8Narrativa(incidenteUuid, {
          narracion_hechos            : form.narracion_hechos || null,
          objeto_involucrado          : form.objeto_involucrado || null,
          descripcion_objeto_fijo     : form.descripcion_objeto_fijo || null,
          posicion_final_vehiculo     : form.posicion_final_vehiculo || null,
          direccion_circulacion       : form.direccion_circulacion || null,
          distancia_ppr_al_pc_m       : form.distancia_ppr_al_pc_m ? Number(form.distancia_ppr_al_pc_m) : null,
          tiempo_reaccion_conductor_s : form.tiempo_reaccion_conductor_s ? Number(form.tiempo_reaccion_conductor_s) : null,
          huellas_derrape_m           : form.huellas_derrape_m ? Number(form.huellas_derrape_m) : null,
        });

      // ── PASO 8: Reporte (último paso) ──
      } else if (step === 8) {
        await updatePaso9Reporte(incidenteUuid, {
          principio_intercambio_materiales : form.principio_intercambio_materiales || null,
          principio_correspondencia        : form.principio_correspondencia || null,
          tipo_documento                   : form.tipo_documento || "informe",
          accion                           : form.accion || "guardar",
        });
        navigate("/expedientes");
        return;
      }

      // Avanzar al siguiente paso
      setStep((s) => Math.min(s + 1, STEPS.length - 1));

    } catch (err) {
      setSaveError(err?.message || "No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [step, form, incidenteUuid, navigate]);

  const STEP_COMPONENTS = [
    <StepIncidente   key="incidente" />,
    <StepVehiculo    key="vehiculo" />,
    <StepOcupantes   key="ocupantes" />,
    <StepVia         key="via" />,
    <StepEvidencia   key="evidencia" />,
    <StepDeformacion key="deformacion" />,
    <StepCalculo     key="calculo" />,
    <StepNarrativa   key="narrativa" />,
    <StepReporte     key="reporte" />,
  ];

  const isLast = step === STEPS.length - 1;

  return (
    <FormCtx.Provider value={{ form, setField, cats, peritos }}>
      <div className="p-4 flex flex-col gap-4">

        {/* Stepper */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-3">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <button onClick={() => i <= step && setStep(i)} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                      ${i < step ? "text-white" : i === step ? "text-white ring-2 ring-offset-1" : "bg-gray-100 text-gray-400"}`}
                    style={{ backgroundColor: i <= step ? "#00ADCF" : undefined }}
                  >
                    {i < step ? <Check size={13} /> : i + 1}
                  </div>
                  <span className={`text-xs whitespace-nowrap ${i === step ? "text-[#00ADCF] font-medium" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2 mt-[-12px]"
                    style={{ backgroundColor: i < step ? "#00ADCF" : "#E5E7EB" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenido del paso */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-500 rounded-t flex items-center justify-between">
            <span className="text-white text-sm">| {STEPS[step].label}</span>
            {incidenteUuid && (
              <span className="text-[11px] bg-white/20 text-white rounded px-2 py-0.5">
                ✓ {incidenteUuid}
              </span>
            )}
          </div>
          <div className="p-4">{STEP_COMPONENTS[step]}</div>
        </div>

        {/* Error */}
        {saveError && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {saveError}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/expedientes")}
            className="px-4 py-2 text-xs border border-gray-300 rounded text-gray-600 hover:border-red-400 hover:text-red-600">
            Cancelar
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 px-3 py-2 text-xs border border-gray-300 rounded text-gray-600 disabled:opacity-40 hover:border-[#00ADCF]"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-2 text-xs rounded text-white disabled:opacity-50"
              style={{ backgroundColor: isLast ? "#10B981" : "#00ADCF" }}
            >
              {saving ? "Guardando..." : isLast ? "Finalizar expediente" : "Guardar y continuar"}
              {!isLast && <ChevronRight size={14} />}
            </button>
          </div>
        </div>

      </div>
    </FormCtx.Provider>
  );
}