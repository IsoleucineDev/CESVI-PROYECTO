/**
 * Topbar (nuevo)
 * - Barra superior simple estilo mockup
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
