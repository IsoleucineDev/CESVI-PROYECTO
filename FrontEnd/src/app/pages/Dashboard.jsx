import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
// ✅ CORREGIDO: Se importa el hook real que conecta con la API.
import { useDashboard } from "../../hooks/useDashboard";

const PIE_COLORS = ["#00ADCF", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];

const ACCESOS_RAPIDOS = [
  { label: "Nuevo Expediente", path: "/expedientes/nuevo", icon: <Plus size={18} />, color: "#00ADCF" },
  { label: "Ver Expedientes",  path: "/expedientes",        icon: <FileText size={18} />, color: "#6366F1" },
  { label: "Catálogos",        path: "/configuracion/catalogos", icon: <TrendingUp size={18} />, color: "#10B981" },
];

const ESTADO_BADGE = {
  captura_inicial:   "bg-blue-100 text-blue-700",
  en_revision:       "bg-yellow-100 text-yellow-700",
  completado:        "bg-green-100 text-green-700",
  rechazado:         "bg-red-100 text-red-700",
  analisis_danos:    "bg-cyan-100 text-cyan-700",
  dinamica_colision: "bg-indigo-100 text-indigo-700",
  conclusiones:      "bg-purple-100 text-purple-700",
  reporte_final:     "bg-emerald-100 text-emerald-700",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-MX");
}

export default function Dashboard() {
  const navigate = useNavigate();
  // ✅ CORREGIDO: Se usa el hook real. Antes los datos eran 100% hardcoded.
  const { dashboard, loading, error, load } = useDashboard();

  // Construye las KPI cards con datos reales del backend
  const kpiCards = [
    {
      label: "Total Siniestros",
      value: dashboard?.data?.total_siniestros ?? "—",
      icon: <FileText size={20} />,
      color: "#00ADCF",
      bg: "#E0F7FA",
    },
    {
      label: "En Revisión",
      value: dashboard?.data?.estado_en_revision ?? "—",
      icon: <Clock size={20} />,
      color: "#F59E0B",
      bg: "#FEF3C7",
    },
    {
      label: "Finalizados",
      value: dashboard?.data?.estado_completados ?? "—",
      icon: <CheckCircle size={20} />,
      color: "#10B981",
      bg: "#D1FAE5",
    },
    {
      label: "Abiertos",
      value: dashboard?.data?.estado_abiertos ?? "—",
      icon: <AlertTriangle size={20} />,
      color: "#EF4444",
      bg: "#FEE2E2",
    },
  ];

  // Datos reales de la gráfica de pie (por tipo de accidente)
  const pieData = dashboard?.data?.por_tipo ?? [];

  // Últimos siniestros reales
  const ultimosSiniestros = dashboard?.data?.ultimos_siniestros ?? [];

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

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center gap-3"
          >
            <div
              className="rounded-lg p-2.5"
              style={{ backgroundColor: card.bg, color: card.color }}
            >
              {card.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{card.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gráficas ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Pie — Tipos de accidente */}
        <div className="col-span-1 bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Por tipo de accidente</div>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-xs text-gray-400">
              Sin datos aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
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

        {/* Últimos siniestros */}
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

          {ultimosSiniestros.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-xs text-gray-400">
              No hay expedientes registrados aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs text-gray-400 pb-2 font-normal">Expediente</th>
                    <th className="text-left text-xs text-gray-400 pb-2 font-normal">Fecha</th>
                    <th className="text-left text-xs text-gray-400 pb-2 font-normal">Tipo</th>
                    <th className="text-left text-xs text-gray-400 pb-2 font-normal">Perito</th>
                    <th className="text-left text-xs text-gray-400 pb-2 font-normal">Estado</th>
                    <th className="text-left text-xs text-gray-400 pb-2 font-normal"></th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosSiniestros.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 text-xs text-[#00ADCF] font-medium">
                        {item.numero_siniestro || `SIN-${item.id}`}
                      </td>
                      <td className="py-2 text-xs text-gray-600">
                        {formatDate(item.fecha_hora_siniestro)}
                      </td>
                      <td className="py-2 text-xs text-gray-600">
                        {(item.tipo_accidente || "—").replaceAll("_", " ")}
                      </td>
                      <td className="py-2 text-xs text-gray-600">
                        {item.perito_nombre || "—"}
                      </td>
                      <td className="py-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            ESTADO_BADGE[item.estado] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {(item.estado || "sin_estado").replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => navigate(`/expedientes/${item.id}`)}
                          className="text-[#00ADCF] hover:text-[#007A9A]"
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Accesos rápidos ──────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="text-sm font-medium text-gray-700 mb-3">Accesos rápidos</div>
        <div className="flex gap-3">
          {ACCESOS_RAPIDOS.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="flex items-center gap-2 px-4 py-2 rounded border border-gray-200 text-xs text-gray-700 hover:border-[#00ADCF] hover:text-[#00ADCF] transition-colors"
            >
              <span style={{ color: a.color }}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
