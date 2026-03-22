import React from "react";
import PrivateRoute from "./components/Global/helpers/PrivateRoute";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";

import Layout from "./components/Layout/Layout";

// Páginas actuales (no cambiamos pantallas todavía)
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import Users from "./pages/Users/Home";

// configuracion
import Forms from "./pages/Configuracion/Forms/Home";
import Tables from "./pages/Configuracion/Tables/Home";
import Catalogos from "./components/Catalogos/Home";

import Page404 from "./pages/Page404";
import Page403 from "./pages/Page403";
import VerificacionUsuario from "./pages/VerificacionUsuario/VerificacionUsuario";

const loading = () => (
  <div className="animated fadeIn pt-1 text-center">
    <Spin /> Cargando...
  </div>
);

const Router = () => {
  return (
    <HashRouter>
      <React.Suspense fallback={loading()}>
        <Routes>
          {/* Público */}
          <Route path="/login" element={<Login />} />

          {/* Redirige raíz al Dashboard */}
          <Route path="/" element={<Navigate to="/Dashboard" replace />} />

          {/* Protegido + Layout nuevo (Outlet) */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/Dashboard" element={<Dashboard />} />

            <Route path="Configuracion/Forms" element={<Forms />} />
            <Route path="Configuracion/Tables" element={<Tables />} />
            <Route path="Configuracion/Catalogos" element={<Catalogos />} />
            <Route path="Configuracion/Users" element={<Users />} />

            <Route path="VerificacionUsuario" element={<VerificacionUsuario />} />

            <Route path="/Page403" element={<Page403 />} />
            <Route path="/Page404" element={<Page404 />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/Dashboard" replace />} />
          </Route>
        </Routes>
      </React.Suspense>
    </HashRouter>
  );
};

export default Router;
