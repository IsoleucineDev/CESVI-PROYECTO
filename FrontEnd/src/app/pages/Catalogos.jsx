import React, { useState } from "react";
import { Edit2, LayoutGrid, Plus, RotateCcw, X, HelpCircle } from "lucide-react";

const CATALOGOS_OPTIONS = [
  "Catálogo General",
  "Tipos de Hecho",
  "Tipos de Vía",
  "Estados del Análisis",
  "Peritos Registrados",
  "Pavimentos",
  "Condiciones de Superficie",
  "Categorías McHenry",
];

const CATALOGO_DATA = {
  "Catálogo General": [
    { id: 1, catalogo: "sys_elements", alias: "Sys Catálogo de elementos", tipo: "operation" },
    { id: 2, catalogo: "sys_attributes", alias: "Sys Catálogo de atributos de elementos", tipo: "operation" },
    { id: 3, catalogo: "sys_cat_tables", alias: "Sys Catálogo General", tipo: "operation" },
    { id: 4, catalogo: "sys_elements_attributes", alias: "Sys Elementos vs Atributos", tipo: "operation" },
    { id: 5, catalogo: "sys_menu", alias: "Sys Menu", tipo: "operation" },
    { id: 6, catalogo: "sys_cat_companys", alias: "Catálogo de companias", tipo: "operation" },
    { id: 7, catalogo: "sys_cat_rol", alias: "Catálogo de roles", tipo: "operation" },
    { id: 8, catalogo: "sys_attributes_columns", alias: "Sys Catalogo de atributos Columna", tipo: "operation" },
    { id: 9, catalogo: "sys_columns_attributes", alias: "Sys Columna vs atributos", tipo: "operation" },
    { id: 10, catalogo: "rat_tipos_hecho", alias: "RAT Tipos de hecho vial", tipo: "operation" },
    { id: 11, catalogo: "rat_tipos_via", alias: "RAT Tipos de vía", tipo: "operation" },
  ],
  "Tipos de Hecho": [
    { id: 1, catalogo: "colision_frontal", alias: "Colisión Frontal", tipo: "enum" },
    { id: 2, catalogo: "colision_lateral", alias: "Colisión Lateral", tipo: "enum" },
    { id: 3, catalogo: "colision_trasera", alias: "Colisión Trasera", tipo: "enum" },
    { id: 4, catalogo: "volcadura", alias: "Volcadura", tipo: "enum" },
    { id: 5, catalogo: "atropellamiento", alias: "Atropellamiento", tipo: "enum" },
    { id: 6, catalogo: "salida_camino", alias: "Salida de Camino", tipo: "enum" },
  ],
  "Tipos de Vía": [
    { id: 1, catalogo: "autopista", alias: "Autopista", tipo: "enum" },
    { id: 2, catalogo: "carretera_federal", alias: "Carretera Federal", tipo: "enum" },
    { id: 3, catalogo: "carretera_estatal", alias: "Carretera Estatal", tipo: "enum" },
    { id: 4, catalogo: "vialidad_primaria", alias: "Vialidad Urbana Primaria", tipo: "enum" },
    { id: 5, catalogo: "calle_secundaria", alias: "Calle Secundaria", tipo: "enum" },
  ],
};

function Modal({ onClose, editRow, catName }) {
  const isEdit = !!editRow;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-xl w-full max-w-lg border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              {isEdit ? "Editar Registro" : "Nuevo Registro"} – {catName}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          <div className="px-4 py-4 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">
                Catálogo (nombre interno) <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]"
                defaultValue={editRow?.catalogo || ""}
                placeholder="sys_nuevo_catalogo"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">
                Alias (descripción) <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]"
                defaultValue={editRow?.alias || ""}
                placeholder="Nombre legible del catálogo"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white"
                defaultValue={editRow?.tipo || "operation"}
              >
                <option value="operation">operation</option>
                <option value="enum">enum</option>
                <option value="lookup">lookup</option>
                <option value="config">config</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Estado</label>
              <select className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white">
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Descripción</label>
              <textarea
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] h-14 resize-none"
                placeholder="Descripción opcional del catálogo..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button onClick={onClose} className="px-4 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:border-gray-400">
              CANCELAR
            </button>
            <button onClick={onClose} className="px-4 py-1.5 text-xs rounded text-white" style={{ backgroundColor: "#00ADCF" }}>
              GUARDAR
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Catalogos() {
  const [catSelected, setCatSelected] = useState("Catálogo General");
  const [showModal, setShowModal] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const rows = CATALOGO_DATA[catSelected] || CATALOGO_DATA["Catálogo General"];

  const openNew = () => {
    setEditRow(null);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditRow(row);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditRow(null);
  };

  return (
    <div className="p-4 flex flex-col gap-3">
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
              className="pl-2.5 pr-8 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white appearance-none min-w-[180px]"
              value={catSelected}
              onChange={(e) => setCatSelected(e.target.value)}
            >
              {CATALOGOS_OPTIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <button className="p-1.5 rounded text-white" style={{ backgroundColor: "#00ADCF" }} title="Recargar catálogo">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-t" style={{ backgroundColor: "#9E9E9E" }}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <LayoutGrid size={18} className="text-white" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs px-1 rounded-full leading-none py-px">
                {rows.length}
              </span>
            </div>
            <span className="text-white text-sm">| {catSelected}</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={openNew} className="text-white hover:text-gray-200" title="Agregar registro">
              <Plus size={18} />
            </button>
            <button className="text-white hover:text-gray-200" title="Refrescar">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto" }}>
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs text-gray-500 px-4 py-2 w-12">#</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Catálogo</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Alias</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Tipo</th>
                <th className="px-3 py-2 text-xs text-gray-500 text-right w-20">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs text-gray-500">{row.id}</td>
                  <td className="px-3 py-2 text-xs text-gray-700">{row.catalogo}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{row.alias}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{row.tipo}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(row)} className="text-red-500 hover:text-red-700" title="Editar">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => openEdit(row)} className="text-red-400 hover:text-red-600" title="Ver registros">
                        <LayoutGrid size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <Modal onClose={closeModal} editRow={editRow} catName={catSelected} />}
    </div>
  );
}
