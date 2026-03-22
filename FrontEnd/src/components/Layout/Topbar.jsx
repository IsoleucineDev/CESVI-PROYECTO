/**
 * Topbar (nuevo)
 * - Barra superior simple estilo mockup
 * - Usamos tu Header.jsx existente abajo para no romper funcionalidad.
 */
import React from "react";

export default function Topbar() {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="font-semibold">Sistema Integral CESVI</div>
      <div className="text-xs text-gray-500">UI nueva</div>
    </div>
  );
}
EOF 
cat > FrontEnd/src/components/Layout/Topbar.jsx <<'EOF'
/**
 * Topbar (nuevo)
 * - Barra superior simple estilo mockup
 * - Usamos tu Header.jsx existente abajo para no romper funcionalidad.
 */
import React from "react";

export default function Topbar() {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="font-semibold">Sistema Integral CESVI</div>
      <div className="text-xs text-gray-500">UI nueva</div>
    </div>
  );
}
