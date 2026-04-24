import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

const C = `${API_PREFIX}/catalogos`; // /v1/rat/catalogos

// Cache en memoria para no repetir el request en cada paso del wizard
let _catalogosCache = null;
let _peritosCache   = null;

// ── Todos los catálogos RAT en un solo request ────────────────────────────────
export async function getCatalogos() {
  if (_catalogosCache) return _catalogosCache;
  const { data } = await http.get(C);
  _catalogosCache = data;
  return data;
}

export function clearCatalogosCache() {
  _catalogosCache = null;
  _peritosCache   = null;
}

// ── Peritos (sys_users con perfil RAT) ───────────────────────────────────────
export async function getPeritos() {
  if (_peritosCache) return _peritosCache;
  const { data } = await http.get(`${C}/peritos`);
  _peritosCache = Array.isArray(data) ? data : (data?.data ?? []);
  return _peritosCache;
}

// ── Tablas técnicas McHenry ───────────────────────────────────────────────────
export async function getRigidezAB(params = {}) {
  const { data } = await http.get(`${C}/rigidez`, { params });
  return data;
}

export async function getMu(params = {}) {
  const { data } = await http.get(`${C}/mu`, { params });
  return data;
}

// ── Catálogo de Entorno ───────────────────────────────────────────────────────
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
