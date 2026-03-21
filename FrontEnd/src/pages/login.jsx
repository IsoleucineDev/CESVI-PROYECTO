import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

const Login = () => {
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  useEffect(() => {
    const disableKeycloak =
      String(process.env.REACT_APP_DISABLE_KEYCLOAK).toLowerCase() === "true";

    // DEV sin Keycloak: entra directo
    if (disableKeycloak) {
      navigate("/Dashboard");
      return;
    }

    // Normal: login con Keycloak
    if (!keycloak.authenticated) {
      navigate("/");
      keycloak.login(
        process.env.REACT_APP_logoutOption || process.env.REACT_APP_logoutOptions
      );
    }
  }, [keycloak, navigate]);
};

export default Login;
