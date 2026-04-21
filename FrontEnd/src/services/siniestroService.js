import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

export async function getSiniestros(params = {}) {
  const { data } = await http.get(`${API_PREFIX}/siniestros`, { params });
  return data;
}

export async function getSiniestroById(id) {
  const { data } = await http.get(`${API_PREFIX}/siniestros/${id}`);
  return data;
}

export async function createSiniestro(payload) {
  const { data } = await http.post(`${API_PREFIX}/siniestros`, payload);
  return data;
}

export async function updateSiniestro(id, payload) {
  const { data } = await http.put(`${API_PREFIX}/siniestros/${id}`, payload);
  return data;
}

export async function deleteSiniestro(id) {
  const { data } = await http.delete(`${API_PREFIX}/siniestros/${id}`);
  return data;
}

export async function changeSiniestroStatus(id, estado) {
  const { data } = await http.patch(`${API_PREFIX}/siniestros/${id}/estado`, { estado });
  return data;
}