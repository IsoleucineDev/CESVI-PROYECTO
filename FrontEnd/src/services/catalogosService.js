import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

const C = `${API_PREFIX}/catalogos`; // /v1/rat/catalogos

// Cache en memoria para no repetir el request en cada paso del wizard
let _catalogosCache = null;
let _peritosCache   = null;

// ── Todos los catálogos RAT en un solo request ────────────────────────────────
// El backend devuelve:
// {
//   tipos_hecho, tipos_via, tipos_trazo, tipos_interseccion,
//   condiciones_superficie, condiciones_pavimento, tipos_pavimento,
//   climas, orientaciones_via, sentidos_vialidad,
//   colores, estados_neumatico, tipos_golpe, numeros_mediciones,
//   tipos_foto, tipos_indicio, ...
// }

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
  // El backend devuelve array de { id_user, name, email }
  _peritosCache = Array.isArray(data) ? data : (data?.data ?? []);
  return _peritosCache;
}

// ── Tablas técnicas McHenry ───────────────────────────────────────────────────

export async function getRigidezAB(params = {}) {
  // params: { tipo_golpe_id, batalla_m }
  const { data } = await http.get(`${C}/rigidez`, { params });
  return data;
}

export async function getMu(params = {}) {
  // params: { tipo_pavimento_id, condicion_superficie_id, estado_neumatico_id }
  const { data } = await http.get(`${C}/mu`, { params });
  return data;
}
