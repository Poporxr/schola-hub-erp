import { CalendarCheck, ChevronRight, CreditCard, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { formatCurrency } from "@/lib/settings";
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

    const [attendanceRows, attendanceMonthRows, feeAssignments, payments, results, notices] = await Promise.all([
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
        prisma.classFeeAssignment.findMany({
            where: {
                classId: { in: classIds },
                sessionId: currentTerm.sessionId,
                termId: currentTerm.id,
            },
            include: {
                feeStructure: {
                    select: {
                        items: { select: { amount: true } },
                    },
                },
            },
        }),
        prisma.payment.findMany({
            where: {
                studentId: { in: studentIds },
                assignment: {
                    classId: { in: classIds },
                    sessionId: currentTerm.sessionId,
                    termId: currentTerm.id,
                },
            },
            select: { studentId: true, amount: true, assignmentId: true },
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

    const feeTotalByClass = feeAssignments.reduce((map, assignment) => {
        const total = assignment.feeStructure.items.reduce((sum, item) => sum + item.amount, 0);
        map.set(assignment.classId, (map.get(assignment.classId) ?? 0) + total);
        return map;
    }, new Map<string, number>());

    const paidByStudent = payments.reduce((map, payment) => {
        map.set(payment.studentId, (map.get(payment.studentId) ?? 0) + payment.amount);
        return map;
    }, new Map<string, number>());

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
        const feeTotal = classHistory ? feeTotalByClass.get(classHistory.class.id) ?? 0 : 0;
        const paid = paidByStudent.get(child.id) ?? 0;
        const balance = feeTotal ? Math.max(feeTotal - paid, 0) : null;
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
            balance,
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
            <div className="bg-linear-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold mb-2">
                    Welcome Back, {parent.user.firstName} {parent.user.lastName}!
                </h1>
                <p className="text-purple-100">Your children are doing great this term. Check their progress below.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Children</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {childCards.length ? (
                        childCards.map((child) => (
                            <div key={child.id} className="child-card bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-purple-50">
                                        <Image
                                            width={50}
                                            height={50}
                                            src={child.image ?? "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=200&q=80"}
                                            alt="Student"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 text-lg">{child.name || "Student"}</h4>
                                        <p className="text-sm text-gray-500">
                                            {child.className} -   Admission No: {child.admissionNo}
                                        </p>
                                        <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                            {child.status === "ACTIVE" ? "Active Student" : child.status ?? "Student"}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Attendance</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-green-600">
                                                {child.attendancePercent === null ? "-" : `${child.attendancePercent}%`}
                                            </span>
                                            <span className="text-xs text-gray-500">This term</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1 rounded-full mt-2">
                                            <div
                                                className={
                                                    (child.attendancePercent ?? 0) >= 90
                                                        ? "bg-green-500 h-1 rounded-full"
                                                        : (child.attendancePercent ?? 0) >= 75
                                                            ? "bg-yellow-500 h-1 rounded-full"
                                                            : (child.attendancePercent ?? 0) >= 50
                                                                ? "bg-orange-500 h-1 rounded-full"
                                                                : "bg-red-500 h-1 rounded-full"
                                                }
                                                style={{ width: `${child.attendancePercent ?? 0}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Fee Balance</p>
                                        <p className="text-lg font-bold text-orange-600">
                                            {child.balance === null ? "-" : formatCurrency(child.balance)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Last Result</p>
                                        <p className="text-lg font-bold text-purple-600">
                                            {child.avgResult === null ? "-" : `${child.avgResult}%`}
                                        </p>
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
                        <button className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                            <div className="p-2 bg-purple-600 text-white rounded-lg">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <Link href={'/parent/payments'} className="flex-1 text-left">
                                <p className="font-semibold text-gray-900 text-sm">Pay School Fees</p>
                                <p className="text-xs text-gray-500">Make payment online</p>
                            </Link>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
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
