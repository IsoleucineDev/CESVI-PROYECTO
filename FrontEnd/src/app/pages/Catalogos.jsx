import React, { useEffect, useState } from "react";
import { Edit2, LayoutGrid, Plus, RotateCcw, X, HelpCircle } from "lucide-react";
import { getCatalogos, getPeritos } from "../../services/catalogosService";

const CATALOGO_MAP = [
  { label: "Tipos de Hecho",               key: "tipos_hecho" },
  { label: "Tipos de Vía",                  key: "tipos_via" },
  { label: "Tipos de Trazo",               key: "tipos_trazo" },
  { label: "Tipos de Intersección",         key: "tipos_interseccion" },
  { label: "Señalamientos Vertical",        key: "senalamientos_vertical" },
  { label: "Señalamientos Horizontal",      key: "senalamientos_horizontal" },
  { label: "Condiciones de Superficie",     key: "condiciones_superficie" },
  { label: "Condiciones de Pavimento",      key: "condiciones_pavimento" },
  { label: "Tipos de Pavimento",            key: "tipos_pavimento" },
  { label: "Climas",                        key: "climas" },
  { label: "Orientaciones de Vía",          key: "orientaciones_via" },
  { label: "Sentidos de Vialidad",          key: "sentidos_vialidad" },
  { label: "Estados de Neumático",          key: "estados_neumatico" },
  { label: "Colores",                       key: "colores" },
  { label: "Tipos de Foto",                 key: "tipos_foto" },
  { label: "Tipos de Golpe",               key: "tipos_golpe" },
  { label: "Número de Mediciones",          key: "numeros_mediciones" },
  { label: "Tipos de Indicio",              key: "tipos_indicio" },
  { label: "Posiciones Iniciales",          key: "posiciones_iniciales" },
  { label: "Percepciones Real",             key: "percepciones_real" },
  { label: "Puntos Clave",                  key: "puntos_clave" },
  { label: "Trayectorias Post",             key: "trayectorias_post" },
  { label: "Zonas de Vehículo",             key: "zonas_vehiculo" },
  { label: "Tipos de Daño",                key: "tipos_dano" },
  { label: "Cuerpos Generador",             key: "cuerpos_generador" },
  { label: "Direcciones de Daño",          key: "direcciones_dano" },
  { label: "Consecuencias de Daño",        key: "consecuencias_dano" },
  { label: "Partes de Vehículo",            key: "partes_vehiculo" },
  { label: "Peritos Registrados",           key: "__peritos__" },
];

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function Modal({ onClose, editRow, catName }) {
  const isEdit = !!editRow;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-xl w-full max-w-lg border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              {isEdit ? "Ver Registro" : "Nuevo Registro"} – {catName}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <div className="px-4 py-4 flex flex-col gap-3">
            {editRow && Object.entries(editRow).map(([k, v]) => (
              <div key={k}>
                <label className="block text-xs text-gray-500 mb-1 capitalize">{k.replace(/_/g, " ")}</label>
                <div className="px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-gray-50 text-gray-700">
                  {v === null || v === undefined ? "—" : String(v)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button onClick={onClose} className="px-4 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:border-gray-400">
              CERRAR
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function renderCellValue(val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Sí" : "No";
  return String(val);
}

export default function Catalogos() {
  const [catSelected, setCatSelected] = useState(CATALOGO_MAP[0].key);
  const [allData,     setAllData]     = useState({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [showModal,   setShowModal]   = useState(false);
  const [editRow,     setEditRow]     = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [cats, peritos] = await Promise.all([getCatalogos(), getPeritos()]);
      setAllData({ ...cats, __peritos__: peritos });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar catálogos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const rows   = allData[catSelected] ?? [];
  const cols   = rows.length > 0 ? Object.keys(rows[0]) : [];
  const catLabel = CATALOGO_MAP.find((c) => c.key === catSelected)?.label ?? catSelected;

  const openEdit = (row) => { setEditRow(row); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditRow(null); };

  return (
    <div className="p-4 flex flex-col gap-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-xs text-red-700">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded shadow-sm p-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-700">
            <span className="text-red-500">*</span>
            Catálogo
            <button title="Selecciona el catálogo a visualizar" className="text-gray-400 hover:text-[#00ADCF]">
              <HelpCircle size={13} />
            </button>
            :
          </label>
          <div className="relative">
            <select
              className="pl-2.5 pr-8 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white appearance-none min-w-[220px]"
              value={catSelected}
              onChange={(e) => setCatSelected(e.target.value)}
              disabled={loading}
            >
              {CATALOGO_MAP.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <button onClick={loadAll} className="p-1.5 rounded text-white" style={{ backgroundColor: "#00ADCF" }} title="Recargar catálogos" disabled={loading}>
            <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-t" style={{ backgroundColor: "#9E9E9E" }}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <LayoutGrid size={18} className="text-white" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs px-1 rounded-full leading-none py-px">
                {loading ? "…" : rows.length}
              </span>
            </div>
            <span className="text-white text-sm">| {catLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="text-white hover:text-gray-200" title="Refrescar" disabled={loading}>
              <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200">
                {loading
                  ? ["#", "Campo 1", "Campo 2", "Campo 3", "Acciones"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 px-3 py-2 whitespace-nowrap">{h}</th>
                    ))
                  : cols.map((c) => (
                      <th key={c} className="text-left text-xs text-gray-500 px-3 py-2 whitespace-nowrap capitalize">
                        {c.replace(/_/g, " ")}
                      </th>
                    )).concat(
                      <th key="__actions" className="text-right text-xs text-gray-500 px-3 py-2 w-16">Acciones</th>
                    )}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-3 py-2"><Skeleton className="h-3 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : rows.length === 0
                  ? (
                    <tr>
                      <td colSpan={cols.length + 1} className="px-4 py-8 text-center text-xs text-gray-400">
                        No hay registros en este catálogo.
                      </td>
                    </tr>
                  )
                  : rows.map((row, i) => (
                    <tr key={row.id ?? i} className="border-b border-gray-100 hover:bg-gray-50">
                      {cols.map((c) => (
                        <td key={c} className="px-3 py-2 text-xs text-gray-700 max-w-[200px] truncate">
                          {renderCellValue(row[c])}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(row)} className="text-[#00ADCF] hover:text-[#007A9A]" title="Ver detalle">
                            <Edit2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <Modal onClose={closeModal} editRow={editRow} catName={catLabel} />}
    </div>
  );
}
