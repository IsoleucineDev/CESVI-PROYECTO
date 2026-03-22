/**
 * Sidebar (nuevo)
 * - Placeholder para ir migrando al diseño del CESVI_MOCKUP
 * - No toca Keycloak ni tu menú dinámico todavía.
 */
import React from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  "block px-3 py-2 rounded " +
  (isActive ? "bg-gray-200 text-black" : "text-gray-700 hover:bg-gray-100");

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
      <div className="font-bold text-lg mb-6">CESVI</div>

      <nav className="space-y-2">
        <NavLink className={linkClass} to="/Dashboard">Dashboard</NavLink>
        <NavLink className={linkClass} to="/Configuracion/Users">Usuarios</NavLink>
        <NavLink className={linkClass} to="/Configuracion/Catalogos">Catálogos</NavLink>
      </nav>
    </aside>
  );
}
