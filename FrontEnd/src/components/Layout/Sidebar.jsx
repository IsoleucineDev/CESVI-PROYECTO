import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, User, ChevronRight, ChevronLeft } from "lucide-react";

const BRAND_COLOR = "#00ADCF";

const NAV_ITEMS = [
  {
    id: "dashboard",
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    path: "/Dashboard",
  },
  {
    id: "expedientes",
    icon: <FileText size={20} />,
    label: "Expedientes RAT",
    path: "/expedientes",
  },
  {
    id: "configuracion",
    icon: <Settings size={20} />,
    label: "Configuración",
    children: [
      { label: "Catálogos", path: "/configuracion/catalogos" },
      { label: "Usuarios", path: "/perfil" },
    ],
  },
  {
    id: "perfil",
    icon: <User size={20} />,
    label: "Perfil",
    path: "/perfil",
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const submenuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (submenuRef.current && !submenuRef.current.contains(e.target)) {
        setOpenSubmenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (item) => {
    if (item.path) {
      return location.pathname.startsWith(item.path);
    }
    if (item.children) {
      return item.children.some((c) => location.pathname.startsWith(c.path));
    }
    return false;
  };

  const handleItemClick = (item) => {
    if (item.children) {
      setOpenSubmenu(openSubmenu === item.id ? null : item.id);
    } else if (item.path) {
      navigate(item.path);
      setOpenSubmenu(null);
    }
  };

  const sidebarWidth = collapsed ? "w-[60px]" : "w-[200px]";

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-gray-200 transition-all duration-200 z-40 ${sidebarWidth} shrink-0`}
      style={{ minHeight: "100vh" }}
    >
      <div
        className="flex items-center justify-center h-[52px] border-b border-gray-100 cursor-pointer"
        onClick={() => navigate("/Dashboard")}
        title="CESVI México"
      >
        <CesviLogo color={BRAND_COLOR} />
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-1 relative" ref={submenuRef}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => handleItemClick(item)}
                onMouseEnter={(e) => {
                  if (collapsed) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ id: item.id, y: rect.top });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
                className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors duration-150 group ${
                  active ? "bg-[#E0F7FA] text-[#00ADCF]" : "text-gray-400 hover:bg-gray-50 hover:text-[#00ADCF]"
                }`}
                style={{ minHeight: 40 }}
              >
                <span className={`shrink-0 ${active ? "text-[#00ADCF]" : ""}`}>{item.icon}</span>
                {!collapsed && <span className="text-xs font-medium truncate">{item.label}</span>}
                {!collapsed && item.children && (
                  <ChevronRight size={14} className={`ml-auto transition-transform ${openSubmenu === item.id ? "rotate-90" : ""}`} />
                )}
              </button>

              {collapsed && tooltip?.id === item.id && (
                <div
                  className="fixed left-[64px] z-50 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
                  style={{ top: tooltip.y + 8 }}
                >
                  {item.label}
                </div>
              )}

              {item.children && openSubmenu === item.id && (
                <div
                  className={`${
                    collapsed
                      ? "fixed left-[64px] bg-white border border-gray-200 shadow-lg rounded-lg py-1 z-50 min-w-[160px]"
                      : "mt-1 ml-2 flex flex-col gap-0.5"
                  }`}
                  style={collapsed ? { top: tooltip?.y || 0 } : {}}
                >
                  {item.children.map((child) => (
                    <button
                      key={child.path}
                      onClick={() => {
                        navigate(child.path);
                        setOpenSubmenu(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded transition-colors ${
                        location.pathname.startsWith(child.path)
                          ? "bg-[#E0F7FA] text-[#00ADCF]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#00ADCF]"
                      }`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-gray-100 text-gray-400 hover:text-[#00ADCF] hover:bg-gray-50 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}

function CesviLogo({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" stroke={color} strokeWidth="2" fill="none" />
      <polygon points="14,8 20,12 20,16 14,20 8,16 8,12" fill={color} opacity="0.7" />
      <polygon points="14,11 17,13 17,15 14,17 11,15 11,13" fill={color} />
    </svg>
  );
}
