import BackButton from "@/components/BackButton";
import { prisma } from "@/lib/prisma";
import { ChevronRight, Mail, MapPin, Phone, PlusCircle } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import { notFound } from "next/navigation";

const Page = async ({ params }: { params: { Id: string } }) => {
    const { Id } = await params;
        if (!Id) notFound();
    const parent = await prisma.parent.findUnique({
        where: { id: Id },
        select: {
            id: true,
            createdAt: true,
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    image: true,
                    status: true,
                },
            },
            parentStudents: {
                select: {
                    relation: true,
                    isPrimary: true,
                    student: {
                        select: {
                            id: true,
                            admissionNumber: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!parent) {
        notFound();
    }

    const currentSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
        select: { id: true },
    });

    const currentTerm = currentSession
        ? await prisma.term.findFirst({
              where: { sessionId: currentSession.id, isCurrent: true },
              select: { id: true },
          })
        : null;

    const studentIds = parent.parentStudents.map((row) => row.student.id);

    const classHistories = currentSession && currentTerm && studentIds.length
        ? await prisma.studentClassHistory.findMany({
              where: {
                  studentId: { in: studentIds },
                  sessionId: currentSession.id,
                  termId: currentTerm.id,
              },
              select: {
                  studentId: true,
                  class: { select: { id: true, name: true } },
              },
          })
        : [];

    const classByStudent = new Map(
        classHistories.map((history) => [history.studentId, history.class])
    );

    const students = parent.parentStudents.map((row) => {
        const classInfo = classByStudent.get(row.student.id);
        return {
            id: row.student.id,
            name: `${row.student.user.firstName} ${row.student.user.lastName}`,
            image: row.student.user.image ?? undefined,
            admissionNumber: row.student.admissionNumber,
            relation: row.relation ?? "Guardian",
            isPrimary: row.isPrimary,
            className: classInfo?.name ?? "Unassigned",
        };
    });

    const primaryRelation = parent.parentStudents.find((row) => row.isPrimary)?.relation ?? "Guardian";
    const parentName = `${parent.user.firstName} ${parent.user.lastName}`;
    const parentStatus = parent.user.status ?? "ACTIVE";
    const shortId = parent.id.slice(0, 8).toUpperCase();

    return (
        <div className="space-y-6">
            <BackButton />

            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <UserAvatar
                        src={parent.user.image}
                        alt={parentName}
                        size={64}
                        className="h-16 w-16 border-2 border-surface shadow-sm"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {parentName}
                        </h1>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                parentStatus === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-slate-100 text-slate-700"
                            }`}>
                                {parentStatus}
                            </span>
                            <span className="text-sm text-slate-400">-</span>
                            <span className="text-sm text-slate-500">ID: PR-{shortId}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Mail className="h-4 w-4" /> Message
                    </button>
                </div>
            </div>

            {/* Contact + Linked Students */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">Contact Info</h3>
                        <button className="text-xs font-medium text-slate-900 hover:underline">
                            Edit
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Phone Number</p>
                                <p className="text-sm font-medium text-slate-900">
                                    {parent.user.phone ?? "-"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Email Address</p>
                                <p className="text-sm font-medium text-slate-900">
                                    {parent.user.email ?? "-"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Primary Relation</p>
                                <p className="text-sm font-medium text-slate-900">
                                    {primaryRelation}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-semibold text-slate-900">
                        Linked Students ({students.length})
                    </h3>

                    <div className="space-y-4">
                        {students.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                                No students linked yet.
                            </div>
                        ) : (
                            students.map((student) => (
                                <div key={student.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                                    <UserAvatar
                                        src={student.image}
                                        alt={student.name}
                                        size={40}
                                        className="h-10 w-10"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-900">
                                            {student.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Class: {student.className} - Adm: {student.admissionNumber}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Relation: {student.relation}{student.isPrimary ? " (Primary)" : ""}
                                        </p>
                                    </div>
                                    <Link href={`/admin/students/${student.id}`} className="text-slate-400 hover:text-slate-900">
                                        <ChevronRight className="h-5 w-5" />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Message + Admin Notes */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                <form className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                    <h3 className="mb-4 font-semibold text-slate-900">Quick Message</h3>

                    <div className="flex flex-1 flex-col space-y-3">
                        <input
                            type="text"
                            placeholder="Subject"
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />

                        <textarea
                            rows={6}
                            placeholder="Type your message..."
                            className="flex-1 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />

                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <button className="whitespace-nowrap rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200">
                                PTA Meeting
                            </button>
                        </div>

                        <button type="submit" className="mt-auto w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                            Send Message
                        </button>
                    </div>
                </form>

                <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                    <h3 className="mb-3 font-semibold text-slate-900">Admin Notes</h3>

                    <div className="mb-3 rounded-lg border border-yellow-100 bg-yellow-50 p-3">
                        <p className="text-sm text-yellow-800">
                            Parent prefers communications via email and responds within 24 hours.
                        </p>
                        <p className="mt-1 text-xs text-yellow-600">Added by Admin - Oct 20, 2023</p>
                    </div>

                    <button className="mt-auto flex items-center gap-1 text-sm font-medium text-slate-900 hover:underline">
                        <PlusCircle className="h-4 w-4" /> Add Note
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Page;
