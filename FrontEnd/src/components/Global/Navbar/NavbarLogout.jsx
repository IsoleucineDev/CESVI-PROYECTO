import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

const NavbarLogout = () => {
  const navigate    = useNavigate();
  const { logout }  = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
    >
      Cerrar sesión
    </button>
  );
};

export default NavbarLogout;
