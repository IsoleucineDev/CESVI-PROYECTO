import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

export async function getCatalogoEntorno() {
  const { data } = await http.get(`${API_PREFIX}/catalogos/entorno`);
  return data;
}

export async function createCatalogoEntorno(payload) {
  const { data } = await http.post(`${API_PREFIX}/catalogos/entorno`, payload);
  return data;
}

export async function updateCatalogoEntorno(id, payload) {
  const { data } = await http.put(`${API_PREFIX}/catalogos/entorno/${id}`, payload);
  return data;
}

export async function deleteCatalogoEntorno(id) {
  const { data } = await http.delete(`${API_PREFIX}/catalogos/entorno/${id}`);
  return data;
}