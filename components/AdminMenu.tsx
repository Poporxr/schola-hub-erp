"use client";

import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Presentation,
  School,
  BookOpen,
  FileBarChart,
  CreditCard,
  UserPlus,
  Settings,
  LogOut,
  PanelRightOpen,
} from "lucide-react";
import { usePathname } from "next/navigation";

type AdminMenuProps = {
  open: boolean;
  onClose: () => void;
};

const AdminMenu = ({ open, onClose }: AdminMenuProps) => {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  // Close sidebar on navigation (mobile only)
  const closeOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose();
    }
  };

  const linkClass = (href: string) =>
    `nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors ${
      isActive(href) ? "text-indigo-600 font-semibold bg-indigo-50" : "text-slate-600"
    }`;

  return (
    <aside
      className={[
        "w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col",
        "fixed inset-0 z-40 lg:static lg:inset-auto lg:h-screen",
        "transition-transform duration-300 transform",
        open ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
      ].join(" ")}
    >
      <div className="h-16 flex items-center justify-between px-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
          <GraduationCap className="w-8 h-8" />
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

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scroll">
        <Link href="/admin" onClick={closeOnMobile} className={linkClass("/admin/dashboard")}>
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>

        <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Academic
        </div>

        <Link
          href="/admin/students"
          onClick={closeOnMobile}
          className={linkClass("/admin/students")}
        >
          <Users className="w-5 h-5" />
          Students
        </Link>

        <Link
          href="/admin/teachers"
          onClick={closeOnMobile}
          className={linkClass("/admin/teachers")}
        >
          <Presentation className="w-5 h-5" />
          Teachers
        </Link>

        <Link
          href="/admin/classes"
          onClick={closeOnMobile}
          className={linkClass("/admin/classes")}
        >
          <School className="w-5 h-5" />
          Classes
        </Link>

        <Link
          href="/admin/subjects"
          onClick={closeOnMobile}
          className={linkClass("/admin/subjects")}
        >
          <BookOpen className="w-5 h-5" />
          Subjects
        </Link>

        <Link
          href="/admin/results"
          onClick={closeOnMobile}
          className={linkClass("/admin/results")}
        >
          <FileBarChart className="w-5 h-5" />
          Results
        </Link>

        <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Administration
        </div>

        <Link
          href="/admin/tuition"
          onClick={closeOnMobile}
          className={linkClass("/admin/tuition")}
        >
          <CreditCard className="w-5 h-5" />
          Tuition & Fees
        </Link>

        <Link
          href="/admin/parents"
          onClick={closeOnMobile}
          className={linkClass("/admin/parents")}
        >
          <UserPlus className="w-5 h-5" />
          Parents
        </Link>

        <Link
          href="/admin/settings"
          onClick={closeOnMobile}
          className={linkClass("/admin/settings")}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <Image
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Admin"
            className="w-9 h-9 rounded-full object-cover"
            width={36}
            height={36}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              Alex Morgan
            </p>
            <p className="text-xs text-slate-500 truncate">Administrator</p>
          </div>
          <Link href="/" onClick={closeOnMobile} className="text-slate-400 hover:text-slate-600">
            <LogOut className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default AdminMenu;
