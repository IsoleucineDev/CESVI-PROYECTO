import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Trash2, RotateCcw } from "lucide-react";
import { deleteSiniestro, getSiniestros } from "../../services/siniestroService";

const ESTADO_BADGE = {
  captura_inicial: "bg-blue-100 text-blue-700",
  en_revision: "bg-yellow-100 text-yellow-700",
  completado: "bg-green-100 text-green-700",
  rechazado: "bg-red-100 text-red-700",
  analisis_danos: "bg-cyan-100 text-cyan-700",
  dinamica_colision: "bg-indigo-100 text-indigo-700",
  conclusiones: "bg-purple-100 text-purple-700",
  reporte_final: "bg-emerald-100 text-emerald-700",
};

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

export default function Expedientes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await getSiniestros();
      const payload = response?.data?.data || response?.data || [];
      setRows(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudieron cargar los expedientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((item) => {
      const values = [
        item.numero_siniestro,
        item.tipo_accidente,
        item.perito_nombre,
        item.ubicacion_calle,
        item.ubicacion_ciudad,
        item.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return values.includes(term);
    });
  }, [rows, search]);

  async function handleDelete(id) {
    const confirmed = window.confirm("¿Eliminar este expediente?");
    if (!confirmed) return;

    try {
      await deleteSiniestro(id);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "No se pudo eliminar el expediente");
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-gray-800">Expedientes RAT</div>
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
          <button onClick={load} className="px-3 py-2 text-xs border border-gray-300 rounded text-gray-600 hover:border-[#00ADCF] flex items-center gap-1">
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
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs text-gray-500 px-4 py-2">Expediente</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Fecha</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Hora</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Tipo</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Perito</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Ciudad</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Estado</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-xs text-[#00ADCF] font-medium">
                      {item.numero_siniestro || `SIN-${item.id}`}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">{formatDate(item.fecha_hora_siniestro)}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{formatTime(item.fecha_hora_siniestro)}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{item.tipo_accidente || "—"}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{item.perito_nombre || "—"}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{item.ubicacion_ciudad || "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[item.estado] || "bg-gray-100 text-gray-700"}`}>
                        {(item.estado || "sin_estado").replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/expedientes/${item.id}`)}
                          className="text-[#00ADCF] hover:text-[#007A9A]"
                          title="Ver detalle"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredRows.length && (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-sm text-gray-500">
                      No se encontraron expedientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}