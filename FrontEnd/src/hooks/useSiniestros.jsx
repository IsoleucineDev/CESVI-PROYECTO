import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteSiniestro, getSiniestros, createSiniestro } from "../services/siniestroService";

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

  const add = useCallback(async (payload) => {
    try {
      const response = await createSiniestro(payload);
      await load();
      return { ok: true, data: response };
    } catch (err) {
      let message = "No se pudo guardar el expediente";
      if (err?.response?.status === 422 && err.response.data) {
        // Lumen 422 validation errors are returned as an object of arrays
        const errors = Object.values(err.response.data).flat();
        if (errors.length > 0) {
          message = `Errores de validación: ${errors.join(" | ")}`;
        }
      } else {
        message = err?.response?.data?.message || err?.message || message;
      }
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
    add,
  };
}