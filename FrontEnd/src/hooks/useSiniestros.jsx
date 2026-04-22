import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteSiniestro, getSiniestros } from "../services/siniestroService";

/**
 * Lista de expedientes RAT.
 *
 * Rat\IncidenteController@index devuelve por fila:
 *   uuid, numero_siniestro, fecha_hecho, hora_hecho,
 *   estado (0|1|2), tipo_hecho, vehiculo, perito,
 *   velocidad_final_kmh, exceso_velocidad, delta_exceso_kmh
 */
export function useSiniestros() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [rows, setRows]       = useState([]);
  const [search, setSearch]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSiniestros();
      // IncidenteController devuelve { data: [...], meta: {...} }
      const payload = res?.data ?? res ?? [];
      setRows(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudieron cargar los expedientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((item) => {
      const hay = [
        item.numero_siniestro,
        item.tipo_hecho,          // string con nombre del catálogo
        item.perito,              // nombre del perito (sys_users)
        item.vehiculo,            // "marca submarca año"
        estadoLabel(item.estado),
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(term);
    });
  }, [rows, search]);

  const remove = useCallback(async (uuid) => {
    if (!window.confirm("¿Eliminar este expediente?")) return { ok: false };
    try {
      await deleteSiniestro(uuid);
      await load();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.response?.data?.message || err?.message };
    }
  }, [load]);

  return { loading, error, rows, search, setSearch, filteredRows, load, remove };
}

function estadoLabel(estado) {
  switch (Number(estado)) {
    case 0: return "abierto";
    case 1: return "en revision";
    case 2: return "finalizado";
    default: return "";
  }
}
