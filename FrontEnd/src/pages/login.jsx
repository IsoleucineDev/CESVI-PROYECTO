import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { env, envBool } from "../config/runtimeEnv";

const Login = () => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  useEffect(() => {
    const disableKeycloak = envBool("DISABLE_KEYCLOAK", true);

    // DEV sin Keycloak: entra directo al Dashboard
    if (disableKeycloak) {
      navigate("/Dashboard", { replace: true });
      return;
    }

    // Normal: si no está autenticado, manda a login
    if (!keycloak?.authenticated) {
      const option = env("logoutOption", env("logoutOptions", ""));
      keycloak?.login(option ? { redirectUri: option } : undefined);
      return;
    }

    // Ya autenticado
    navigate("/Dashboard", { replace: true });
  }, [keycloak, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white border border-gray-200 rounded shadow-sm p-6 text-sm text-gray-700">
        Cargando sesión...
      </div>
    </div>
  );
};

export default Login;
