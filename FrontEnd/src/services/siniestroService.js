import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

// --- CONSULTAS GENERALES ---
export async function getSiniestros(params = {}) {
  // Cambiado a /incidentes para coincidir con tu web.php corregido
  const { data } = await http.get(`${API_PREFIX}/incidentes`, { params });
  return data;
}

export async function getSiniestroById(id) {
  // Esta es la función que te faltaba y bloqueaba el Detalle
  const { data } = await http.get(`${API_PREFIX}/incidentes/${id}`);
  return data;
}

export async function deleteSiniestro(uuid) {
  const { data } = await http.delete(`${API_PREFIX}/incidentes/${uuid}`);
  return data;
}

// --- FUNCIONES DEL WIZARD (NUEVO CASO) ---
export async function createIncidentePaso1(payload) {
  const { data } = await http.post(`${API_PREFIX}/incidentes`, payload);
  return data;
}

export async function updatePaso2Vehiculo(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/incidentes/${uuid}`, { ...payload, step: 2 });
  return data;
}

export async function updatePaso3Ocupantes(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/incidentes/${uuid}`, { ...payload, step: 3 });
  return data;
}

export async function updatePaso4Via(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/incidentes/${uuid}`, { ...payload, step: 4 });
  return data;
}

export async function updatePaso6Deformacion(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/incidentes/${uuid}`, { ...payload, step: 6 });
  return data;
}

export async function storePaso7Calculo(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/incidentes/${uuid}`, { ...payload, step: 7 });
  return data;
}

export async function updatePaso8Narrativa(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/incidentes/${uuid}`, { ...payload, step: 8 });
  return data;
}

export async function updatePaso9Reporte(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/incidentes/${uuid}`, { ...payload, step: 9 });
  return data;
}