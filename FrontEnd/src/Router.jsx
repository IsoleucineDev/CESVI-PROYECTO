import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Login from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./app/pages/Dashboard.jsx";
import Expedientes from "./app/pages/Expedientes.jsx";
import NuevoCaso from "./app/pages/NuevoCaso.jsx";
import DetalleExpediente from "./app/pages/DetalleExpediente.jsx";
import Catalogos from "./app/pages/Catalogos.jsx";
import Perfil from "./app/pages/Perfil.jsx";

export default function Router() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/expedientes" element={<Expedientes />} />
            <Route path="/expedientes/nuevo" element={<NuevoCaso />} />
            <Route path="/expedientes/:id" element={<DetalleExpediente />} />
            <Route path="/configuracion/catalogos" element={<Catalogos />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/Dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}