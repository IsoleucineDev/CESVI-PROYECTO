import { useCallback, useEffect, useState } from "react";
import { getSiniestroById } from "../services/siniestroService";

/**
 * Detalle completo de un expediente por UUID.
 * Rat\IncidenteController@show carga todas las relaciones (wizard completo).
 */
export function useSiniestro(uuid) {
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [siniestro, setSiniestro] = useState(null);

  const load = useCallback(async () => {
    if (!uuid) return;
    setLoading(true);
    setError("");
    try {
      const data = await getSiniestroById(uuid);
      // show() devuelve el objeto directamente, sin wrapper
      setSiniestro(data?.data ?? data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar el expediente");
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => { load(); }, [load]);

  return { siniestro, loading, error, load, setSiniestro };
}
