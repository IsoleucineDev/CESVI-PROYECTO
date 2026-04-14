import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setAuthToken } from "../api/http";
import { loginRequest, meRequest } from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "cesvi_auth";

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeStorage(payload) {
  if (!payload?.token) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function AuthProvider({ children }) {
  const stored = readStorage();
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(stored?.user || null);
  const [token, setToken] = useState(stored?.token || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError("");
    setAuthToken(null);
    writeStorage(null);
  }, []);

  const hydrateUser = useCallback(async () => {
    const current = readStorage();
    if (!current?.token) {
      setBooting(false);
      return;
    }

    try {
      setAuthToken(current.token);
      const me = await meRequest();
      const nextUser = me?.user || current.user || null;
      setToken(current.token);
      setUser(nextUser);
      writeStorage({ token: current.token, user: nextUser });
    } catch {
      logout();
    } finally {
      setBooting(false);
    }
  }, [logout]);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError("");
    try {
      const response = await loginRequest({ email, password });
      const accessToken = response?.token || response?.access_token;
      const authUser = response?.user || null;

      if (!accessToken) {
        throw new Error(response?.error || "No se recibió token de sesión");
      }

      setAuthToken(accessToken);
      setToken(accessToken);
      setUser(authUser);
      writeStorage({ token: accessToken, user: authUser });
      return { ok: true, user: authUser };
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo iniciar sesión";
      setError(message);
      logout();
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      booting,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setUser,
      setError,
    }),
    [user, token, loading, error, booting, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}