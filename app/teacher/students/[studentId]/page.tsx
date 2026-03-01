import UserAvatar from "@/components/UserAvatar";
import { notFound } from "next/navigation";
import StudentTabs from "@/components/StudentTab";
import BackButton from "@/components/BackButton";
import { prisma } from "@/lib/prisma";
import { formatDate, yearsSince } from "@/lib/settings";

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
                    email: true,
                    phone: true,
                    status: true,
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
        <div className="">
            <BackButton />

            <div className="">
                {/* Profile Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
                    <div className="flex flex-col justify-center gap-6">
                        <div>
                            <UserAvatar
                                src={student.user.image ?? undefined}
                                alt={name || "Student"}
                                size={100}
                                className="w-29 h-29"
                            />
                        </div>


                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-4 ">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                        {name || "Student"}
                                    </h3>
                                    <p className="text-gray-500 mb-2">
                                        Student ID: {student.admissionNumber}
                                    </p>
                                    <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                        {student.user.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-4 md:grid-cols-4 gap-6 grid-cols-2">
                                <Info label="Class" value={className} />
                                <Info label="Age" value={ageLabel} />
                                <Info label="Gender" value={student.gender} />
                                <Info label="Date of Birth" value={dobLabel} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Tabs */}
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
        </div>
    );
};

export default Page;

const Info = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
);
