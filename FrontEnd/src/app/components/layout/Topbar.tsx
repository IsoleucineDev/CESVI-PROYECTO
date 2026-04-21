import { useLocation, useNavigate } from "react-router";
import { LayoutGrid, User, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";

const PAGE_TITLES: Record<string, string> = {
  "/":                           "Dashboard",
  "/Dashboard":                  "Dashboard",
  "/expedientes":                "Expedientes RAT",
  "/expedientes/nuevo":          "Nuevo Expediente",
  "/configuracion/catalogos":    "Configuración / Catálogos",
  "/perfil":                     "Mi Perfil",
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/expedientes/")) return "Detalle de Expediente";
  return "Dashboard";
}

export function Topbar() {
  const location               = useLocation();
  const navigate               = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ── Auth ────────────────────────────────────────────────────────────────
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();                         // limpia token + localStorage
    setShowUserMenu(false);
    navigate("/login", { replace: true });
  };

  const nombreUsuario  = user?.name  || user?.nombre || user?.email || "Usuario";
  const rolUsuario     = user?.role  || user?.rol    || "Perito";

  const title = getTitle(location.pathname);

  return (
    <header
      className="h-[52px] flex items-center justify-between px-4 text-white shrink-0 relative z-30"
      style={{ backgroundColor: "#00ADCF" }}
    >
      <span className="text-base font-medium tracking-wide">{title}</span>

      <div className="flex items-center gap-3">
        <button className="p-1.5 rounded hover:bg-white/20 transition-colors" title="Aplicaciones">
          <LayoutGrid size={20} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <User size={16} />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded shadow-lg z-50 w-52">
                {/* Info del usuario */}
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-800 truncate">{nombreUsuario}</p>
                  <p className="text-xs text-gray-500">{rolUsuario}</p>
                </div>

                <button
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => { navigate("/perfil"); setShowUserMenu(false); }}
                >
                  <User size={13} className="text-gray-400" />
                  Mi Perfil
                </button>

                <div className="border-t border-gray-100">
                  <button
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut size={13} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
