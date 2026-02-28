"use client";

import { Printer } from "lucide-react";

const PrintButton = () => {
  return (
    <button
      className="no-print print:hidden fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur transition hover:shadow-xl cursor-pointer"
      onClick={() => window.print()}
      aria-label="Print result"
      type="button"
    >
      <Printer className="h-4 w-4" />
      Print
    </button>
  );
};

export default PrintButton;
