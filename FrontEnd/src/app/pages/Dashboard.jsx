import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  FileText, Clock, CheckCircle, AlertTriangle,
  Plus, Eye, TrendingUp, RotateCcw,
} from "lucide-react";
import { useDashboard } from "../../hooks/useDashboard";

const PIE_COLORS = ["#00ADCF", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];

const ACCESOS_RAPIDOS = [
  { label: "Nuevo Expediente", path: "/expedientes/nuevo",       icon: <Plus size={18} />,      color: "#00ADCF" },
  { label: "Ver Expedientes",  path: "/expedientes",              icon: <FileText size={18} />,  color: "#6366F1" },
  { label: "Catálogos",        path: "/configuracion/catalogos",  icon: <TrendingUp size={18} />, color: "#10B981" },
];

// Estado numérico → etiqueta y color
const ESTADO_BADGE = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
};
const ESTADO_LABEL = { 0: "Abierto", 1: "En revisión", 2: "Finalizado" };

function formatFecha(val) {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d) ? val : d.toLocaleDateString("es-MX");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboard, loading, error, load } = useDashboard();

  // ── El backend devuelve:
  // {
  //   contadores: { casos_abiertos, en_revision, finalizados, exceso_velocidad },
  //   expedientes_por_mes: [{ mes, total }],
  //   por_tipo_hecho: [{ nombre, total }],
  //   expedientes_recientes: [{ uuid, numero_siniestro, fecha_hecho, hora_hecho,
  //                             estado, tipo_hecho, vehiculo,
  //                             velocidad_final_kmh, exceso_velocidad }],
  //   resumen_mes: { nuevos_casos, cerrados, con_exceso_velocidad, pendiente_revision }
  // }

  const contadores = dashboard?.contadores ?? {};
  const barData    = (dashboard?.expedientes_por_mes ?? []).map((r) => ({ mes: r.mes, casos: r.total }));
  const pieData    = (dashboard?.por_tipo_hecho ?? []).map((r) => ({ name: r.nombre, value: r.total }));
  const recientes  = dashboard?.expedientes_recientes ?? [];
  const resumen    = dashboard?.resumen_mes ?? {};

  const kpiCards = [
    { label: "Casos Abiertos",     value: contadores.casos_abiertos,   icon: <FileText size={20} />,     color: "#00ADCF", bg: "#E0F7FA" },
    { label: "En Revisión",         value: contadores.en_revision,       icon: <Clock size={20} />,        color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Finalizados",         value: contadores.finalizados,       icon: <CheckCircle size={20} />,  color: "#10B981", bg: "#D1FAE5" },
    { label: "Exceso de Velocidad", value: contadores.exceso_velocidad,  icon: <AlertTriangle size={20} />, color: "#EF4444", bg: "#FEE2E2" },
  ];

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-64 text-sm text-gray-500">
        Cargando dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-1 px-3 py-2 text-xs border border-gray-300 rounded hover:border-[#00ADCF]"
        >
          <RotateCcw size={13} /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center gap-3">
            <div className="rounded-lg p-2.5" style={{ backgroundColor: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{card.value ?? "0"}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gráficas ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Pie — tipos de hecho */}
        <div className="col-span-1 bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Por tipo de hecho</div>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-xs text-gray-400">Sin datos aún</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" labelLine={false}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tabla — expedientes recientes */}
        <div className="col-span-2 bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">Últimos expedientes</div>
            <button
              onClick={() => navigate("/expedientes")}
              className="text-xs text-[#00ADCF] hover:underline flex items-center gap-1"
            >
              <Eye size={12} /> Ver todos
            </button>
          </div>

          {recientes.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-xs text-gray-400">
              No hay expedientes registrados aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Expediente", "Fecha", "Tipo", "Vehículo", "Estado", "Vel.", "Exceso"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-400 pb-2 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((item) => (
                    <tr
                      key={item.uuid}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/expedientes/${item.uuid}`)}
                    >
                      <td className="py-2 pr-3 text-xs text-[#00ADCF] font-medium">
                        {item.numero_siniestro || item.uuid}
                      </td>
                      <td className="py-2 pr-3 text-xs text-gray-600">
                        {formatFecha(item.fecha_hecho)}
                      </td>
                      <td className="py-2 pr-3 text-xs text-gray-600">
                        {item.tipo_hecho || "—"}
                      </td>
                      <td className="py-2 pr-3 text-xs text-gray-600">
                        {item.vehiculo || "—"}
                      </td>
                      <td className="py-2 pr-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[item.estado] || "bg-gray-100 text-gray-700"}`}>
                          {ESTADO_LABEL[item.estado] ?? "—"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-xs text-gray-600">
                        {item.velocidad_final_kmh ? `${item.velocidad_final_kmh} km/h` : "—"}
                      </td>
                      <td className="py-2 text-xs">
                        {item.exceso_velocidad === 1
                          ? <span className="text-red-600 font-medium">Sí</span>
                          : item.exceso_velocidad === 0
                          ? <span className="text-gray-400">No</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Bar chart + Resumen del mes ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Expedientes por mes</div>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-xs text-gray-400">Sin datos aún</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="casos" fill="#00ADCF" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {/* Resumen del mes */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4 flex-1">
            <div className="text-sm font-medium text-gray-700 mb-3">Resumen del mes</div>
            <div className="flex flex-col gap-2">
              {[
                { label: "Nuevos casos",       val: resumen.nuevos_casos,         color: "#00ADCF" },
                { label: "Cerrados",            val: resumen.cerrados,             color: "#10B981" },
                { label: "Con exceso vel.",     val: resumen.con_exceso_velocidad, color: "#EF4444" },
                { label: "Pendiente revisión",  val: resumen.pendiente_revision,   color: "#F59E0B" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">{r.label}</span>
                  <span className="font-semibold" style={{ color: r.color }}>{r.val ?? "0"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Accesos rápidos</div>
            <div className="flex flex-col gap-2">
              {ACCESOS_RAPIDOS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-2 px-3 py-2 rounded border border-gray-200 text-xs text-gray-700 hover:border-[#00ADCF] hover:text-[#00ADCF] transition-colors"
                >
                  <span style={{ color: a.color }}>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
