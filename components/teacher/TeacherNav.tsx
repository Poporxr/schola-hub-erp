"use client";

import { usePathname } from "next/navigation";
import { Bell, Calendar, GraduationCap, Menu, Search } from "lucide-react";

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
                    <h1 className="text-xs sm:text-sm md:text-base lg:text-xl font-semibold text-slate-800 truncate lg:mt-0">
                        {getTitleFromPath(pathname)}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
                <div className="relative hidden md:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 lg:w-64"
                    />
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden md:flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-gray-50 rounded-lg text-xs md:text-sm">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-500 shrink-0" />
                        <span className="text-gray-700 font-medium whitespace-nowrap">Term 2, 2024</span>
                    </div>
                    <button className="relative p-1.5 sm:p-2 text-slate-500 hover:bg-slate-50 rounded-full shrink-0">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default TeacherNav;
