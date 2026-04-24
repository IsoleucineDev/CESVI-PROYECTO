import React, { useState } from "react";
import { User, Mail, Phone, Shield, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePerfil } from "../../hooks/usePerfil";

const ESTADO_LABEL = { 0: "Abierto", 1: "En revisión", 2: "Finalizado", 3: "Archivado" };
const ESTADO_BADGE = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
  3: "bg-gray-100 text-gray-700",
};

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function Field({ label, name, value, edit, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {edit ? (
        <input
          name={name}
          defaultValue={value ?? ""}
          onChange={onChange}
          className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]"
        />
      ) : (
        <div className="px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-gray-50 text-gray-700">
          {value || "—"}
        </div>
      )}
    </div>
  );
}

function TabDatos({ perfil, loading, onUpdate }) {
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm]         = useState({});

  const startEdit = () => {
    setForm({
      telefono:           perfil?.telefono           ?? "",
      cedula_profesional: perfil?.cedula_profesional ?? "",
      especialidad:       perfil?.especialidad       ?? "",
      numero_empleado:    perfil?.numero_empleado    ?? "",
    });
    setSaveError("");
    setEditing(true);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    const { ok, error } = await onUpdate(form);
    setSaving(false);
    if (ok) setEditing(false);
    else setSaveError(error);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-3 border-b border-gray-200 pb-1">Información Personal</div>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Field label="Nombre completo"                  name="name"               value={perfil?.name}               edit={false} />
            <Field label="Correo electrónico institucional" name="email"              value={perfil?.email}              edit={false} />
            <Field label="Teléfono"                         name="telefono"           value={editing ? form.telefono           : perfil?.telefono}           edit={editing} onChange={handleChange} />
            <Field label="Cédula profesional"               name="cedula_profesional" value={editing ? form.cedula_profesional : perfil?.cedula_profesional} edit={editing} onChange={handleChange} />
            <Field label="Especialidad"                     name="especialidad"       value={editing ? form.especialidad       : perfil?.especialidad}       edit={editing} onChange={handleChange} />
          </div>
        )}
      </div>

      <div>
        <div className="text-xs font-medium text-gray-700 mb-3 border-b border-gray-200 pb-1">Información del Sistema</div>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Field label="Número de empleado" name="numero_empleado" value={editing ? form.numero_empleado : perfil?.numero_empleado} edit={editing} onChange={handleChange} />
            <Field label="Fecha de alta"      name="fecha_alta"      value={perfil?.fecha_alta}      edit={false} />
            <Field label="Estado de cuenta"   name="estado"          value="Activo"                  edit={false} />
          </div>
        )}

        {saveError && (
          <div className="mt-2 text-xs text-red-600">{saveError}</div>
        )}

        {!loading && (
          <div className="mt-4 flex gap-2">
            {editing ? (
              <>
                <button
                  className="px-3 py-1.5 text-xs rounded text-white disabled:opacity-60"
                  style={{ backgroundColor: "#00ADCF" }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Guardando…" : "Guardar cambios"}
                </button>
                <button
                  className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 hover:border-[#00ADCF] hover:text-[#00ADCF]"
                onClick={startEdit}
              >
                Editar datos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabExpedientes({ expedientes, loading, navigate }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-600">Mis últimos expedientes</span>
        <button onClick={() => navigate("/expedientes")} className="text-xs text-[#00ADCF] hover:underline">
          Ver todos
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {["Expediente", "Fecha", "Tipo de Hecho", "Estado", "Acción"].map((h) => (
              <th key={h} className="text-left text-xs text-gray-500 px-3 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-3 py-2"><Skeleton className="h-3 w-full" /></td>
                  ))}
                </tr>
              ))
            : expedientes.length === 0
              ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-400">
                    No hay expedientes registrados.
                  </td>
                </tr>
              )
              : expedientes.map((exp) => (
                <tr key={exp.uuid} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs text-[#00ADCF] font-medium">{exp.numero_siniestro}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{exp.fecha_hecho}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{exp.tipo_hecho}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[exp.estado] ?? "bg-gray-100 text-gray-700"}`}>
                      {ESTADO_LABEL[exp.estado] ?? exp.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => navigate(`/expedientes/${exp.uuid}`)} className="text-[#00ADCF] hover:text-[#007A9A]">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

function Toggle({ val, onChange }) {
  return (
    <button
      onClick={() => onChange(!val)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${val ? "" : "bg-gray-200"}`}
      style={val ? { backgroundColor: "#00ADCF" } : {}}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${val ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

function TabConfiguracion({ onCambiarPassword }) {
  const [notifEmail,   setNotifEmail]   = useState(true);
  const [notifSystem,  setNotifSystem]  = useState(true);
  const [autoSave,     setAutoSave]     = useState(false);
  const [pwForm, setPwForm]             = useState({ password_actual: "", password_nuevo: "", password_nuevo_confirmation: "" });
  const [pwSaving, setPwSaving]         = useState(false);
  const [pwMsg, setPwMsg]               = useState({ text: "", ok: true });

  const handlePwChange = (e) => setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePwSubmit = async () => {
    setPwSaving(true);
    setPwMsg({ text: "", ok: true });
    const { ok, error } = await onCambiarPassword(pwForm);
    setPwSaving(false);
    if (ok) {
      setPwMsg({ text: "Contraseña actualizada correctamente.", ok: true });
      setPwForm({ password_actual: "", password_nuevo: "", password_nuevo_confirmation: "" });
    } else {
      setPwMsg({ text: error, ok: false });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-3 border-b border-gray-200 pb-1">Notificaciones</div>
        <div className="flex flex-col gap-3">
          {[
            { label: "Notificaciones por correo",   desc: "Recibir alertas de expedientes asignados",        val: notifEmail,  set: setNotifEmail },
            { label: "Notificaciones del sistema",  desc: "Alertas de cambios de estado en el sistema",      val: notifSystem, set: setNotifSystem },
            { label: "Guardado automático",          desc: "Guardar borradores automáticamente cada 5 min",  val: autoSave,    set: setAutoSave },
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
            <input type="password" name="password_actual" value={pwForm.password_actual} onChange={handlePwChange}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Nueva contraseña</label>
            <input type="password" name="password_nuevo" value={pwForm.password_nuevo} onChange={handlePwChange}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Confirmar nueva contraseña</label>
            <input type="password" name="password_nuevo_confirmation" value={pwForm.password_nuevo_confirmation} onChange={handlePwChange}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]" placeholder="••••••••" />
          </div>
          {pwMsg.text && (
            <div className={`text-xs ${pwMsg.ok ? "text-green-600" : "text-red-600"}`}>{pwMsg.text}</div>
          )}
          <button
            className="px-3 py-1.5 text-xs rounded text-white mt-1 self-start disabled:opacity-60"
            style={{ backgroundColor: "#00ADCF" }}
            onClick={handlePwSubmit}
            disabled={pwSaving}
          >
            {pwSaving ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Perfil() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("datos");
  const { perfil, stats, expedientes, loading, error, update, cambiarPassword } = usePerfil();

  return (
    <div className="p-4 flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-xs text-red-700">{error}</div>
      )}

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#E0F7FA] border-2 border-[#00ADCF] flex items-center justify-center shrink-0">
          <User size={32} style={{ color: "#00ADCF" }} />
        </div>
        <div className="flex-1">
          {loading
            ? <Skeleton className="h-5 w-48 mb-2" />
            : <div className="text-base text-gray-800">{perfil?.name ?? "—"}</div>}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs bg-[#E0F7FA] text-[#00ADCF] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield size={11} /> {perfil?.especialidad ?? "Perito"}
            </span>
            {loading
              ? <Skeleton className="h-3 w-32" />
              : (
                <>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail size={11} /> {perfil?.email ?? "—"}
                  </span>
                  {perfil?.telefono && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone size={11} /> {perfil.telefono}
                    </span>
                  )}
                </>
              )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Expedientes", val: stats?.expedientes,  color: "text-gray-800" },
            { label: "Finalizados", val: stats?.finalizados,  color: "text-gray-800" },
            { label: "Calificación",val: stats?.calificacion, color: "text-[#00ADCF]" },
          ].map((s) => (
            <div key={s.label}>
              {loading
                ? <Skeleton className="h-6 w-10 mx-auto mb-1" />
                : <div className={`text-xl font-semibold ${s.color}`}>{s.val ?? "—"}</div>}
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex border-b border-gray-200">
          {[
            { id: "datos",         label: "Datos Personales" },
            { id: "expedientes",   label: "Mis Expedientes" },
            { id: "configuracion", label: "Configuración" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-xs border-b-2 transition-colors ${
                activeTab === t.id ? "border-[#00ADCF] text-[#00ADCF]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === "datos"         && <TabDatos         perfil={perfil}           loading={loading} onUpdate={update} />}
          {activeTab === "expedientes"   && <TabExpedientes   expedientes={expedientes} loading={loading} navigate={navigate} />}
          {activeTab === "configuracion" && <TabConfiguracion onCambiarPassword={cambiarPassword} />}
        </div>
      </div>
    </div>
  );
}
