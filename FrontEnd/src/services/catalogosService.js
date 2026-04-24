import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

export async function getCatalogos() {
  const { data } = await http.get(`${API_PREFIX}/catalogos`);
  return data;
}

export async function getPeritos() {
  const { data } = await http.get(`${API_PREFIX}/catalogos/peritos`);
  return data;
}

export async function getCatalogoEntorno() {
  const { data } = await http.get(`${API_PREFIX}/catalogos/entorno`);
  return data;
}