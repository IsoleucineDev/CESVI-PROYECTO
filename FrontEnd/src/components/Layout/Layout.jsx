/**
 * Layout nuevo (estilo CESVI_MOCKUP)
 * ------------------------------------------------
 * Qué cambia:
 * - Antes Layout recibía {children} y armaba AntD + menú dinámico.
 * - Ahora Layout usa <Outlet /> (React Router) para mostrar la página actual.
 *
 * Qué NO cambia (todavía):
 * - Conservamos Header.jsx y Footer.jsx existentes para no romper tu app.
 *
 * El layout viejo quedó respaldado como Layout.old.jsx
 */
import React from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";

// Nuevos componentes visuales (placeholder por ahora)
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar visual (mockup) */}
        <Topbar />

        {/* Tu header existente (por compatibilidad) */}
        <Header />

        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
