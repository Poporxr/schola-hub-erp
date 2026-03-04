"use client";

import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import {
    LayoutDashboard,
    User,
    LogOut,
    FileText,
    CalendarCheck,
    PanelRightOpen,
    GraduationCap,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

type AdminMenuProps = {
    open: boolean;
    onClose: () => void;
    parentInfo: {
        name: string;
        image: string | null;
        status: string;
        childrenCount: number;
    } | null;
};

const ParentMenu = ({ open, onClose, parentInfo }: AdminMenuProps) => {
     const {signOut} = useClerk();
    const pathname = usePathname();

    const isActive = (href: string) => pathname.startsWith(href);

    // Close sidebar on navigation (mobile only)
    const closeOnMobile = () => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onClose();
        }
    };

    const linkClass = (href: string) =>
        `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-2 ${
            isActive(href)
                ? "bg-indigo-50 text-slate-900 font-semibold border-indigo-500"
                : "text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900"
        }`;

    return (
         <aside className={[
            "w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col",
            "fixed inset-0 z-40 lg:static lg:inset-auto lg:h-screen",
            "transition-transform duration-300 transform",
            open ? "translate-x-0" : "-translate-x-full",
            "lg:translate-x-0",
        ].join(" ")}>
            <div className="h-16 flex items-center justify-between px-2 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
                    <GraduationCap className="w-8 h-8 text-indigo-500" />
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

            <div className="p-4 flex flex-col items-center border-b border-slate-100">
                <UserAvatar
                    src={parentInfo?.image ?? undefined}
                    alt="Parent Profile"
                    size={80}
                    className="w-20 h-20 border-4 border-slate-100 mb-3"
                />
                <h3 className="font-semibold text-slate-900">{parentInfo?.name ?? "Parent"}</h3>
                <p className="text-sm text-slate-500">Parent/Guardian</p>
                <span className="mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                    {parentInfo?.childrenCount ?? 0} {parentInfo?.childrenCount === 1 ? "Child" : "Children"} Enrolled
                </span>
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

                <Link href={"/parent/profile"}
                onClick={closeOnMobile}  className={linkClass("/parent/profile")}>
                    <User className="w-5 h-5"/>
                    My Profile
                </Link>
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={async () => {
                        try {
                            await signOut();
                            toast.success("Logged out successfully");
                        } catch (error) {
                            toast.error("Failed to log out");
                        }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5"/>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default ParentMenu;
