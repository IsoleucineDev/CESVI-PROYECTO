// Config de entorno (versionado)
// En local puedes sobreescribir con VITE_API_URL en .env (no se commitea)
export const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

export const API_PREFIX = "/v1/rat";
export const LOGIN_PATH = "/login";
export const ME_PATH = "/me";
