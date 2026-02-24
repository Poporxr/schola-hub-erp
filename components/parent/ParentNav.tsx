"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
  GraduationCap,
  Menu,
  Search,
} from "lucide-react";

function getTitleFromPath(pathname: string) {
  const path = pathname.replace(/\/$/, "");

  if (/^\/parent\/dashboard\/[^/]+$/.test(path)) return "Dashboard Overview";
  if (/^\/parent\/profile\/[^/]+$/.test(path)) return "Profile";

  if (path === "/parent/payments") return "Payments Structure";
  if (path === "/parent/results") return "Results";
  if (path === "/parent/attendance") return "Attendance";
  if (path === "/parent/profile") return "Profile Overview";

  return "Dashboard Overview";
}

const ParentNav = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left: menu + logo + titles */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <GraduationCap className="h-5 w-5" />
          </div>

          {/* Page info */}
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <span className="truncate">Schola Hub</span>
            </div>
            <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: search + term (md+) + notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search: md+ only */}
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:w-64"
            />
          </div>

          {/* Term/info: md+ only */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="whitespace-nowrap">Term 1, 2026</span>
          </div>

          {/* Notifications */}
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default ParentNav;