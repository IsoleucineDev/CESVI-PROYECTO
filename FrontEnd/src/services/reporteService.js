import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

const R = `${API_PREFIX}/reportes`;

export async function getReporte(uuid) {
  const { data } = await http.get(`${R}/${uuid}`);
  return data;
}

export async function generarReporte(uuid) {
  const { data } = await http.post(`${R}/${uuid}/generar`);
  return data;
}

export function getUrlDescarga(uuid) {
  return `${http.defaults.baseURL}${R}/${uuid}/descargar`;
}
