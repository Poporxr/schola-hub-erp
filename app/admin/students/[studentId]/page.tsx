import UserAvatar from "@/components/UserAvatar";
import { notFound } from "next/navigation";
import StudentTabs from "@/components/StudentTab";
import BackButton from "@/components/BackButton";
import { prisma } from "@/lib/prisma";
import { formatDate, yearsSince } from "@/lib/settings";
import Link from "next/link";
import { ChevronRight, Link2, UserRoundCheck } from "lucide-react";

const Page = async ({ params }: { params: { studentId?: string } | Promise<{ studentId?: string }> }) => {
    const { studentId } = await params;
    if (!studentId) notFound();

    const currentSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
        select: { id: true, name: true },
    });

    const currentTerm = currentSession
        ? await prisma.term.findFirst({
            where: { sessionId: currentSession.id, isCurrent: true },
            select: { id: true, name: true },
        })
        : null;

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            id: true,
            admissionNumber: true,
            gender: true,
            dateOfBirth: true,
            address: true,
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    status: true,
                    email: true,
                    phone: true,
                    image: true,
                },
            },
            classHistories: currentSession && currentTerm
                ? {
                    where: { sessionId: currentSession.id, termId: currentTerm.id },
                    take: 1,
                    select: { id: true, class: { select: { id: true, name: true } } },
                }
                : {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    select: { id: true, class: { select: { id: true, name: true } } },
                },
            parentStudents: {
                select: {
                    relation: true,
                    isPrimary: true,
                    parent: {
                        select: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!student) notFound();

    const name = `${student.user.firstName} ${student.user.lastName}`.trim();
    const classHistory = student.classHistories[0];
    const classId = classHistory?.class?.id;
    const className = classHistory?.class?.name ?? "—";
    const ageLabel = student.dateOfBirth ? yearsSince(student.dateOfBirth) : "—";
    const dobLabel = student.dateOfBirth ? formatDate(student.dateOfBirth) : "—";

    const parents = student.parentStudents.map((p) => ({
        name: `${p.parent.user.firstName} ${p.parent.user.lastName}`.trim(),
        phone: p.parent.user.phone,
        email: p.parent.user.email,
        relation: p.relation,
        isPrimary: p.isPrimary,
    }));
    const linkedParentCount = parents.length;

    const subjects = classId
        ? await prisma.classSubject.findMany({
            where: { classId },
            select: { subject: { select: { id: true, name: true } } },
        })
        : [];

    const subjectTeachers = classId && currentSession && currentTerm
        ? await prisma.subjectTeacher.findMany({
            where: { classId, sessionId: currentSession.id, termId: currentTerm.id },
            select: {
                subjectId: true,
                teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
            },
        })
        : [];

    const teacherBySubjectId = new Map(
        subjectTeachers.map((st) => [
            st.subjectId,
            `${st.teacher.user.firstName} ${st.teacher.user.lastName}`.trim(),
        ])
    );

    const subjectRows = subjects.map((s) => ({
        id: s.subject.id,
        name: s.subject.name,
        teacher: teacherBySubjectId.get(s.subject.id) ?? null,
    }));

    const resultsRaw = classHistory
        ? await prisma.result.findMany({
            where: { classHistoryId: classHistory.id },
            select: { totalScore: true, grade: true, subject: { select: { name: true } } },
        })
        : [];

    const termLabel = currentTerm && currentSession
        ? `${currentTerm.name}, ${currentSession.name}`
        : "Current Term";

    const resultRows = resultsRaw.map((r) => ({
        subject: r.subject.name,
        score: Math.round(r.totalScore),
        grade: r.grade ?? null,
        termLabel,
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
               <BackButton />
               <Link
                    href={`/admin/students/${studentId}/parents`}
                    className="group inline-flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-linear-to-r from-white to-slate-50 px-3 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:w-auto sm:px-3.5"
                >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                        <Link2 size={15} />
                    </span>
                    <span className="mr-auto leading-tight">
                        <span className="block text-sm font-semibold text-slate-900 sm:hidden">Parent Links</span>
                        <span className="hidden text-sm font-semibold text-slate-900 sm:block">Manage Parent Links</span>
                        <span className="hidden text-xs text-slate-500 md:block">Link or unlink guardians</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                        <UserRoundCheck size={12} />
                        {linkedParentCount}
                    </span>
                    <ChevronRight
                        size={16}
                        className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600"
                    />
                </Link>
            </div>
            

            <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <UserAvatar
                            src={student.user.image}
                            alt={name || "Student"}
                            size={80}
                            className="w-20 h-20 rounded-2xl border border-white/20"
                        />
                        <div>
                            <h1 className="text-2xl font-bold  text-white/80">{name || "Student"}</h1>
                            <p className="text-white/70 text-sm">Admission No: {student.admissionNumber}</p>
                            <span className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                student.user.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-100" : "bg-white/10 text-white/70"
                            }`}>
                                {student.user.status}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <Info label="Class" value={className} tone="light" />
                        <Info label="Age" value={ageLabel} tone="light" />
                        <Info label="Gender" value={student.gender} tone="light" />
                        <Info label="DOB" value={dobLabel} tone="light" />
                    </div>
                </div>
                <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Contact Email</p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{student.user.email ?? "—"}</p>
                    <p className="mt-2 text-xs text-slate-500">Primary communication</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{student.user.phone ?? "—"}</p>
                    <p className="mt-2 text-xs text-slate-500">Student contact</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-white/70">Current Term</p>
                    <p className="mt-3 text-sm font-semibold">{termLabel}</p>
                    <p className="mt-2 text-xs text-white/70">Active session overview</p>
                </div>
            </div>

            <StudentTabs
                contact={{
                    email: student.user.email,
                    phone: student.user.phone,
                    address: student.address,
                }}
                parents={parents}
                subjects={subjectRows}
                results={resultRows}
            />
        </div>
    );
};

export default Page;

const Info = ({ label, value, tone = "dark" }: { label: string; value: string; tone?: "dark" | "light" }) => (
    <div>
        <p className={`text-xs ${tone === "light" ? "text-white/60" : "text-slate-500"}`}>{label}</p>
        <p className={`text-sm font-semibold ${tone === "light" ? "text-white" : "text-slate-900"}`}>{value}</p>
    </div>
);
