import AffectiveDomain from "@/components/AffectiveDomain";
import PsychomoDomain from "@/components/PsychomotorDomain";
import ResultCardSummary from "@/components/ResultSummaryCard";
import SubjectBreakdownTable from "@/components/student/results/SubjectBreakdownTable";
import TeacherResultRemark from "@/components/TeacherResultRemark";
import ParentResultsFilters from "@/components/parent/ParentResultsFilters";
import { getStudentRemark } from "@/lib/get-student-remark";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Calendar, Download, Hash, Printer, School } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import { domainScaleToLabel } from "@/lib/domain-scale";

export const dynamic = "force-dynamic";

const Page = async ({ searchParams }: { searchParams?: { studentId?: string, sessionId?: string, termId?: string } }) => {
    const { userId } = await auth();
    if (!userId) {
        return <div className="p-6 text-sm text-slate-600">Sign in to view ward results.</div>;
    }

    const [parent, sessions, currentTerm] = await Promise.all([
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
                                user: { select: { firstName: true, lastName: true, image: true } },
                            },
                        },
                    },
                },
            },
        }),
        prisma.academicSession.findMany({
            orderBy: [{ startDate: "desc" }],
            select: {
                id: true,
                name: true,
                isCurrent: true,
                terms: {
                    orderBy: [{ startDate: "desc" }],
                    select: { id: true, name: true, type: true, isCurrent: true },
                },
            },
        }),
        prisma.term.findFirst({
            where: { isCurrent: true, session: { isCurrent: true } },
            select: { id: true, sessionId: true },
        }),
    ]);

    if (!parent) {
        return <div className="p-6 text-sm text-slate-600">Parent profile not found.</div>;
    }

    const children = parent.parentStudents.map((row) => row.student);
    if (!children.length) {
        return <div className="p-6 text-sm text-slate-600">No linked students found for this parent.</div>;
    }
    const queryParams = await searchParams
    const fallbackSessionId = currentTerm?.sessionId ?? sessions[0]?.id;
    const selectedSessionId = sessions.some((session) => session.id === queryParams?.sessionId)
        ? queryParams?.sessionId
        : fallbackSessionId;
    const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];
    const availableTerms = selectedSession?.terms ?? [];

    const termFromQuery = availableTerms.find((term) => term.id === queryParams?.termId)?.id;
    const termFromSession = availableTerms.find((term) => term.isCurrent)?.id ?? availableTerms[0]?.id;
    const selectedTermId = termFromQuery ?? termFromSession;
    const selectedTerm = availableTerms.find((term) => term.id === selectedTermId);

    const fallbackStudentId = children[0].id;
    const selectedStudentId = children.some((child) => child.id === queryParams?.studentId)
        ? queryParams?.studentId
        : fallbackStudentId;
    const selectedStudent = children.find((child) => child.id === selectedStudentId) ?? children[0];

    if (!selectedSessionId || !selectedTermId) {
        return <div className="p-6 text-sm text-slate-600">No session or term configured.</div>;
    }

    const classHistory = await prisma.studentClassHistory.findUnique({
        where: {
            studentId_sessionId_termId: {
                studentId: selectedStudent.id,
                sessionId: selectedSessionId,
                termId: selectedTermId,
            },
        },
        select: {
            id: true,
            class: {
                select: {
                    id: true,
                    name: true,
                    teacher: {
                        select: {
                            user: { select: { firstName: true, lastName: true } },
                        },
                    },
                },
            },
        },
    });

    const [results, classHistories] = await Promise.all([
        classHistory
            ? prisma.result.findMany({
                where: {
                    studentId: selectedStudent.id,
                    classHistoryId: classHistory.id,
                },
                orderBy: [{ updatedAt: "desc" }],
                include: {
                    subject: { select: { id: true, name: true } },
                    teachers: { select: { user: { select: { firstName: true, lastName: true } } } },
                },
            })
            : Promise.resolve([]),
        classHistory
            ? prisma.studentClassHistory.findMany({
                where: {
                    classId: classHistory.class.id,
                    sessionId: selectedSessionId,
                    termId: selectedTermId,
                },
                select: { id: true, studentId: true },
            })
            : Promise.resolve([]),
    ]);

    const domainRecord = classHistory
        ? await prisma.studentDomainRecord.findUnique({
            where: {
                studentId_classId_sessionId_termId: {
                    studentId: selectedStudent.id,
                    classId: classHistory.class.id,
                    sessionId: selectedSessionId,
                    termId: selectedTermId,
                },
            },
            select: {
                punctuality: true,
                neatness: true,
                politeness: true,
                honesty: true,
                relationshipWithOthers: true,
                handwriting: true,
                sportsAndGames: true,
                drawingAndPainting: true,
                musicalSkills: true,
                verbalFluency: true,
            },
        })
        : null;

    const totalScore = results.reduce((sum, row) => sum + row.totalScore, 0);
    const subjectCount = results.length;
    const overallAverage = subjectCount ? Number((totalScore / subjectCount).toFixed(1)) : null;
    const maxScore = subjectCount ? subjectCount * 100 : null;
    const passedSubjects = results.filter((row) => (row.totalScore ?? 0) >= 50).length;

    const totalsByStudent = classHistories.length
        ? await prisma.result.findMany({
            where: { classHistoryId: { in: classHistories.map((row) => row.id) } },
            select: { studentId: true, totalScore: true },
        })
        : [];

    const totalsMap = totalsByStudent.reduce((map, row) => {
        const entry = map.get(row.studentId) ?? { sum: 0, count: 0 };
        entry.sum += row.totalScore;
        entry.count += 1;
        map.set(row.studentId, entry);
        return map;
    }, new Map<string, { sum: number; count: number }>());

    const sortedTotals = Array.from(totalsMap.entries())
        .map(([studentId, entry]) => ({
            studentId,
            average: entry.count ? entry.sum / entry.count : 0,
        }))
        .sort((a, b) => b.average - a.average)
        .map((row) => row.studentId);
    const classPosition = sortedTotals.length ? sortedTotals.indexOf(selectedStudent.id) + 1 : null;

    const affectiveScore = domainRecord
        ? {
            punctuality: domainScaleToLabel(domainRecord.punctuality),
            neatness: domainScaleToLabel(domainRecord.neatness),
            politeness: domainScaleToLabel(domainRecord.politeness),
            honesty: domainScaleToLabel(domainRecord.honesty),
            relationshipWithOthers: domainScaleToLabel(domainRecord.relationshipWithOthers),
        }
        : null;
    const psychomotorScore = domainRecord
        ? {
            handwriting: domainScaleToLabel(domainRecord.handwriting),
            sportsAndGames: domainScaleToLabel(domainRecord.sportsAndGames),
            drawingAndPainting: domainScaleToLabel(domainRecord.drawingAndPainting),
            musicalSkills: domainScaleToLabel(domainRecord.musicalSkills),
            verbalFluency: domainScaleToLabel(domainRecord.verbalFluency),
        }
        : null;

    const summary = {
        overallAverage,
        totalScore: subjectCount ? Number(totalScore.toFixed(1)) : null,
        maxScore,
        classPosition,
        classSize: classHistories.length || null,
        subjectCount,
        passedSubjects,
        statusLabel: overallAverage === null ? "N/A" : overallAverage >= 50 ? "PASSED" : "FAILED",
        statusDetail:
            overallAverage === null
                ? "No result data available"
                : overallAverage >= 75
                    ? "Excellent performance"
                    : overallAverage >= 60
                        ? "Very good performance"
                        : overallAverage >= 50
                            ? "Satisfactory performance"
                            : "Needs improvement",
    };

    const autoRemark = overallAverage !== null ? getStudentRemark(overallAverage) : null;
    const teacherRemarkSource = results.find((row) => row.teacherRemark || row.principalRemark);
    const teacherRemark = teacherRemarkSource?.teacherRemark ?? autoRemark?.teacherRemark ?? null;
    const principalRemark = teacherRemarkSource?.principalRemark ?? autoRemark?.principalRemark ?? null;
    const teacherRemarkDate = new Date();
    const classTeacherName = classHistory?.class.teacher
        ? `${classHistory.class.teacher.user.firstName} ${classHistory.class.teacher.user.lastName}`.trim()
        : "Form Teacher";

    const subjectRows = results.map((result) => {
        const total = result.totalScore ?? 0;
        return {
            id: result.id,
            subjectName: result.subject.name,
            tests: (result.ca1 ?? 0) + (result.ca2 ?? 0),
            exam: result.exam ?? 0,
            totalScore: total,
        };
    });

    return (
        <div>
            <ParentResultsFilters
                sessions={sessions.map((session) => ({
                    id: session.id,
                    name: session.name,
                    terms: session.terms.map((term) => ({ id: term.id, name: term.name })),
                }))}
                students={children.map((child) => ({
                    id: child.id,
                    name: `${child.user.firstName} ${child.user.lastName}`.trim(),
                }))}
                initialSessionId={selectedSession?.id}
                initialTermId={selectedTerm?.id}
                initialStudentId={selectedStudent?.id}
            />
            <div className="space-y-6 max-w-400 mx-auto w-full">
                <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 mb-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Ward Results</p>
                        <h1 className="text-2xl font-bold mt-2 text-white/80">
                            {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                        </h1>
                    </div>
                    <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-8">
                            {/* Student Passport Photo */}
                            <UserAvatar
                                src={selectedStudent.user.image ?? undefined}
                                alt="Student"
                                size={80}
                                className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-sm"
                            />
                            <div className="text-white/80 text-sm">
                                <div className="grid grid-cols-1 gap-3">
                                    <span className="flex items-center gap-1">
                                        <Hash className="w-4 h-4" />
                                        {selectedStudent.admissionNumber}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <School className="w-4 h-4" />
                                        {classHistory?.class.name ?? "Class not assigned"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {selectedTerm?.name ?? "Term"} {selectedSession?.name ?? ""}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            {classHistory?.id ? (
                                <Link
                                    href={`/print/${selectedStudent.id}?studentId=${selectedStudent.id}&sessionId=${selectedSessionId}&termId=${selectedTermId}`}
                                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2 justify-center"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print Result
                                </Link>
                            ) : (
                                <span className="px-4 py-2 bg-white/10 border border-white/20 text-white/70 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed justify-center">
                                    <Printer className="w-4 h-4" />
                                    Print Result
                                </span>
                            )}
                            <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2 justify-center">
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
                <ResultCardSummary summary={summary} />
                <SubjectBreakdownTable rows={subjectRows} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AffectiveDomain scores={affectiveScore ?? null} />
                    <PsychomoDomain scores={psychomotorScore ?? null} />
                </div>
                <TeacherResultRemark
                    remark={teacherRemark ?? "No teacher remark available for this result."}
                    principalRemark={principalRemark ?? "No principal remark available for this result."}
                    teacherName={classTeacherName}
                    className={classHistory?.class.name ?? "Class"}
                    date={teacherRemarkDate ?? undefined}
                />
            </div>

        </div>
    )
}

export default Page;
