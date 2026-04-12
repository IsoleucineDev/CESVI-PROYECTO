import React from "react";
import { createRoot } from "react-dom/client";
import "./css/tailwind.css";
import "antd/dist/reset.css";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./components/Global/Keycloak";
import Router from "./Router.jsx";

createRoot(document.getElementById("root")).render(
  <ReactKeycloakProvider authClient={keycloak}>
    <Router />
  </ReactKeycloakProvider>
);
