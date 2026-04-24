import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteSiniestro, getSiniestros } from "../services/siniestroService";

export function useSiniestros() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => { // Cambiado a loadData para evitar colisiones
    setLoading(true);
    setError("");
    try {
      const response = await getSiniestros();
      const payload = response?.data?.data || response?.data || response || [];
      setRows(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar expedientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const memoFilteredRows = useMemo(() => { // Nombre único para evitar colisiones
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((item) => 
      Object.values(item).join(" ").toLowerCase().includes(term)
    );
  }, [rows, search]);

  const removeSiniestro = useCallback(async (id) => {
    if (!window.confirm("¿Eliminar este expediente?")) return { ok: false };
    try {
      await deleteSiniestro(id);
      await loadData();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err?.message };
    }
  }, [loadData]);

  return {
    loading,
    error,
    search,
    setSearch,
    filteredRows: memoFilteredRows,
    load: loadData,
    remove: removeSiniestro,
  };
}