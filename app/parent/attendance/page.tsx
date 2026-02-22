import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const statusStyles: Record<string, { badge: string; label: string; note: string }> = {
    PRESENT: {
        badge: "bg-green-100 text-green-800",
        label: "Present",
        note: "On time",
    },
    LATE: {
        badge: "bg-amber-100 text-amber-800",
        label: "Late",
        note: "Late arrival",
    },
    ABSENT: {
        badge: "bg-red-100 text-red-800",
        label: "Absent",
        note: "Absent",
    },
    EXCUSED: {
        badge: "bg-blue-100 text-blue-800",
        label: "Excused",
        note: "Excused",
    },
};

const Page = async ({ searchParams }: { searchParams?: { studentId?: string } }) => {
    const { userId } = await auth();
    if (!userId) {
        return <div className="p-6 text-sm text-slate-600">Sign in to view attendance.</div>;
    }

    const [parent, currentTerm] = await Promise.all([
        prisma.parent.findFirst({
            where: { OR: [{ id: userId }, { userId }] },
            select: {
                id: true,
                parentStudents: {
                    select: {
                        student: {
                            select: {
                                id: true,
                                admissionNumber: true,
                                user: { select: { firstName: true, lastName: true } },
                                classHistories: {
                                    orderBy: [{ createdAt: "desc" }],
                                    select: {
                                        class: { select: { id: true, name: true } },
                                        sessionId: true,
                                        termId: true,
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
    if (!children.length) {
        return <div className="p-6 text-sm text-slate-600">No linked students found for this parent.</div>;
    }

    const selectedId = searchParams?.studentId ?? children[0].id;
    const selectedChild = children.find((child) => child.id === selectedId) ?? children[0];
    const classHistory = selectedChild.classHistories.find(
        (history) => history.sessionId === currentTerm.sessionId && history.termId === currentTerm.id
    );

    const attendanceRows = await prisma.attendance.findMany({
        where: {
            studentId: selectedChild.id,
            sessionId: currentTerm.sessionId,
            termId: currentTerm.id,
            date: {
                gte: currentTerm.startDate,
                lte: currentTerm.endDate,
            },
        },
        orderBy: [{ date: "desc" }],
        select: {
            id: true,
            date: true,
            status: true,
            period: true,
            notes: true,
        },
    });

    const summary = attendanceRows.reduce(
        (acc, row) => {
            if (row.status === "PRESENT") acc.present += 1;
            if (row.status === "ABSENT") acc.absent += 1;
            if (row.status === "LATE") acc.late += 1;
            if (row.status === "EXCUSED") acc.excused += 1;
            acc.total += 1;
            return acc;
        },
        { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
    );

    const attendanceRate = summary.total
        ? Math.round(((summary.present + summary.late + summary.excused) / summary.total) * 100)
        : 0;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Attendance Records</h3>
                        <p className="text-sm text-gray-500">View your children&apos;s attendance history</p>
                    </div>
                    <Select defaultValue={selectedChild.id}>
                        <SelectTrigger className="w-[40%] px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                            <SelectValue placeholder="Select Ward" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            <SelectGroup>
                                {children.map((child) => (
                                    <SelectItem key={child.id} className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value={child.id}>
                                        {child.user.firstName} {child.user.lastName}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <p className="text-xs text-gray-600 font-medium">Present</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{summary.present} Days</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <p className="text-xs text-gray-600 font-medium">Absent</p>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{summary.absent} Days</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <p className="text-xs text-gray-600 font-medium">Late</p>
                        </div>
                        <p className="text-2xl font-bold text-amber-600">{summary.late} Days</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <p className="text-xs text-gray-600 font-medium">Percentage</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 border-collapse">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Day</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Class</th>
                                <th scope="col" className="px-6 py-3">Remarks</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {attendanceRows.length ? (
                                attendanceRows.map((row) => {
                                    const meta = statusStyles[row.status] ?? statusStyles.PRESENT;
                                    const dayLabel = row.date.toLocaleDateString("en-US", { weekday: "long" });
                                    const dateLabel = row.date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    });

                                    return (
                                        <tr key={row.id} className="bg-white hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{dateLabel}</td>
                                            <td className="px-6 py-4">{dayLabel}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${meta.badge}`}>
                                                    {meta.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{classHistory?.class.name ?? "-"}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500">{row.notes ?? meta.note}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                                        No attendance records for this term.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Page;
