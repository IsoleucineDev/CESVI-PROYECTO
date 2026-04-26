import { apiClient } from "../api/apiClient";

export const getUsuarios = () =>
  apiClient.get("/admin/usuarios").then((r) => r.data);

export const updateUserPassword = (id, passwordNuevo) =>
  apiClient.put(`/admin/usuarios/${id}/password`, { password_nuevo: passwordNuevo }).then((r) => r.data);
