import { useEffect, useState } from "react";
import { getCatalogos } from "../services/catalogosService";

/**
 * Carga todos los catálogos RAT en un solo request y los cachea en memoria.
 *
 * Uso:
 *   const { catalogos, loading } = useCatalogos();
 *   // catalogos.tipos_hecho → [{ id, nombre }, ...]
 *   // catalogos.climas      → [{ id, nombre }, ...]
 *   // etc.
 */
export function useCatalogos() {
  const [catalogos, setCatalogos] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    getCatalogos()
      .then((data) => setCatalogos(data))
      .catch((err) => setError(err?.message || "Error al cargar catálogos"))
      .finally(() => setLoading(false));
  }, []);

  return { catalogos, loading, error };
}
