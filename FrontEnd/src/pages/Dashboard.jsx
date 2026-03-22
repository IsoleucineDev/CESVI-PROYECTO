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
} from "lucide-react";

const KPI_CARDS = [
  { label: "Casos Abiertos", value: 24, icon: <FileText size={20} />, color: "#00ADCF", bg: "#E0F7FA" },
  { label: "En Revisión", value: 8, icon: <Clock size={20} />, color: "#F59E0B", bg: "#FEF3C7" },
  { label: "Finalizados", value: 47, icon: <CheckCircle size={20} />, color: "#10B981", bg: "#D1FAE5" },
  { label: "Exceso de Velocidad", value: 13, icon: <AlertTriangle size={20} />, color: "#EF4444", bg: "#FEE2E2" },
];

const EXPEDIENTES_RECIENTES = [
  { id: "RAT-2026-024", fecha: "08/03/2026", tipo: "Colisión frontal", vehiculo: "Toyota Corolla 2019", perito: "Méndez C.", estado: "Abierto", velocidad: "87 km/h", exceso: true },
  { id: "RAT-2026-023", fecha: "07/03/2026", tipo: "Volcadura", vehiculo: "Nissan Frontier 2020", perito: "García R.", estado: "En revisión", velocidad: "62 km/h", exceso: false },
  { id: "RAT-2026-022", fecha: "06/03/2026", tipo: "Colisión lateral", vehiculo: "Chevrolet Aveo 2018", perito: "López M.", estado: "Finalizado", velocidad: "74 km/h", exceso: true },
  { id: "RAT-2026-021", fecha: "05/03/2026", tipo: "Atropellamiento", vehiculo: "Ford F-150 2021", perito: "Méndez C.", estado: "Finalizado", velocidad: "48 km/h", exceso: false },
  { id: "RAT-2026-020", fecha: "04/03/2026", tipo: "Colisión trasera", vehiculo: "Honda CR-V 2022", perito: "Torres J.", estado: "En revisión", velocidad: "91 km/h", exceso: true },
];

const BAR_DATA = [
  { mes: "Oct", casos: 12 },
  { mes: "Nov", casos: 18 },
  { mes: "Dic", casos: 9 },
  { mes: "Ene", casos: 21 },
  { mes: "Feb", casos: 16 },
  { mes: "Mar", casos: 13 },
];

const PIE_DATA = [
  { name: "Frontal", value: 38 },
  { name: "Lateral", value: 24 },
  { name: "Trasera", value: 19 },
  { name: "Volcadura", value: 11 },
  { name: "Atropell.", value: 8 },
];

const PIE_COLORS = ["#00ADCF", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];

const ACCESOS_RAPIDOS = [
  { label: "Nuevo Expediente", path: "/expedientes/nuevo", icon: <Plus size={18} />, color: "#00ADCF" },
  { label: "Ver Expedientes", path: "/expedientes", icon: <FileText size={18} />, color: "#6366F1" },
  { label: "Catálogos", path: "/Configuracion/Catalogos", icon: <TrendingUp size={18} />, color: "#10B981" },
];

const ESTADO_BADGE = {
  Abierto: "bg-blue-100 text-blue-700",
  "En revisión": "bg-yellow-100 text-yellow-700",
  Finalizado: "bg-green-100 text-green-700",
};

export default function Dashboard() {
  const navigate = useNavigate();

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
            <button
              type="button"
              onClick={() => navigate("/expedientes")}
              className="text-xs text-[#00ADCF] hover:underline flex items-center gap-1"
            >
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
                {EXPEDIENTES_RECIENTES.map((exp) => (
                  <tr
                    key={exp.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/expedientes/${exp.id}`)}
                  >
                    <td className="px-4 py-2 text-xs text-[#00ADCF] font-medium">{exp.id}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{exp.fecha}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{exp.tipo}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{exp.vehiculo}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[exp.estado]}`}>
                        {exp.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">{exp.velocidad}</td>
                    <td className="px-3 py-2">
                      {exp.exceso ? (
                        <span className="text-xs text-red-600 font-medium">Sí</span>
                      ) : (
                        <span className="text-xs text-gray-400">No</span>
                      )}
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
                  type="button"
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
                { label: "Nuevos casos", val: 13, color: "#00ADCF" },
                { label: "Cerrados", val: 9, color: "#10B981" },
                { label: "Con exceso vel.", val: 5, color: "#EF4444" },
                { label: "Pendiente revisión", val: 4, color: "#F59E0B" },
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
