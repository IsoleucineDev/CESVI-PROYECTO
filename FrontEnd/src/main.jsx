import React from "react";
import { createRoot } from "react-dom/client";
import "./css/tailwind.css";
import "antd/dist/reset.css";
import { AuthProvider } from "./hooks/useAuth";
import Router from "./Router.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </React.StrictMode>
);