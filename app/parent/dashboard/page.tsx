import { CalendarCheck, ChevronRight, Download } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import ParentAnnouncements from "@/components/parent/ParentAnnouncements";
import ParentAttendanceSummary from "@/components/parent/ParentAttendanceSummary";

const Page = async () => {
    const { userId } = await auth();
    if (!userId) {
        return <div className="p-6 text-sm text-slate-600">Sign in to view dashboard.</div>;
    }

    const [parent, currentTerm] = await Promise.all([
        prisma.parent.findFirst({
            where: { OR: [{ id: userId }, { userId }] },
            select: {
                id: true,
                user: { select: { firstName: true, lastName: true } },
                parentStudents: {
                    select: {
                        student: {
                            select: {
                                id: true,
                                admissionNumber: true,
                                user: { select: { firstName: true, lastName: true, image: true, status: true } },
                                classHistories: {
                                    orderBy: [{ createdAt: "desc" }],
                                    select: {
                                        id: true,
                                        class: { select: { id: true, name: true } },
                                        sessionId: true,
                                        termId: true,
                                        studentId: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),
        prisma.term.findFirst({
            where: { isCurrent: true, session: { isCurrent: true } },
            select: { id: true, sessionId: true, startDate: true, endDate: true },
        }),
    ]);

    if (!parent) {
        return <div className="p-6 text-sm text-slate-600">Parent profile not found.</div>;
    }
    if (!currentTerm) {
        return <div className="p-6 text-sm text-slate-600">No current term configured.</div>;
    }

    const children = parent.parentStudents.map((row) => row.student);
    const studentIds = children.map((child) => child.id);

    const classHistories = children
        .map((child) => child.classHistories.find((history) => history.sessionId === currentTerm.sessionId && history.termId === currentTerm.id))
        .filter((history): history is NonNullable<typeof history> => Boolean(history));

    const classIds = Array.from(new Set(classHistories.map((history) => history.class.id)));
    const classHistoryIds = classHistories.map((history) => history.id);

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const [attendanceRows, attendanceMonthRows, results, notices] = await Promise.all([
        prisma.attendance.findMany({
            where: {
                studentId: { in: studentIds },
                sessionId: currentTerm.sessionId,
                termId: currentTerm.id,
                date: {
                    gte: currentTerm.startDate,
                    lte: currentTerm.endDate,
                },
            },
            select: { studentId: true, status: true },
        }),
        prisma.attendance.findMany({
            where: {
                studentId: { in: studentIds },
                sessionId: currentTerm.sessionId,
                termId: currentTerm.id,
                date: {
                    gte: monthStart,
                    lte: monthEnd,
                },
            },
            select: { studentId: true, status: true },
        }),
        prisma.result.findMany({
            where: {
                classHistoryId: { in: classHistoryIds },
            },
            select: { studentId: true, totalScore: true },
        }),
        prisma.notice.findMany({
            where: {
                isPublished: true,
                sessionId: currentTerm.sessionId,
                OR: [{ targetAudience: null }, { targetAudience: "PARENTS" }, { targetAudience: "ALL" }],
            },
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            take: 3,
            select: {
                id: true,
                title: true,
                message: true,
                publishedAt: true,
                createdAt: true,
            },
        }),
    ]);

    const attendanceByStudent = attendanceRows.reduce((map, row) => {
        const stats = map.get(row.studentId) ?? { present: 0, absent: 0, late: 0, total: 0 };
        const next = { ...stats, total: stats.total + 1 };
        if (row.status === "PRESENT") next.present += 1;
        if (row.status === "ABSENT") next.absent += 1;
        if (row.status === "LATE") next.late += 1;
        map.set(row.studentId, next);
        return map;
    }, new Map<string, { present: number; absent: number; late: number; total: number }>());

    const monthAttendanceByStudent = attendanceMonthRows.reduce((map, row) => {
        const stats = map.get(row.studentId) ?? { present: 0, absent: 0, late: 0, total: 0 };
        const next = { ...stats, total: stats.total + 1 };
        if (row.status === "PRESENT") next.present += 1;
        if (row.status === "ABSENT") next.absent += 1;
        if (row.status === "LATE") next.late += 1;
        map.set(row.studentId, next);
        return map;
    }, new Map<string, { present: number; absent: number; late: number; total: number }>());

    const resultsByStudent = results.reduce((map, row) => {
        const stats = map.get(row.studentId) ?? { total: 0, count: 0 };
        map.set(row.studentId, { total: stats.total + row.totalScore, count: stats.count + 1 });
        return map;
    }, new Map<string, { total: number; count: number }>());

    const childCards = children.map((child) => {
        const classHistory = classHistories.find((history) => history.studentId === child.id);
        const className = classHistory?.class.name ?? "-";
        const attendanceStats = attendanceByStudent.get(child.id);
        const monthStats = monthAttendanceByStudent.get(child.id);
        const attendancePercent =
            attendanceStats && attendanceStats.total
                ? Math.round(((attendanceStats.present + attendanceStats.late) / attendanceStats.total) * 100)
                : monthStats && monthStats.total
                    ? Math.round(((monthStats.present + monthStats.late) / monthStats.total) * 100)
                    : null;
        const resultStats = resultsByStudent.get(child.id);
        const avgResult = resultStats && resultStats.count ? Number((resultStats.total / resultStats.count).toFixed(1)) : null;

        return {
            id: child.id,
            name: `${child.user.firstName} ${child.user.lastName}`.trim(),
            image: child.user.image,
            admissionNo: child.admissionNumber,
            status: child.user.status,
            className,
            attendancePercent,
            avgResult,
        };
    });

    const attendanceCards = children.map((child) => {
        const stats = monthAttendanceByStudent.get(child.id) ?? { present: 0, absent: 0, late: 0 };
        return {
            id: child.id,
            name: `${child.user.firstName} ${child.user.lastName}`.trim() || "Student",
            present: stats.present,
            absent: stats.absent,
            late: stats.late,
        };
    });

    return (
        <div className=" active space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 via-purple-600 to-fuchsia-500 p-6 sm:p-8 text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)]">

                {/* Soft Glow Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />

                {/* Floating Accent Shapes */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute right-0 top-8 h-16 w-16 rounded-full bg-white/5 blur-xl" />

                {/* Content */}
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                        Welcome Back, {parent.user.firstName} {parent.user.lastName}!
                    </h1>

                    <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
                        Your children are doing great this term — explore their progress below.
                    </p>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Children</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {childCards.length ? (
                        childCards.map((child) => (
                            <div
                                key={child.id}
                                className="relative bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
                            >
                                {/* Status pill – top right */}
                                <div className="absolute right-5 top-5">
                                    <span
                                        className={
                                            child.status === "ACTIVE"
                                                ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-100"
                                                : "inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 border border-slate-100"
                                        }
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        {child.status === "ACTIVE" ? "Active" : child.status ?? "Student"}
                                    </span>
                                </div>

                                {/* Header: avatar + basic info */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="relative">
                                        <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center">
                                            <UserAvatar
                                                src={child.image ?? undefined}
                                                alt="Student"
                                                size={56}
                                                className="h-14 w-14 border border-surface shadow-[0_0_0_1px_rgba(148,163,184,0.4)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 pr-16">
                                        <h4 className="text-base sm:text-lg font-semibold text-slate-900">
                                            {child.name || "Student"}
                                        </h4>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            {child.className || "Class not set"}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Admission No:{" "}
                                            <span className="font-medium text-slate-600">
                                                {child.admissionNo || "—"}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px w-full bg-slate-100 mb-4" />

                                {/* Stats row */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Attendance */}
                                    <div>
                                        <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5">
                                            Attendance
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-semibold text-emerald-600">
                                                {child.attendancePercent === null
                                                    ? "-"
                                                    : `${child.attendancePercent}%`}
                                            </span>
                                            <span className="text-xs text-slate-400">This term</span>
                                        </div>
                                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className={
                                                    (child.attendancePercent ?? 0) >= 90
                                                        ? "h-1.5 rounded-full bg-linear-to-r from-emerald-500 to-emerald-400"
                                                        : (child.attendancePercent ?? 0) >= 75
                                                            ? "h-1.5 rounded-full bg-linear-to-r from-amber-400 to-amber-300"
                                                            : (child.attendancePercent ?? 0) >= 50
                                                                ? "h-1.5 rounded-full bg-linear-to-r from-orange-500 to-orange-400"
                                                                : "h-1.5 rounded-full bg-linear-to-r from-rose-500 to-rose-400"
                                                }
                                                style={{ width: `${child.attendancePercent ?? 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Last result */}
                                    <div>
                                        <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1.5">
                                            Last Result
                                        </p>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {child.avgResult === null ? "-" : `${child.avgResult}%`}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">Overall average</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No linked students found for this parent.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ParentAnnouncements announcements={notices} />

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            <div className="p-2 bg-blue-600 text-white rounded-lg">
                                <Download className="w-5 h-5" />
                            </div>
                            <Link href={"/parent/results"} className="flex-1 text-left">
                                <p className="font-semibold text-gray-900 text-sm">Download Results</p>
                                <p className="text-xs text-gray-500">View report cards</p>
                            </Link>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                            <div className="p-2 bg-green-600 text-white rounded-lg">
                                <CalendarCheck className="w-5 h-5" />
                            </div>
                            <Link href={'/parent/attendance'} className="flex-1 text-left">
                                <p className="font-semibold text-gray-900 text-sm">View Attendance</p>
                                <p className="text-xs text-gray-500">Check attendance records</p>
                            </Link>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            <ParentAttendanceSummary items={attendanceCards} />
        </div>
    )
}
export default Page;
