import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, Eye, TrendingUp } from "lucide-react";
import { getDashboard } from "../../services/dashboardService";

const PIE_COLORS = ["#00ADCF", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];
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

const ACCESOS_RAPIDOS = [
  { label: "Nuevo Expediente", path: "/expedientes/nuevo", icon: <Plus size={18} />, color: "#00ADCF" },
  { label: "Ver Expedientes", path: "/expedientes", icon: <FileText size={18} />, color: "#6366F1" },
  { label: "Catálogos", path: "/configuracion/catalogos", icon: <TrendingUp size={18} />, color: "#10B981" },
];

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-MX");
}

function normalizeEstadoLabel(value) {
  return (value || "sin estado").replaceAll("_", " ");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await getDashboard();
        if (!active) return;
        setDashboard(response?.data || null);
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || err?.message || "No se pudo cargar el dashboard");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const recentItems = dashboard?.ultimos_siniestros || [];

  const kpiCards = useMemo(() => {
    const abiertos = dashboard?.estado_abiertos || 0;
    const completados = dashboard?.estado_completados || 0;
    const total = dashboard?.total_siniestros || 0;
    const revision = recentItems.filter((item) => item.estado === "en_revision").length;

    return [
      { label: "Casos Totales", value: total, icon: <FileText size={20} />, color: "#00ADCF", bg: "#E0F7FA" },
      { label: "Abiertos", value: abiertos, icon: <Clock size={20} />, color: "#F59E0B", bg: "#FEF3C7" },
      { label: "Finalizados", value: completados, icon: <CheckCircle size={20} />, color: "#10B981", bg: "#D1FAE5" },
      { label: "En revisión", value: revision, icon: <AlertTriangle size={20} />, color: "#EF4444", bg: "#FEE2E2" },
    ];
  }, [dashboard, recentItems]);

  const barData = useMemo(() => {
    const grouped = new Map();
    for (const item of recentItems) {
      const raw = item.fecha_hora_siniestro || item.created_at;
      const date = raw ? new Date(raw) : null;
      const key =
        date && !Number.isNaN(date.getTime())
          ? date.toLocaleDateString("es-MX", { month: "short" })
          : "Sin fecha";
      grouped.set(key, (grouped.get(key) || 0) + 1);
    }
    return [...grouped.entries()].map(([mes, casos]) => ({ mes, casos }));
  }, [recentItems]);

  const pieData = useMemo(() => {
    const grouped = new Map();
    for (const item of recentItems) {
      const key = item.tipo_accidente || "Sin tipo";
      grouped.set(key, (grouped.get(key) || 0) + 1);
    }
    return [...grouped.entries()].map(([name, value]) => ({ name, value }));
  }, [recentItems]);

  if (loading) {
    return <div className="p-4 text-sm text-gray-600">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center gap-3">
            <div className="rounded-lg p-2.5" style={{ backgroundColor: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-800">{card.value}</div>
              <div className="text-xs text-gray-500">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="text-sm text-gray-700 mb-3 border-b border-gray-100 pb-2">Siniestros recientes por mes</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 4 }} />
              <Bar dataKey="casos" fill="#00ADCF" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="text-sm text-gray-700 mb-3 border-b border-gray-100 pb-2">Tipo de hecho</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-gray-200 rounded shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="text-sm text-gray-700">Siniestros recientes</span>
            <button onClick={() => navigate("/expedientes")} className="text-xs text-[#00ADCF] hover:underline flex items-center gap-1">
              <Eye size={13} /> Ver todos
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs text-gray-500 px-4 py-2">Expediente</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Fecha</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Tipo</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Perito</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((exp) => (
                  <tr
                    key={exp.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/expedientes/${exp.id}`)}
                  >
                    <td className="px-4 py-2 text-xs text-[#00ADCF] font-medium">
                      {exp.numero_siniestro || `SIN-${exp.id}`}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {formatDateTime(exp.fecha_hora_siniestro || exp.created_at)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">{exp.tipo_accidente || "—"}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{exp.perito_nombre || "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[exp.estado] || "bg-gray-100 text-gray-700"}`}>
                        {normalizeEstadoLabel(exp.estado)}
                      </span>
                    </td>
                  </tr>
                ))}
                {!recentItems.length && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                      No hay siniestros recientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="text-sm text-gray-700 mb-3 border-b border-gray-100 pb-2">Accesos rápidos</div>
            <div className="flex flex-col gap-2">
              {ACCESOS_RAPIDOS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded border border-gray-200 text-gray-700 hover:border-[#00ADCF] hover:text-[#00ADCF] transition-colors text-xs"
                >
                  <span style={{ color: item.color }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="text-sm text-gray-700 mb-2 border-b border-gray-100 pb-2">Resumen</div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Total", val: dashboard?.total_siniestros || 0, color: "#00ADCF" },
                { label: "Abiertos", val: dashboard?.estado_abiertos || 0, color: "#F59E0B" },
                { label: "Finalizados", val: dashboard?.estado_completados || 0, color: "#10B981" },
                { label: "Últimos cargados", val: recentItems.length, color: "#6366F1" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-medium" style={{ color: r.color }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}