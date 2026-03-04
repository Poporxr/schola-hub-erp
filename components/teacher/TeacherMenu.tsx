"use client";

import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import {
    GraduationCap,
    LayoutDashboard,
    BookOpen,
    PanelRightOpen,
    User,
    LogOut,
    Users,
    Calendar,
    ClipboardCheck,
    FileText,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AdminMenuProps = {
    open: boolean;
    onClose: () => void;
};
type TeacherData = {
    firstName?: string;
    lastName?: string;
    staffId?: string;
    image?: string;
};

const TeacherMenu = ({ open, onClose }: AdminMenuProps) => {
    const [teacher, setTeacher] = useState<TeacherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            const res = await fetch("/api/teacherData");
            const data = await res.json();
            if (isMounted) {
                setTeacher(data);
                setIsLoading(false);
            }
        }
        fetchData();
        return () => {
            isMounted = false;
        };
    }, []);

    const { signOut } = useClerk();
    const pathname = usePathname();

    const isActive = (href: string) => pathname.startsWith(href);

    // Close sidebar on navigation (mobile only)
    const closeOnMobile = () => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onClose();
        }
    };

    const linkClass = (href: string) =>
        ` w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors ${isActive(href) ? "text-slate-900 font-semibold bg-indigo-50" : "text-slate-600"
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
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xl">
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
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-50 mb-3">
                    <UserAvatar
                        src={teacher?.image ?? undefined}
                        alt="Teacher Profile"
                        size={80}
                        className="w-20 h-20"
                    />
                </div>
                <h3 className="font-semibold text-gray-900">
                    {isLoading ? "Loading..." : [teacher?.firstName, teacher?.lastName].filter(Boolean).join(" ") || "Teacher"}
                </h3>
                <span className="mt-2 px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                    Staff ID: {isLoading ? " " : teacher?.staffId ?? "-"}
                </span>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <Link href={"/teacher"}
                    onClick={closeOnMobile} className={linkClass("/teacher/dashboard")}>
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </Link>

                <Link
                    href={"/teacher/classes"}
                    onClick={closeOnMobile}
                    className={linkClass("/teacher/class")}>
                    <Users className="w-5 h-5" />
                    My Classes
                </Link>

                <Link
                    href={"/teacher/attendance"}
                    onClick={closeOnMobile}
                    className={linkClass("/teacher/attendance")}>
                    <ClipboardCheck className="w-5 h-5" />
                    Mark Attendance
                </Link>

                <Link
                    href={"/teacher/results"}
                    onClick={closeOnMobile}
                    className={linkClass("/teacher/results")}>
                    <FileText className="w-5 h-5" />
                    Enter Results
                </Link>

                <Link
                    href={"/teacher/subjects"}
                    onClick={closeOnMobile}
                    className={linkClass("/teacher/subjects")}>
                    <BookOpen className="w-5 h-5" />
                    My Subjects
                </Link>

                <Link
                    href={"/teacher/timetable"}
                    onClick={closeOnMobile}
                    className={linkClass("/teacher/timetable")}>
                    <Calendar className="w-5 h-5" />
                    Timetable
                </Link>

                <Link
                    href={"/teacher/profile"}
                    onClick={closeOnMobile}
                    className={linkClass("/teacher/profile")}>
                    <User className="w-5 h-5" />
                    My Profile
                </Link>
            </nav>

            <div className="px-4 py-2 border-t border-gray-100">
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
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default TeacherMenu;
