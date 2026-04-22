import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteSiniestro, getSiniestros } from "../services/siniestroService";

export function useSiniestros() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getSiniestros();
      const payload = data?.data?.data || data?.data || data || [];
      setRows(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudieron cargar los expedientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((item) => {
      const values = [
        item.numero_siniestro,
        item.tipo_accidente,
        item.perito_nombre,
        item.ubicacion_ciudad,
        item.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return values.includes(term);
    });
  }, [rows, search]);

  const remove = useCallback(async (id) => {
    const confirmed = window.confirm("¿Eliminar este expediente?");
    if (!confirmed) return { ok: false };

    try {
      await deleteSiniestro(id);
      await load();
      return { ok: true };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "No se pudo eliminar el expediente";
      return { ok: false, error: message };
    }
  }, [load]);

  return {
    loading,
    error,
    rows,
    search,
    setSearch,
    filteredRows,
    load,
    remove,
  };
}