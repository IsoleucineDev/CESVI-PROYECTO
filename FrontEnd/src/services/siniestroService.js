import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

// ── Lista y detalle ────────────────────────────────────────────────────────────

/**
 * GET /v1/rat/siniestros
 * Acepta filtros: buscar, desde, hasta, tipo_hecho_id, estado, perito_id, per_page
 * Devuelve: { data: [...], meta: { total, per_page, current_page, last_page } }
 */
export async function getSiniestros(params = {}) {
  const { data } = await http.get(`${API_PREFIX}/siniestros`, { params });
  return data;
}

/**
 * GET /v1/rat/siniestros/:uuid
 * Detalle completo con todas las relaciones del expediente.
 */
export async function getSiniestroById(uuid) {
  const { data } = await http.get(`${API_PREFIX}/siniestros/${uuid}`);
  return data;
}

/**
 * DELETE /v1/rat/siniestros/:uuid
 * Solo funciona cuando estado = 0 (Abierto).
 */
export async function deleteSiniestro(uuid) {
  const { data } = await http.delete(`${API_PREFIX}/siniestros/${uuid}`);
  return data;
}

/**
 * PATCH /v1/rat/siniestros/:uuid/estado
 * estado: 0 = Abierto, 1 = En revisión, 2 = Finalizado
 */
export async function changeSiniestroStatus(uuid, estado) {
  const { data } = await http.patch(`${API_PREFIX}/siniestros/${uuid}/estado`, { estado });
  return data;
}

// ── Wizard — creación y edición paso a paso ────────────────────────────────────

/**
 * POST /v1/rat/wizard/paso1-incidente
 *
 * Crea el expediente en RAT_INCIDENTE.
 * Payload requerido:
 * {
 *   numero_siniestro  : string   — único, ej. "RAT-2026-025"
 *   fecha_hecho       : string   — formato YYYY-MM-DD
 *   hora_hecho        : string   — formato HH:MM (opcional)
 *   tipo_hecho_id     : number   — id de RAT_CAT_TIPO_HECHO
 *   id_usuario_perito : number   — id_user de sys_users
 *   estado            : 0|1|2   — default 0
 * }
 * Respuesta: { incidente_uuid, numero_siniestro }
 */
export async function createIncidentePaso1(payload) {
  const { data } = await http.post(`${API_PREFIX}/wizard/paso1-incidente`, payload);
  return data;
}

export async function updateIncidentePaso1(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/wizard/${uuid}/paso1-incidente`, payload);
  return data;
}

export async function updatePaso2Vehiculo(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/wizard/${uuid}/paso2-vehiculo`, payload);
  return data;
}

export async function updatePaso3Ocupantes(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/wizard/${uuid}/paso3-ocupantes`, payload);
  return data;
}

export async function updatePaso4Via(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/wizard/${uuid}/paso4-via`, payload);
  return data;
}

export async function storePaso5Evidencia(uuid, payload) {
  const { data } = await http.post(`${API_PREFIX}/wizard/${uuid}/paso5-evidencia`, payload);
  return data;
}

export async function destroyFoto(uuid, fotoId) {
  const { data } = await http.delete(`${API_PREFIX}/wizard/${uuid}/paso5-evidencia/${fotoId}`);
  return data;
}

export async function updatePaso6Deformacion(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/wizard/${uuid}/paso6-deformacion`, payload);
  return data;
}

export async function storePaso7Calculo(uuid, payload) {
  const { data } = await http.post(`${API_PREFIX}/wizard/${uuid}/paso7-calculo`, payload);
  return data;
}

export async function updatePaso8Narrativa(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/wizard/${uuid}/paso8-narrativa`, payload);
  return data;
}

export async function updatePaso9Reporte(uuid, payload) {
  const { data } = await http.put(`${API_PREFIX}/wizard/${uuid}/paso9-reporte`, payload);
  return data;
}

// ── Alias de compatibilidad ────────────────────────────────────────────────────
// Algunos componentes aún llaman a createSiniestro/updateSiniestro — no romper
export const createSiniestro  = createIncidentePaso1;
export const updateSiniestro  = updateIncidentePaso1;
