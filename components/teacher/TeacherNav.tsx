"use client";

import { usePathname } from "next/navigation";
import { Bell, Calendar, GraduationCap, Menu } from "lucide-react";
import { useEffect, useState } from "react";

function getTitleFromPath(pathname: string) {
    const path = pathname.replace(/\/$/, "");

    if (/^\/student\/dashboard\/[^/]+$/.test(path)) return "Dashboard Overview";
    if (/^\/student\/profile\/[^/]+$/.test(path)) return " Profile";


    if (path === "/teacher/subjects") return "My Subjects";
    if (path === "/teacher/class") return "Class Overview";
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
                const name = [data?.firstName, data?.lastName].filter(Boolean).join(" ");
                setTeacherName(name || "Teacher");
            }
        }

        async function fetchTerm() {
            const res = await fetch("/api/term/current");
            if (!res.ok) return;
            const data = await res.json();
            if (isMounted) {
                const label = data?.sessionName ? `${data.name}, ${data.sessionName}` : data?.name;
                setTermLabel(label || "Current Term");
            }
        }

        fetchTeacher();
        fetchTerm();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <header className="sticky top-0 z-30 min-h-16 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden text-slate-500 hover:text-slate-700 shrink-0"
                    aria-label="Open sidebar"
                >
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <div className="pl-1 sm:pl-2 min-w-0">
                    <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 text-indigo-600 font-bold text-base sm:text-lg md:text-xl mb-0.5">
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 shrink-0" />
                        <span className="truncate">Schola | Hub</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-xs sm:text-sm md:text-base lg:text-xl font-semibold text-slate-800 truncate lg:mt-0">
                            {getTitleFromPath(pathname)}
                        </h1>
                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                            {isAuth ? (teacherName ?? "Loading...") : "Sign in"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden md:flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-gray-50 rounded-lg text-xs md:text-sm">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-500 shrink-0" />
                        <span className="text-gray-700 font-medium whitespace-nowrap">
                            {termLabel ?? "Loading..."}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TeacherNav;
