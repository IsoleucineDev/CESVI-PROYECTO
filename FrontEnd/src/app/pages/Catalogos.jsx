import React, { useState } from "react";
import { Edit2, LayoutGrid, Plus, RotateCcw, X, Trash2 } from "lucide-react";
import { useCatalogoEntorno } from "../../hooks/useCatalogoEntorno";

const CLIMA_OPTIONS    = ["soleado","nublado","lluvia_ligera","lluvia_fuerte","niebla","granizo","nieve","otro"];
const VIA_OPTIONS      = ["autopista","carretera_federal","carretera_estatal","avenida","calle","callejón","otro"];
const SUPERFICIE_OPTIONS = ["asfalto","concreto","terracería","grava","adoquín","otro"];
const ILUMINACION_OPTIONS = ["diurna","nocturna_iluminada","nocturna_sin_iluminar","atardecer"];
const VISIBILIDAD_OPTIONS = ["excelente","buena","regular","mala","muy_mala"];

const EMPTY_FORM = { clima: "", tipo_via: "", superficie: "", iluminacion: "", visibilidad: "", observaciones: "" };

function Modal({ onClose, editRow, onSave, saving, error }) {
  const [form, setForm] = useState(editRow || EMPTY_FORM);
  const isEdit = !!editRow;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const result = await onSave(form);
    if (result.ok) onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-xl w-full max-w-lg border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              {isEdit ? "Editar Entorno" : "Nuevo Entorno"}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>

          <div className="px-4 py-4 grid grid-cols-2 gap-4">
            {error && (
              <div className="col-span-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-600 mb-1">Clima <span className="text-red-500">*</span></label>
              <select className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white"
                value={form.clima} onChange={(e) => set("clima", e.target.value)}>
                <option value="">Seleccionar...</option>
                {CLIMA_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Tipo de Vía <span className="text-red-500">*</span></label>
              <select className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white"
                value={form.tipo_via} onChange={(e) => set("tipo_via", e.target.value)}>
                <option value="">Seleccionar...</option>
                {VIA_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Superficie <span className="text-red-500">*</span></label>
              <select className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white"
                value={form.superficie} onChange={(e) => set("superficie", e.target.value)}>
                <option value="">Seleccionar...</option>
                {SUPERFICIE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Iluminación <span className="text-red-500">*</span></label>
              <select className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white"
                value={form.iluminacion} onChange={(e) => set("iluminacion", e.target.value)}>
                <option value="">Seleccionar...</option>
                {ILUMINACION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Visibilidad <span className="text-red-500">*</span></label>
              <select className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white"
                value={form.visibilidad} onChange={(e) => set("visibilidad", e.target.value)}>
                <option value="">Seleccionar...</option>
                {VISIBILIDAD_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Observaciones</label>
              <textarea
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] h-14 resize-none"
                value={form.observaciones || ""}
                onChange={(e) => set("observaciones", e.target.value)}
                placeholder="Observaciones opcionales..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button onClick={onClose} className="px-4 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:border-gray-400">
              CANCELAR
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-1.5 text-xs rounded text-white disabled:opacity-60"
              style={{ backgroundColor: "#00ADCF" }}>
              {saving ? "GUARDANDO..." : "GUARDAR"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Catalogos() {
  const { entorno, loading, error, load, add, edit, remove } = useCatalogoEntorno();
  const [showModal, setShowModal] = useState(false);
  const [editRow, setEditRow]     = useState(null);
  const [saving, setSaving]       = useState(false);

  const openNew  = () => { setEditRow(null); setShowModal(true); };
  const openEdit = (row) => { setEditRow(row); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditRow(null); };

  const handleSave = async (form) => {
    setSaving(true);
    const result = editRow ? await edit(editRow.id, form) : await add(form);
    setSaving(false);
    return result;
  };

  const handleDelete = async (id) => {
    await remove(id);
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-t" style={{ backgroundColor: "#9E9E9E" }}>
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-white" />
            <span className="text-white text-sm">| Catálogo de Entorno</span>
            <span className="bg-red-500 text-white text-xs px-1.5 rounded-full leading-none py-px">
              {entorno.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openNew} className="text-white hover:text-gray-200" title="Agregar registro">
              <Plus size={18} />
            </button>
            <button onClick={load} className="text-white hover:text-gray-200" title="Refrescar">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
          {loading ? (
            <div className="p-4 text-sm text-gray-500">Cargando catálogo...</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600">{error}</div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs text-gray-500 px-4 py-2 w-12">#</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500">Clima</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500">Tipo Vía</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500">Superficie</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500">Iluminación</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500">Visibilidad</th>
                  <th className="px-3 py-2 text-left text-xs text-gray-500">Observaciones</th>
                  <th className="px-3 py-2 text-xs text-gray-500 text-right w-20">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {entorno.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs text-gray-500">{row.id}</td>
                    <td className="px-3 py-2 text-xs text-gray-700">{row.clima}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{row.tipo_via}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{row.superficie}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{row.iluminacion}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{row.visibilidad}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{row.observaciones || "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(row)} className="text-[#00ADCF] hover:text-[#007A9A]" title="Editar">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700" title="Eliminar">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!entorno.length && (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-sm text-gray-500">
                      No hay registros en el catálogo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <Modal
          onClose={closeModal}
          editRow={editRow}
          onSave={handleSave}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}
