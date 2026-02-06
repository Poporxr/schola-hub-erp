"use client";

import Image from "next/image";
import Link from "next/link";
import {
    LayoutDashboard,
    User,
    LogOut,
    FileText,
    CalendarCheck,
    CreditCard,
    PanelRightOpen,
    GraduationCap,
} from "lucide-react";
import { usePathname } from "next/navigation";

type AdminMenuProps = {
    open: boolean;
    onClose: () => void;
};

const ParentMenu = ({ open, onClose }: AdminMenuProps) => {
    const pathname = usePathname();

    const isActive = (href: string) => pathname.startsWith(href);

    // Close sidebar on navigation (mobile only)
    const closeOnMobile = () => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onClose();
        }
    };

    const linkClass = (href: string) =>
        ` w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors ${isActive(href) ? "bg-purple-50 font-semibold text-purple-700" : "text-slate-600"
        }`;

    return (
         <aside className={[
            "w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col",
            "fixed inset-0 z-40 lg:static lg:inset-auto lg:h-screen",
            "transition-transform duration-300 transform",
            open ? "translate-x-0" : "-translate-x-full",
            "lg:translate-x-0",
        ].join(" ")}>
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

            <div className="p-4 flex flex-col items-center border-b border-gray-100">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-50 mb-3">
                    <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Parent Profile" className="w-full h-full object-cover" width={50} height={50} />
                </div>
                <h3 className="font-semibold text-gray-900">Mr. Okafor Emmanuel</h3>
                <p className="text-sm text-gray-500">Parent/Guardian</p>
                <span className="mt-2 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">2 Children Enrolled</span>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <Link href={"/parent"}
                onClick={closeOnMobile}  className={linkClass("/parent/dashboard")}>
                    <LayoutDashboard className="w-5 h-5"/>
                    Dashboard
                </Link>

                <Link href={"/parent/attendance"}
                onClick={closeOnMobile}  className={linkClass("/parent/attendance")}>
                    <CalendarCheck className="w-5 h-5"/>
                    Attendance
                </Link>

                <Link href={"/parent/results"}
                onClick={closeOnMobile}  className={linkClass("/parent/results")}>
                    <FileText className="w-5 h-5"/>
                    Results
                </Link>

                <Link href={"/parent/payments"}
                onClick={closeOnMobile}  className={linkClass("/parent/payments")}>
                    <CreditCard className="w-5 h-5"/>
                    Fees & Payments
                </Link>

                <Link href={"/parent/profile"}
                onClick={closeOnMobile}  className={linkClass("/parent/profile")}>
                    <User className="w-5 h-5"/>
                    My Profile
                </Link>
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-5 h-5"/>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default ParentMenu;
