import { API_URL } from "../config/env";

export async function health() {
  const res = await fetch(`${API_URL}/test`); // as per web.php router->get('/test')
  if (!res.ok) throw new Error("No se pudo conectar con el backend");
  return res.text();
}
