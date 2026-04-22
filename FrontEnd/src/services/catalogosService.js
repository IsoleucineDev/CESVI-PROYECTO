import { http } from "../api/http";
import { API_PREFIX } from "../config/env";

let _cache = null; // caché en memoria para no repetir la llamada

/**
 * GET /v1/rat/catalogos
 * Devuelve todos los catálogos RAT en un solo request.
 * Se cachea en memoria durante la sesión.
 *
 * Estructura de respuesta:
 * {
 *   tipos_hecho, tipos_via, tipos_trazo, tipos_interseccion,
 *   senalamientos_vertical, senalamientos_horizontal,
 *   condiciones_superficie, condiciones_pavimento, tipos_pavimento,
 *   climas, orientaciones_via, sentidos_vialidad, estados_neumatico,
 *   colores, tipos_foto, tipos_golpe, numeros_mediciones,
 *   tipos_indicio, posiciones_iniciales, percepciones_real,
 *   puntos_clave, trayectorias_post, zonas_vehiculo,
 *   tipos_dano, cuerpos_generador, direcciones_dano,
 *   consecuencias_dano, partes_vehiculo
 * }
 */
export async function getCatalogos() {
  if (_cache) return _cache;
  const { data } = await http.get(`${API_PREFIX}/catalogos`);
  _cache = data;
  return data;
}

/** Fuerza recarga (útil si los catálogos cambian en sesión) */
export function invalidarCatalogos() {
  _cache = null;
}

/** GET /v1/rat/catalogos/peritos — lista de peritos para el selector del paso 1 */
export async function getPeritos() {
  const { data } = await http.get(`${API_PREFIX}/catalogos/peritos`);
  return data;
}

/**
 * GET /v1/rat/catalogos/rigidez
 * Parámetros: batalla_mm (número), tipo_golpe_id (id)
 */
export async function getRigidez(batalla_mm, tipo_golpe_id) {
  const { data } = await http.get(`${API_PREFIX}/catalogos/rigidez`, {
    params: { batalla_mm, tipo_golpe_id },
  });
  return data;
}

/**
 * GET /v1/rat/catalogos/mu
 * Parámetros: tipo_pavimento_id, condicion_superficie_id, estado_neumatico_id
 */
export async function getMu(params) {
  const { data } = await http.get(`${API_PREFIX}/catalogos/mu`, { params });
  return data;
}
