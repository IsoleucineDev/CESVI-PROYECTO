import React from "react";
import { Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { env, envBool } from "../../../config/runtimeEnv";

/**
 * PrivateRoute:
 * - Si VITE_DISABLE_KEYCLOAK=true => deja pasar siempre (modo DEV).
 * - Si Keycloak está activo => requiere authenticated.
 * - Opcionalmente valida roles si se pasan.
 */
export default function PrivateRoute({ children, roles = [] }) {
  const disableKeycloak = envBool("DISABLE_KEYCLOAK", true);
  const clientId = env("clientId", "");
  const { keycloak } = useKeycloak();

  // DEV sin Keycloak
  if (disableKeycloak) return children;

  // Si no hay keycloak aún o no está autenticado
  if (!keycloak || !keycloak.authenticated) {
    return <Navigate to="/" replace />;
  }

  // Validación opcional de roles (si tu app lo usa)
  if (roles.length > 0 && clientId) {
    const userRoles = keycloak.resourceAccess?.[clientId]?.roles || [];
    const allowed = roles.some((r) => userRoles.includes(r));
    if (!allowed) return <Navigate to="/" replace />;
  }

  return children;
}
