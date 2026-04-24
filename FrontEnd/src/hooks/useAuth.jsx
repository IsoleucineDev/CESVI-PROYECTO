import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "cesvi_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.token) {
        setToken(parsed.token);
        setUser(parsed.user || null);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token, user]);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const res = await fetch(`${API_URL}/api/v1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo iniciar sesión");

      const accessToken = data?.token || data?.access_token;
      const authUser = data?.user || null;
      if (!accessToken) throw new Error("No se recibió token");

      setToken(accessToken);
      setUser(authUser);
      return { ok: true };
    } catch (e) {
      const msg = e?.message || "Error inesperado";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setError,
    }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
