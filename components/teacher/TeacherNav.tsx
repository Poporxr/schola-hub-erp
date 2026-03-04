"use client";

import { usePathname } from "next/navigation";
import { Bell, Calendar, GraduationCap, Menu } from "lucide-react";
import { useEffect, useState } from "react";

function getTitleFromPath(pathname: string) {
  const path = pathname.replace(/\/$/, "");

  if (/^\/student\/dashboard\/[^/]+$/.test(path)) return "Dashboard Overview";
  if (/^\/student\/profile\/[^/]+$/.test(path)) return "Profile";

  if (path === "/teacher/subjects") return "My Subjects";
  if (path === "/teacher/classes") return "Class Overview";
  if (path === "/teacher/results") return "Enter Results";
  if (path === "/teacher/attendance") return "Record Attendance";
  if (path === "/teacher/profile") return "Profile Overview";

  return "Dashboard Overview";
}

const TeacherNav = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  const pathname = usePathname();
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [termLabel, setTermLabel] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchTeacher() {
      const res = await fetch("/api/teacherData");
      if (!res.ok) {
        if (isMounted) setIsAuth(false);
        return;
      }
      const data = await res.json();
      if (isMounted) {
        const name = [data?.firstName, data?.lastName]
          .filter(Boolean)
          .join(" ");
        setTeacherName(name || "Teacher");
      }
    }

    async function fetchTerm() {
      const res = await fetch("/api/term/current");
      if (!res.ok) return;
      const data = await res.json();
      if (isMounted) {
        const label = data?.sessionName
          ? `${data.name}, ${data.sessionName}`
          : data?.name;
        setTermLabel(label || "Current Term");
      }
    }

    fetchTeacher();
    fetchTerm();

    return () => {
      isMounted = false;
    };
  }, []);

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

          {/* Logo (small, not loud) */}
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

        {/* Right: actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Term: desktop/tablet only */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="whitespace-nowrap">
              {termLabel ?? "Loading term..."}
            </span>
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TeacherNav;