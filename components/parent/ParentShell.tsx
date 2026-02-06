"use client";

import { useEffect, useState } from "react";
import ParentMenu from "./ParentMenu";
import ParentNav from "./ParentNav";


export default function ParentShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      < ParentMenu
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Backdrop (mobile only) */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-10 bg-black/40 lg:hidden"
        />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto bg-slate-50 custom-scroll">
        <ParentNav onToggleSidebar={() => setSidebarOpen(v => !v)} />
        <div className="flex-1 p-4">
          {children}
        </div>
      </main>
    </div>
  );
}
