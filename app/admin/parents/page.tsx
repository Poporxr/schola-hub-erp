import Image from "next/image";
import {
    Mail,
    Download,
    Plus,
    Phone,
    MoreHorizontal,
    Users,
    AlertCircle,
    Wallet,
    TrendingUp,
    ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/utils";
import ParentsFilters from "@/components/parents/ParentsFilters";
import type { PaymentStatus } from "@/generated/prisma/client";

type SearchParams = {
    search?: string | string[];
    classId?: string | string[];
    status?: string | string[];
    page?: string | string[];
};

type ParentRow = {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    image?: string | null;
    students: { id: string; name: string; image?: string | null }[];
    status: "Paid" | "Owing" | "Partial";
    balance: { amount: string; raw: number; label?: string };
    lastPayment?: string;
};

const formatNaira = (value: number) =>
    `₦${value.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const Page = async ({
    searchParams,
}: {
    searchParams?: SearchParams | Promise<SearchParams>;
}) => {
    const resolvedSearchParams = await searchParams;
    const classId = Array.isArray(resolvedSearchParams?.classId) ? resolvedSearchParams?.classId[0] : resolvedSearchParams?.classId;
    const search = Array.isArray(resolvedSearchParams?.search) ? resolvedSearchParams?.search[0] : resolvedSearchParams?.search;
    const status = Array.isArray(resolvedSearchParams?.status) ? resolvedSearchParams?.status[0] : resolvedSearchParams?.status;
    const pageParam = Array.isArray(resolvedSearchParams?.page) ? resolvedSearchParams?.page[0] : resolvedSearchParams?.page;
    const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

    const [classes, currentSession, allParents] = await Promise.all([
        prisma.class.findMany({ select: { id: true, name: true }, orderBy: [{ name: "asc" }] }),
        prisma.academicSession.findFirst({ where: { isCurrent: true }, select: { id: true } }),
        prisma.parent.findMany({
            where: {
                ...(search
                    ? {
                        user: {
                            OR: [
                                { firstName: { contains: search, mode: "insensitive" } },
                                { lastName: { contains: search, mode: "insensitive" } },
                                { email: { contains: search, mode: "insensitive" } },
                                { phone: { contains: search, mode: "insensitive" } },
                            ],
                        },
                    }
                    : {}),
            },
            select: {
                id: true,
                user: { select: { firstName: true, lastName: true, email: true, phone: true, image: true } },
                parentStudents: {
                    select: {
                        student: {
                            select: {
                                id: true,
                                user: { select: { firstName: true, lastName: true, image: true } },
                            },
                        },
                    },
                },
            },
        }),
    ]);

    const currentTerm = currentSession
        ? await prisma.term.findFirst({
            where: { sessionId: currentSession.id, isCurrent: true },
            select: { id: true },
        })
        : null;

    const studentIds = allParents
        .flatMap((parent) => parent.parentStudents.map((row) => row.student.id));

    const studentClassHistories = currentSession && currentTerm && studentIds.length
        ? await prisma.studentClassHistory.findMany({
            where: {
                studentId: { in: studentIds },
                sessionId: currentSession.id,
                termId: currentTerm.id,
            },
            select: { studentId: true, classId: true },
        })
        : [];

    const studentClassMap = new Map(
        studentClassHistories.map((history) => [history.studentId, history.classId])
    );

    const classIds = Array.from(new Set(studentClassHistories.map((history) => history.classId)));

    const feeAssignments = currentSession && currentTerm && classIds.length
        ? await prisma.classFeeAssignment.findMany({
            where: {
                sessionId: currentSession.id,
                termId: currentTerm.id,
                classId: { in: classIds },
            },
            select: { id: true, classId: true, feeStructureId: true },
        })
        : [];

    const assignmentIds = feeAssignments.map((assignment) => assignment.id);
    const feeStructureIds = feeAssignments.map((assignment) => assignment.feeStructureId);

    const feeItems = feeStructureIds.length
        ? await prisma.feeStructureItem.findMany({
            where: { feeStructureId: { in: feeStructureIds } },
            select: { feeStructureId: true, amount: true },
        })
        : [];

    const feeStructureTotalMap = new Map<string, number>();
    feeItems.forEach((item) => {
        feeStructureTotalMap.set(
            item.feeStructureId,
            (feeStructureTotalMap.get(item.feeStructureId) ?? 0) + item.amount
        );
    });

    const assignmentTotalMap = new Map<string, number>();
    feeAssignments.forEach((assignment) => {
        assignmentTotalMap.set(
            assignment.id,
            feeStructureTotalMap.get(assignment.feeStructureId) ?? 0
        );
    });

    const classAssignmentMap = new Map(
        feeAssignments.map((assignment) => [assignment.classId, assignment.id])
    );

    const payments = assignmentIds.length
        ? await prisma.payment.findMany({
            where: {
                assignmentId: { in: assignmentIds },
                status: { in: ["PAID", "PARTIAL"] as PaymentStatus[] },
            },
            select: {
                amount: true,
                studentId: true,
                paymentDate: true,
                status: true,
            },
        })
        : [];

    const studentPaidMap = new Map<string, number>();
    const studentLastPaymentMap = new Map<string, Date>();
    payments.forEach((payment) => {
        studentPaidMap.set(
            payment.studentId,
            (studentPaidMap.get(payment.studentId) ?? 0) + payment.amount
        );
        const existing = studentLastPaymentMap.get(payment.studentId);
        if (!existing || payment.paymentDate > existing) {
            studentLastPaymentMap.set(payment.studentId, payment.paymentDate);
        }
    });

    const parentBalances = new Map<
        string,
        { due: number; paid: number; lastPayment?: Date }
    >();

    allParents.forEach((parent) => {
        let due = 0;
        let paid = 0;
        let lastPayment: Date | undefined;
        const studentIdsForParent = parent.parentStudents.map((row) => row.student.id);
        studentIdsForParent.forEach((studentId) => {
            const classForStudent = studentClassMap.get(studentId);
            if (!classForStudent) return;
            const assignmentId = classAssignmentMap.get(classForStudent);
            if (!assignmentId) return;
            const assignmentTotal = assignmentTotalMap.get(assignmentId) ?? 0;
            due += assignmentTotal;
            paid += studentPaidMap.get(studentId) ?? 0;
            const last = studentLastPaymentMap.get(studentId);
            if (last && (!lastPayment || last > lastPayment)) {
                lastPayment = last;
            }
        });
        parentBalances.set(parent.id, {
            due,
            paid,
            lastPayment,
        });
    });

    const rows: ParentRow[] = allParents
        .filter((parent) => {
            if (!classId || classId === "all") return true;
            if (!studentClassMap.size) return true;
            return parent.parentStudents.some((row) => studentClassMap.get(row.student.id) === classId);
        })
        .map((parent) => {
            const balance = parentBalances.get(parent.id) ?? { due: 0, paid: 0 };
            const outstanding = Math.max(0, balance.due - balance.paid);
            let paymentStatus: ParentRow["status"] = "Paid";
            if (balance.paid > 0 && outstanding > 0) {
                paymentStatus = "Partial";
            } else if (outstanding > 0) {
                paymentStatus = "Owing";
            }

            const students = parent.parentStudents.map((row) => ({
                id: row.student.id,
                name: `${row.student.user.firstName} ${row.student.user.lastName}`,
                image: row.student.user.image ?? undefined,
            }));

            return {
                id: parent.id,
                name: `${parent.user.firstName} ${parent.user.lastName}`,
                email: parent.user.email,
                phone: parent.user.phone,
                image: parent.user.image,
                students,
                status: paymentStatus,
                balance: {
                    amount: formatNaira(outstanding),
                    raw: outstanding,
                    label: outstanding > 0 ? "Overdue" : undefined,
                },
                lastPayment: balance.lastPayment
                    ? balance.lastPayment.toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })
                    : "—",
            };
        })
        .filter((row) => {
            if (!status || status === "all") return true;
            return row.status.toLowerCase() === status.toLowerCase();
        });

    const totalParents = rows.length;
    const parentsOwing = rows.filter((row) => row.status !== "Paid").length;
    const totalOutstanding = rows.reduce((sum, row) => sum + row.balance.raw, 0);
    const totalCollected = payments.reduce((sum, payment) => sum + payment.amount, 0);

    const start = (page - 1) * ITEM_PER_PAGE;
    const pagedRows = rows.slice(start, start + ITEM_PER_PAGE);
    return (
        <div className="flex-1 overflow-y-auto space-y-3">
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Main List Area */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Parents</h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Manage parent records and communications
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Message
                            </button>

                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-indigo-50 flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>

                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                                <Plus className="w-4 h-4" />
                                Add Parent
                            </button>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900 mb-5">
                            Overview
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Total Parents */}
                            <div className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-slate-500">
                                        Total Parents
                                    </p>
                                    <Users className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                </div>

                                <p className="mt-3 text-3xl font-bold text-slate-900">
                                    {totalParents}
                                </p>
                            </div>

                            {/* Parents Owing */}
                            <div className="group cursor-pointer rounded-xl border border-red-200 bg-red-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-red-600">
                                        Parents Owing
                                    </p>
                                    <AlertCircle className="h-4 w-4 text-red-400 group-hover:text-red-600" />
                                </div>

                                <div className="mt-3 flex items-end justify-between">
                                    <p className="text-3xl font-bold text-red-700">
                                        {parentsOwing}
                                    </p>

                                    <span className="rounded-full border border-red-200 bg-white px-2 py-0.5 text-xs font-semibold text-red-600">
                                        {totalParents ? Math.round((parentsOwing / totalParents) * 100) : 0}%
                                    </span>
                                </div>
                            </div>

                            {/* Total Outstanding */}
                            <div className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-slate-500">
                                        Total Outstanding
                                    </p>
                                    <Wallet className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                </div>

                                <p className="mt-3 text-2xl font-bold text-slate-900">
                                    {formatNaira(totalOutstanding)}
                                </p>
                            </div>

                            {/* Collected */}
                            <div className="group cursor-pointer rounded-xl border border-green-200 bg-green-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-green-600">
                                        Collected This Term
                                    </p>
                                    <TrendingUp className="h-4 w-4 text-green-400 group-hover:text-green-600" />
                                </div>

                                <p className="mt-3 text-2xl font-bold text-green-700">
                                    {formatNaira(totalCollected)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <ParentsFilters
                            classes={classes}
                            initialSearch={search}
                            initialClassId={classId}
                            initialStatus={status}
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Parent Name
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Students
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                                            Balance
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                                            Last Payment
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pagedRows.map((parent) => (
                                        <tr key={parent.id} className="hover:bg-slate-50 group cursor-pointer">

                                            {/* Parent Name */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Image
                                                        src={parent.image || "/default-avatar.png"}
                                                        alt={parent.name}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{parent.name}</p>
                                                        <p className="text-xs text-slate-500">{parent.email ?? "-"}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <Phone className="w-3 h-3" />
                                                        {parent.phone ?? "-"}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <Mail className="w-3 h-3" />
                                                        {parent.email ?? "-"}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Students */}
                                            <td className="p-4">
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    {parent.students.slice(0, 4).map((student, index) => (
                                                        <Image
                                                            key={index}
                                                            width={24}
                                                            height={24}
                                                            src={student.image ?? "/default-avatar.png"}
                                                            alt=""
                                                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-500 mt-1 block">
                                                    {parent.students.length
                                                        ? `${parent.students.length} student${parent.students.length > 1 ? "s" : ""}`
                                                        : "No students"}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="p-4">
                                                {parent.status === "Owing" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Owing
                                                    </span>
                                                )}

                                                {parent.status === "Paid" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Paid
                                                    </span>
                                                )}

                                                {parent.status === "Partial" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Partial
                                                    </span>
                                                )}
                                            </td>

                                            {/* Balance */}
                                            <td className="p-4 text-right">
                                                <p className="text-sm font-medium text-slate-900">{parent.balance.amount}</p>
                                                {parent.balance.label && (
                                                    <p className="text-xs text-red-600">{parent.balance.label}</p>
                                                )}
                                            </td>

                                            {/* Last Payment */}
                                            <td className="p-4 text-right">
                                                <p className="text-sm text-slate-600">{parent.lastPayment}</p>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">

                                                    {/* Inline Link Button */}
                                                    <Link
                                                        href={`/admin/parents/${parent.id}`}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                        title="Open parent profile"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </Link>

                                                    {/* Three-dot menu */}
                                                    <button className="text-slate-400 hover:text-indigo-600 p-1">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination page={page} count={totalParents} />
                    </div>
                </div>
            </div>
            {/* Right Summary Panel */}
            <div className="w-full grid gap-4 shrink-0">

                <div className="bg-indigo-900 p-5 rounded-xl shadow-sm text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-indigo-800 rounded-full opacity-50" />
                    <h3 className="font-semibold mb-2 relative z-10">
                        Need to send reminders?
                    </h3>
                    <p className="text-indigo-200 text-sm mb-4 relative z-10">
                        {parentsOwing} parents have outstanding payments due this week.
                    </p>
                    <button className="w-full py-2 bg-white text-indigo-900 text-sm font-medium rounded-md hover:bg-indigo-50 transition-colors relative z-10">
                        Send Bulk Reminder
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Page;





