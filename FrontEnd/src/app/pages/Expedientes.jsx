import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Trash2, RotateCcw } from "lucide-react";
// CORREGIDO: Importación sin espacios y ruta correcta
import { useSiniestros } from "../../hooks/useSiniestros";

const ESTADO_BADGE = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
};

const ESTADO_LABEL = {
  0: "Abierto",
  1: "En revisión",
  2: "Finalizado",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-MX");
}

export default function Expedientes() {
  const navigate = useNavigate();
  // Se obtienen las funciones del hook. load y filteredRows ya vienen procesadas.
  const { loading, error, search, setSearch, filteredRows, load, remove } = useSiniestros();

  async function handleDelete(uuid) {
    const result = await remove(uuid);
    if (!result.ok && result.error) alert(result.error);
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-gray-800">Expedientes RAT</div>
          <div className="text-xs text-gray-500 mt-0.5">Consulta y administra los siniestros registrados</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar expediente..."
              className="w-64 pl-8 pr-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]"
            />
          </div>
          <button onClick={() => load()} className="px-3 py-2 text-xs border border-gray-300 rounded text-gray-600 hover:border-[#00ADCF] flex items-center gap-1">
            <RotateCcw size={13} /> Actualizar
          </button>
          <button
            onClick={() => navigate("/expedientes/nuevo")}
            className="px-3 py-2 text-xs rounded text-white flex items-center gap-1"
            style={{ backgroundColor: "#00ADCF" }}
          >
            <Plus size={13} /> Nuevo expediente
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Cargando expedientes...</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600 font-medium">Error: {error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs text-gray-500 px-4 py-2">Expediente</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Fecha</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Tipo de Hecho</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Perito</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Vehículo</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Estado</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item) => (
                  <tr key={item.uuid} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs text-[#00ADCF] font-medium">
                      {item.numero_siniestro || item.uuid.substring(0,8)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">{formatDate(item.fecha_hecho)}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{item.tipo_hecho || "—"}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{item.perito_nombre || "—"}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{item.vehiculo_resumen || "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[item.estado] || "bg-gray-100 text-gray-700"}`}>
                        {ESTADO_LABEL[item.estado] ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/expedientes/${item.uuid}`)}
                          className="text-[#00ADCF] hover:text-[#007A9A]"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.uuid)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}