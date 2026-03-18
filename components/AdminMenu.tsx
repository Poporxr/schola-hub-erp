"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Presentation,
  School,
  BookOpen,
  FileBarChart,
  UserPlus,
  PanelRightOpen,
  ShieldAlert,
  CalendarDays,
} from "lucide-react";
import { usePathname } from "next/navigation";

const ClientUserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

type AdminMenuProps = {
  open: boolean;
  onClose: () => void;
};

const AdminMenu = ({ open, onClose }: AdminMenuProps) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Treat /admin and /admin/dashboard as same "Dashboard"
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    return pathname.startsWith(href);
  };

  const closeOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose();
    }
  };

  const linkClass = (href: string) => {
    const active = isActive(href);

    return [
      "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
      "hover:bg-slate-100 hover:text-slate-900",
      active
        ? "text-slate-900 font-semibold bg-indigo-50 border-l-2 border-indigo-500"
        : "text-slate-600 font-medium border-l-2 border-transparent",
    ].join(" ");
  };

  return (
    <aside
      className={[
        "w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col",
        "fixed inset-y-0 left-0 z-40 lg:static lg:h-screen",
        "transition-transform duration-300 transform",
        open ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
      ].join(" ")}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
          <GraduationCap className="w-8 h-8 text-slate-900" />
          <span>Schola | Hub</span>
        </div>

        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Close sidebar"
        >
          <PanelRightOpen className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scroll">
        <Link
          href="/admin"
          onClick={closeOnMobile}
          className={linkClass("/admin")}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        <div className="pt-4 pb-1 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Academic
        </div>

        <Link
          href="/admin/students"
          onClick={closeOnMobile}
          className={linkClass("/admin/students")}
        >
          <Users className="w-5 h-5" />
          <span>Students</span>
        </Link>

        <Link
          href="/admin/teachers"
          onClick={closeOnMobile}
          className={linkClass("/admin/teachers")}
        >
          <Presentation className="w-5 h-5" />
          <span>Teachers</span>
        </Link>

        <Link
          href="/admin/classes"
          onClick={closeOnMobile}
          className={linkClass("/admin/classes")}
        >
          <School className="w-5 h-5" />
          <span>Classes</span>
        </Link>

        <Link
          href="/admin/subjects"
          onClick={closeOnMobile}
          className={linkClass("/admin/subjects")}
        >
          <BookOpen className="w-5 h-5" />
          <span>Subjects</span>
        </Link>

        <Link
          href="/admin/results"
          onClick={closeOnMobile}
          className={linkClass("/admin/results")}
        >
          <FileBarChart className="w-5 h-5" />
          <span>Results</span>
        </Link>

        <Link
          href="/admin/timetable"
          onClick={closeOnMobile}
          className={linkClass("/admin/timetable")}
        >
          <CalendarDays className="w-5 h-5" />
          <span>Timetable</span>
        </Link>

        <div className="pt-4 pb-1 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Administration
        </div>

        <Link
          href="/admin/parents"
          onClick={closeOnMobile}
          className={linkClass("/admin/parents")}
        >
          <UserPlus className="w-5 h-5" />
          <span>Parents</span>
        </Link>

        <Link
          href="/admin/academic-rollover"
          onClick={closeOnMobile}
          className={linkClass("/admin/academic-rollover")}
        >
          <ShieldAlert className="w-5 h-5" />
          <span>Academic Rollover</span>
        </Link>
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0">
            <div className="h-9 w-9 rounded-full bg-slate-200" aria-hidden="true" />
            <div className="absolute inset-0">
              <ClientUserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9",
                  },
                }}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              Alex Morgan
            </p>
            <p className="text-xs text-slate-500 truncate">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminMenu;
