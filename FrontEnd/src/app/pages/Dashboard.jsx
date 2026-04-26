import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, Eye, TrendingUp } from "lucide-react";
import { useDashboard } from "../../hooks/useDashboard";

const MESES_CORTO = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const PIE_COLORS  = ["#00ADCF","#F59E0B","#10B981","#EF4444","#8B5CF6"];

const ESTADO_LABEL = { 0: "Abierto", 1: "En revisión", 2: "Finalizado", 3: "Archivado" };
const ESTADO_BADGE = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
  3: "bg-gray-100 text-gray-700",
};

const ACCESOS_RAPIDOS = [
  { label: "Nuevo Expediente", path: "/expedientes/nuevo", icon: <Plus size={18} />, color: "#00ADCF" },
  { label: "Ver Expedientes",  path: "/expedientes",        icon: <FileText size={18} />, color: "#6366F1" },
  { label: "Catálogos",        path: "/configuracion/catalogos", icon: <TrendingUp size={18} />, color: "#10B981" },
];

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboard, loading, error } = useDashboard();
  const { user } = useAuth();
  const isAdmin = user?.email === "admin@cesvi.com";

  const kpiCards = loading || !dashboard
    ? [
        { label: "Casos Abiertos",     value: "—", icon: <FileText size={20} />,    color: "#00ADCF", bg: "#E0F7FA" },
        { label: "En Revisión",         value: "—", icon: <Clock size={20} />,       color: "#F59E0B", bg: "#FEF3C7" },
        { label: "Finalizados",         value: "—", icon: <CheckCircle size={20} />, color: "#10B981", bg: "#D1FAE5" },
        { label: "Exceso de Velocidad", value: "—", icon: <AlertTriangle size={20} />, color: "#EF4444", bg: "#FEE2E2" },
      ]
    : [
        { label: "Casos Abiertos",     value: dashboard.contadores.casos_abiertos,  icon: <FileText size={20} />,    color: "#00ADCF", bg: "#E0F7FA" },
        { label: "En Revisión",         value: dashboard.contadores.en_revision,     icon: <Clock size={20} />,       color: "#F59E0B", bg: "#FEF3C7" },
        { label: "Finalizados",         value: dashboard.contadores.finalizados,     icon: <CheckCircle size={20} />, color: "#10B981", bg: "#D1FAE5" },
        { label: "Exceso de Velocidad", value: dashboard.contadores.exceso_velocidad, icon: <AlertTriangle size={20} />, color: "#EF4444", bg: "#FEE2E2" },
      ];

  const barData = dashboard?.expedientes_por_mes?.map((r) => ({
    mes: MESES_CORTO[parseInt(r.mes.split("-")[1], 10) - 1],
    casos: r.total,
  })) ?? [];

  const pieData = dashboard?.por_tipo_hecho?.map((r) => ({
    name: r.nombre,
    value: r.total,
  })) ?? [];

  const recientes   = dashboard?.expedientes_recientes ?? [];
  const resumenMes  = dashboard?.resumen_mes ?? {};

  return (
    <div className="p-4 flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-xs text-red-700">{error}</div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center gap-3">
            <div className="rounded-lg p-2.5" style={{ backgroundColor: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              {loading
                ? <Skeleton className="h-6 w-10 mb-1" />
                : <div className="text-xl font-semibold text-gray-800">{card.value}</div>}
              <div className="text-xs text-gray-500">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="text-sm text-gray-700 mb-3 border-b border-gray-100 pb-2">Expedientes por mes</div>
          {loading
            ? <Skeleton className="h-44 w-full" />
            : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 4 }} />
                  <Bar dataKey="casos" fill="#00ADCF" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="text-sm text-gray-700 mb-3 border-b border-gray-100 pb-2">Tipo de hecho</div>
          {loading
            ? <Skeleton className="h-44 w-full" />
            : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* Tabla recientes + accesos rápidos */}
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
                  {["No. Siniestro","Fecha","Tipo","Vehículo", ...(isAdmin ? ["Perito"] : []), "Estado","Vel.","Exceso"].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 px-3 py-2 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        {Array.from({ length: isAdmin ? 8 : 7 }).map((__, j) => (
                          <td key={j} className="px-3 py-2"><Skeleton className="h-3 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : recientes.map((exp) => (
                      <tr
                        key={exp.uuid}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/expedientes/${exp.uuid}`)}
                      >
                        <td className="px-3 py-2 text-xs text-[#00ADCF] font-medium">{exp.numero_siniestro}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{exp.fecha_hecho}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{exp.tipo_hecho}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{exp.vehiculo}</td>
                        {isAdmin && (
                          <td className="px-3 py-2 text-xs text-gray-600">{exp.perito ?? "—"}</td>
                        )}
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[exp.estado] ?? "bg-gray-100 text-gray-700"}`}>
                            {ESTADO_LABEL[exp.estado] ?? exp.estado}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">
                          {exp.velocidad_final_kmh ? `${exp.velocidad_final_kmh} km/h` : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {exp.exceso_velocidad
                            ? <span className="text-xs text-red-600 font-medium">Sí</span>
                            : <span className="text-xs text-gray-400">No</span>}
                        </td>
                      </tr>
                    ))}
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
                { label: "Nuevos casos",         val: resumenMes.nuevos_casos,          color: "#00ADCF" },
                { label: "Cerrados",              val: resumenMes.cerrados,              color: "#10B981" },
                { label: "Con exceso vel.",       val: resumenMes.con_exceso_velocidad,  color: "#EF4444" },
                { label: "Pendiente revisión",   val: resumenMes.pendiente_revision,     color: "#F59E0B" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">{r.label}</span>
                  {loading
                    ? <Skeleton className="h-3 w-6" />
                    : <span className="font-semibold" style={{ color: r.color }}>{r.val ?? "—"}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
