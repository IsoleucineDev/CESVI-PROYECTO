import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";

import PrivateRoute from "./components/Global/helpers/PrivateRoute";
import Layout from "./components/Layout/Layout";

import Login from "./pages/login";
import Page404 from "./pages/Page404";
import Page403 from "./pages/Page403";

import Users from "./pages/Users/Home";
import Forms from "./pages/Configuracion/Forms/Home";
import Tables from "./pages/Configuracion/Tables/Home";
import CatalogosLegacy from "./components/Catalogos/Home";
import VerificacionUsuario from "./pages/VerificacionUsuario/VerificacionUsuario";

import Dashboard from "./app/pages/Dashboard.jsx";
import Expedientes from "./app/pages/Expedientes.jsx";
import NuevoCaso from "./app/pages/NuevoCaso.jsx";
import DetalleExpediente from "./app/pages/DetalleExpediente.jsx";
import Catalogos from "./app/pages/Catalogos.jsx";
import Perfil from "./app/pages/Perfil.jsx";

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
          <Route path="/" element={<Layout><Login /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />

          <Route path="/Dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/expedientes" element={<PrivateRoute><Layout><Expedientes /></Layout></PrivateRoute>} />
          <Route path="/expedientes/nuevo" element={<PrivateRoute><Layout><NuevoCaso /></Layout></PrivateRoute>} />
          <Route path="/expedientes/:id" element={<PrivateRoute><Layout><DetalleExpediente /></Layout></PrivateRoute>} />
          <Route path="/configuracion/catalogos" element={<PrivateRoute><Layout><Catalogos /></Layout></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><Layout><Perfil /></Layout></PrivateRoute>} />

          <Route path="/Configuracion/Forms" element={<PrivateRoute><Layout><Forms /></Layout></PrivateRoute>} />
          <Route path="/Configuracion/Tables" element={<PrivateRoute><Layout><Tables /></Layout></PrivateRoute>} />
          <Route path="/Configuracion/Catalogos" element={<PrivateRoute><Layout><CatalogosLegacy /></Layout></PrivateRoute>} />
          <Route path="/Configuracion/Users" element={<PrivateRoute><Layout><Users /></Layout></PrivateRoute>} />
          <Route path="/VerificacionUsuario" element={<PrivateRoute><Layout><VerificacionUsuario /></Layout></PrivateRoute>} />

          <Route path="/Page403" element={<PrivateRoute><Page403 /></PrivateRoute>} />
          <Route path="/Page404" element={<PrivateRoute><Layout><Page404 /></Layout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/Dashboard" replace />} />
        </Routes>
      </React.Suspense>
    </HashRouter>
  );
};

export default Router;
