import { useCallback, useEffect, useState } from "react";
import { getSiniestroById } from "../services/siniestroService";

export function useSiniestro(id) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [siniestro, setSiniestro] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const data = await getSiniestroById(id);
      const payload = data?.data || data;
      setSiniestro(payload);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar expediente");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { siniestro, loading, error, load, setSiniestro };
}