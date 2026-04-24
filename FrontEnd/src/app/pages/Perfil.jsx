import React, { useState } from "react";
import { User, Mail, Shield, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useIncidentes } from "../../hooks/useIncidentes";

const ESTADO_BADGE = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
};
const ESTADO_LABEL = { 0: "Abierto", 1: "En revisión", 2: "Finalizado" };

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d) ? val : d.toLocaleDateString("es-MX");
}

function Field({ label, value, edit, type = "text" }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {edit ? (
        <input
          type={type}
          defaultValue={value}
          className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]"
        />
      ) : (
        <div className="px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-gray-50 text-gray-700">{value || "—"}</div>
      )}
    </div>
  );
}

function TabDatos({ user }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-3 border-b border-gray-200 pb-1">Información Personal</div>
        <div className="flex flex-col gap-3">
          <Field label="Nombre completo" value={user?.name} edit={editing} />
          <Field label="Correo electrónico" value={user?.email} edit={editing} type="email" />
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-gray-700 mb-3 border-b border-gray-200 pb-1">Información del Sistema</div>
        <div className="flex flex-col gap-3">
          <Field label="ID de usuario" value={user?.id_user} />
          <Field label="Estado de cuenta" value="Activo" />
        </div>

        <div className="mt-4 flex gap-2">
          {editing ? (
            <>
              <button className="px-3 py-1.5 text-xs rounded text-white" style={{ backgroundColor: "#00ADCF" }}
                onClick={() => setEditing(false)}>
                Guardar cambios
              </button>
              <button className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600"
                onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </>
          ) : (
            <button className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 hover:border-[#00ADCF] hover:text-[#00ADCF]"
              onClick={() => setEditing(true)}>
              Editar datos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TabExpedientes({ navigate, rows, loading, error }) {
  const recientes = rows.slice(0, 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-600">Mis últimos expedientes</span>
        <button onClick={() => navigate("/expedientes")} className="text-xs text-[#00ADCF] hover:underline">
          Ver todos
        </button>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-gray-500">Cargando expedientes...</div>
      ) : error ? (
        <div className="p-4 text-sm text-red-600">{error}</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {["Expediente", "Fecha", "Tipo de Hecho", "Estado", "Acción"].map((h) => (
                <th key={h} className="text-left text-xs text-gray-500 px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recientes.map((exp) => (
              <tr key={exp.uuid} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-xs text-[#00ADCF] font-medium">{exp.numero_siniestro || exp.uuid}</td>
                <td className="px-3 py-2 text-xs text-gray-600">{formatDate(exp.fecha_hecho)}</td>
                <td className="px-3 py-2 text-xs text-gray-600">{exp.tipo_hecho || "—"}</td>
                <td className="px-3 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[exp.estado] || "bg-gray-100 text-gray-700"}`}>
                    {ESTADO_LABEL[exp.estado] ?? "—"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => navigate(`/expedientes/${exp.uuid}`)} className="text-[#00ADCF] hover:text-[#007A9A]">
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {!recientes.length && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay expedientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Toggle({ val, onChange }) {
  return (
    <button onClick={() => onChange(!val)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${val ? "" : "bg-gray-200"}`}
      style={val ? { backgroundColor: "#00ADCF" } : {}}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${val ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

function TabConfiguracion() {
  const [notifEmail, setNotifEmail]   = useState(true);
  const [notifSystem, setNotifSystem] = useState(true);
  const [autoSave, setAutoSave]       = useState(false);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-3 border-b border-gray-200 pb-1">Notificaciones</div>
        <div className="flex flex-col gap-3">
          {[
            { label: "Notificaciones por correo", desc: "Recibir alertas de expedientes asignados", val: notifEmail, set: setNotifEmail },
            { label: "Notificaciones del sistema", desc: "Alertas de cambios de estado", val: notifSystem, set: setNotifSystem },
            { label: "Guardado automático", desc: "Guardar borradores cada 5 min", val: autoSave, set: setAutoSave },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-3 py-2 border-b border-gray-100">
              <div>
                <div className="text-xs text-gray-700">{item.label}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
              <Toggle val={item.val} onChange={item.set} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-gray-700 mb-3 border-b border-gray-200 pb-1">Seguridad</div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Contraseña actual</label>
            <input type="password" className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nueva contraseña</label>
            <input type="password" className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Confirmar nueva contraseña</label>
            <input type="password" className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]" placeholder="••••••••" />
          </div>
          <button className="px-3 py-1.5 text-xs rounded text-white mt-1 self-start" style={{ backgroundColor: "#00ADCF" }}>
            Cambiar contraseña
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Perfil() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("datos");
  const { user } = useAuth();
  const { rows, loading, error } = useIncidentes();

  const total      = rows.length;
  const finalizados = rows.filter((r) => r.estado === 2).length;
  const abiertos   = rows.filter((r) => r.estado === 0).length;

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#E0F7FA] border-2 border-[#00ADCF] flex items-center justify-center shrink-0">
          <User size={32} style={{ color: "#00ADCF" }} />
        </div>
        <div className="flex-1">
          <div className="text-base text-gray-800">{user?.name || "Usuario"}</div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs bg-[#E0F7FA] text-[#00ADCF] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield size={11} /> Perito
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Mail size={11} /> {user?.email || "—"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-semibold text-gray-800">{total}</div>
            <div className="text-xs text-gray-500">Expedientes</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-800">{finalizados}</div>
            <div className="text-xs text-gray-500">Finalizados</div>
          </div>
          <div>
            <div className="text-xl font-semibold" style={{ color: "#00ADCF" }}>{abiertos}</div>
            <div className="text-xs text-gray-500">Abiertos</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex border-b border-gray-200">
          {[
            { id: "datos",         label: "Datos Personales" },
            { id: "expedientes",   label: "Mis Expedientes" },
            { id: "configuracion", label: "Configuración" },
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-xs border-b-2 transition-colors ${
                activeTab === t.id ? "border-[#00ADCF] text-[#00ADCF]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === "datos"         && <TabDatos user={user} />}
          {activeTab === "expedientes"   && <TabExpedientes navigate={navigate} rows={rows} loading={loading} error={error} />}
          {activeTab === "configuracion" && <TabConfiguracion />}
        </div>
      </div>
    </div>
  );
}
