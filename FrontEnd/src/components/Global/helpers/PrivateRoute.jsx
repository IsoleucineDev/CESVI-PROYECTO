import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "react-router-dom";
import BackdropMUI from "../BackdropCompont";

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const { keycloak, initialized } = useKeycloak();

  const disableKeycloak =
    String(process.env.REACT_APP_DISABLE_KEYCLOAK).toLowerCase() === "true";

  // DEV sin Keycloak
  if (disableKeycloak) return children;

  const isLoggedIn = keycloak.authenticated;

  if (!initialized) {
    return <BackdropMUI open={true} />;
  }

  if (keycloak.authenticated) {
    let PerAplication = false;

    if (keycloak.tokenParsed?.access_system) {
      keycloak.tokenParsed.access_system[0].map((access) => {
        if (access === process.env.REACT_APP_clientId) {
          PerAplication = true;
        }
      });
    }

    if (!PerAplication) {
      keycloak.logout(
        process.env.REACT_APP_logoutOptions || process.env.REACT_APP_logoutOption
      );
      return;
    }
  }

  return isLoggedIn ? children : navigate("/");
};

export default PrivateRoute;
