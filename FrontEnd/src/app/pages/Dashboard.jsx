import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, Eye, TrendingUp, RefreshCw } from "lucide-react";
import { useDashboard } from "../../hooks/useDashboard";

const PIE_COLORS = ["#00ADCF", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#3B82F6"];

const ACCESOS_RAPIDOS = [
  { label: "Nuevo Expediente", path: "/expedientes/nuevo", icon: <Plus size={18} />, color: "#00ADCF" },
  { label: "Ver Expedientes", path: "/expedientes", icon: <FileText size={18} />, color: "#6366F1" },
  { label: "Catálogos", path: "/configuracion/catalogos", icon: <TrendingUp size={18} />, color: "#10B981" },
];

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

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboard, loading, error, load } = useDashboard();

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw size={24} className="text-[#00ADCF] animate-spin" />
        <span className="text-gray-500 text-sm">Cargando métricas del Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle size={32} className="text-red-400" />
        <span className="text-red-500 text-sm">{error}</span>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-[#00ADCF] text-white rounded hover:bg-[#0095B3]">
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  const {
    contadores,
    expedientes_por_mes,
    por_tipo_hecho,
    expedientes_recientes,
    resumen_mes,
  } = dashboard || {};

  const KPI_CARDS = [
    { label: "Casos Abiertos", value: contadores?.casos_abiertos || 0, icon: <FileText size={20} />, color: "#00ADCF", bg: "#E0F7FA" },
    { label: "En Revisión", value: contadores?.en_revision || 0, icon: <Clock size={20} />, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Finalizados", value: contadores?.finalizados || 0, icon: <CheckCircle size={20} />, color: "#10B981", bg: "#D1FAE5" },
    { label: "Exceso de Velocidad", value: contadores?.exceso_velocidad || 0, icon: <AlertTriangle size={20} />, color: "#EF4444", bg: "#FEE2E2" },
  ];

  const BAR_DATA = expedientes_por_mes?.map((e) => ({ mes: e.mes, casos: e.total })) || [];
  const PIE_DATA = por_tipo_hecho?.map((t) => ({ name: t.nombre, value: t.total })) || [];

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => (
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
          <div className="text-sm text-gray-700 mb-3 border-b border-gray-100 pb-2">Expedientes por mes</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={BAR_DATA} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
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
              <Pie data={PIE_DATA} cx="50%" cy="45%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                {PIE_DATA.map((_, i) => (
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
            <span className="text-sm text-gray-700">Expedientes recientes</span>
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
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Vehículo</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Estado</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Vel.</th>
                  <th className="text-left text-xs text-gray-500 px-3 py-2">Exceso</th>
                </tr>
              </thead>
              <tbody>
                {expedientes_recientes?.map((exp) => {
                  const hasSpeed = exp.velocidad_final_kmh !== null && exp.velocidad_final_kmh !== undefined;
                  const estadoStr = (exp.estado || "sin_estado").replaceAll("_", " ");
                  return (
                    <tr key={exp.uuid} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/expedientes/${exp.uuid}`)}>
                      <td className="px-4 py-2 text-xs text-[#00ADCF] font-medium">{exp.numero_siniestro || `SIN-${exp.uuid?.substring(0,6)}`}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{exp.fecha_hecho ? new Date(exp.fecha_hecho).toLocaleDateString("es-MX") : "—"}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{exp.tipo_hecho || "—"}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{exp.vehiculo || "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[exp.estado] || "bg-gray-100 text-gray-700"}`}>
                          {estadoStr}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {hasSpeed ? <span className="text-gray-600">{exp.velocidad_final_kmh} km/h</span> : <span className="text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">En espera</span>}
                      </td>
                      <td className="px-3 py-2">
                        {hasSpeed ? (
                          exp.exceso_velocidad ? <span className="text-xs text-red-600 font-medium">Sí</span> : <span className="text-xs text-gray-400">No</span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">En espera</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {(!expedientes_recientes || expedientes_recientes.length === 0) && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-xs text-gray-500">No hay expedientes recientes.</td>
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
            <div className="text-sm text-gray-700 mb-2 border-b border-gray-100 pb-2">Resumen del mes</div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Nuevos casos", val: resumen_mes?.nuevos_casos || 0, color: "#00ADCF" },
                { label: "Cerrados", val: resumen_mes?.cerrados || 0, color: "#10B981" },
                { label: "Con exceso vel.", val: resumen_mes?.con_exceso_velocidad || 0, color: "#EF4444" },
                { label: "Pendiente revisión", val: resumen_mes?.pendiente_revision || 0, color: "#F59E0B" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">{r.label}</span>
                  <span className="font-semibold" style={{ color: r.color }}>
                    {r.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
