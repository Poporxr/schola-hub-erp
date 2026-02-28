import AffectiveDomain from "@/components/AffectiveDomain";
import PsychomoDomain from "@/components/PsychomotorDomain";
import ResultCardSummary from "@/components/ResultSummaryCard";
import TeacherResultRemark from "@/components/TeacherResultRemark";
import ParentResultsFilters from "@/components/parent/ParentResultsFilters";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Calendar, Download, Hash, Printer, School, Subscript } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const formatGrade = (grade?: string | null) => {
    if (!grade) return "-";
    switch (grade) {
        case "A_PLUS":
            return "A+";
        case "A":
        case "B":
        case "C":
        case "D":
        case "E":
        case "F":
            return grade;
        default:
            return grade;
    }
};

const performanceForScore = (score?: number | null) => {
    if (score === null || score === undefined) {
        return { label: "N/A", status: "perf-unknown" };
    }
    if (score >= 70) return { label: "Excellent", status: "perf-excellent" };
    if (score >= 60) return { label: "Very Good", status: "perf-good" };
    if (score >= 50) return { label: "Good", status: "perf-average" };
    if (score >= 45) return { label: "Fair", status: "perf-average" };
    return { label: "Poor", status: "perf-poor" };
};

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
                    affectiveScores: {
                        select: {
                            punctuality: true,
                            neatness: true,
                            politeness: true,
                            honesty: true,
                            relationshipWithOthers: true,
                        },
                    },
                    psychomotorScores: {
                        select: {
                            handwriting: true,
                            sportsAndGames: true,
                            drawingAndPainting: true,
                            musicalSkills: true,
                            verbalFluency: true,
                        },
                    },
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

    const totalScore = results.reduce((sum, row) => sum + row.totalScore, 0);
    const subjectCount = results.length;
    const overallAverage = subjectCount ? Number((totalScore / subjectCount).toFixed(1)) : null;
    const maxScore = subjectCount ? subjectCount * 100 : null;
    const passedSubjects = results.filter((row) => (row.totalScore ?? 0) >= 50).length;

    const totalsByStudent = results.length && classHistories.length
        ? await prisma.result.findMany({
            where: { classHistoryId: { in: classHistories.map((row) => row.id) } },
            select: { studentId: true, totalScore: true },
        })
        : [];

    const totalsMap = totalsByStudent.reduce((map, row) => {
        map.set(row.studentId, (map.get(row.studentId) ?? 0) + row.totalScore);
        return map;
    }, new Map<string, number>());

    const sortedTotals = Array.from(totalsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([studentId]) => studentId);
    const classPosition = sortedTotals.length ? sortedTotals.indexOf(selectedStudent.id) + 1 : null;

    const affectiveScore = results.find((row) => row.affectiveScores.length)?.affectiveScores[0];
    const psychomotorScore = results.find((row) => row.psychomotorScores.length)?.psychomotorScores[0];

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

    const teacherRemarkSource = results.find((row) => row.teacherRemark || row.principalRemark);
    const teacherRemark = teacherRemarkSource?.teacherRemark ?? null;
    const teacherRemarkDate = teacherRemarkSource?.updatedAt ?? null;
    const classTeacherName = classHistory?.class.teacher
        ? `${classHistory.class.teacher.user.firstName} ${classHistory.class.teacher.user.lastName}`.trim()
        : "Form Teacher";

    const subjectRows = results.map((result) => {
        return {
            id: result.id,
            subject: result.subject.name,
            tests: result.ca1 ?? 0,
            assignments: result.ca2 ?? 0,
            exam: result.exam ?? 0,
            total: result.totalScore,
            grade: formatGrade(result.grade),
            performance: performanceForScore(result.totalScore),
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
                <div className="px-6 bg-[#7E2CEE] py-6 rounded-xl">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Student Passport Photo */}
                            <Image
                                src={selectedStudent.user.image ?? "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                                alt="Student"
                                className="w-20 h-20 rounded-xl border-4 border-white/30 shadow-lg object-cover"
                                width={80}
                                height={80}
                            />
                            <div>
                                <h1 className="text-3xl text-white/90 font-bold mb-1">
                                    {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                                </h1>
                                <div className="lg:flex items-center gap-4 text-white/90 text-sm">
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
                        <div className="flex items-center gap-3">
                            {classHistory?.id ? (
                                <Link
                                    href={`/print/${selectedStudent.id}?studentId=${selectedStudent.id}&sessionId=${selectedSessionId}&termId=${selectedTermId}`}
                                    className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print Result
                                </Link>
                            ) : (
                                <span className="px-4 py-2 bg-white/10 border border-white/20 text-white/70 rounded-lg text-sm font-medium flex items-center gap-2 cursor-not-allowed">
                                    <Printer className="w-4 h-4" />
                                    Print Result
                                </span>
                            )}
                            <button className="px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
                <ResultCardSummary summary={summary} />
                <div className="grid grid-cols-1 gap-6">
                    {/* Subject Breakdown Table (2 columns) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-purple-50 to-indigo-50">
                            <h3 className="font-bold text-slate-900 text-lg">Subject Performance Breakdown</h3>
                            <p className="text-sm text-slate-600 mt-1">Detailed scores across all subjects</p>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10">
                                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-semibold">
                                        <th className="px-6 py-4">Subject</th>
                                        <th className="px-6 py-4 text-center">Tests</th>
                                        <th className="px-6 py-4 text-center">Assignments</th>
                                        <th className="px-6 py-4 text-center">Exam</th>
                                        <th className="px-6 py-4 text-center">Total</th>
                                        <th className="px-6 py-4 text-center">Grade</th>
                                        <th className="px-6 py-4 text-center">Performance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {subjectRows.length ? (
                                        subjectRows.map((subject) => (
                                            <tr className="hover:bg-purple-50/50 transition-colors" key={subject.id}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                                            <Subscript className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-semibold text-slate-900">{subject.subject} </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-semibold text-slate-900">{subject.tests}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-slate-900">{subject.assignments}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-slate-900">{subject.exam}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-lg font-bold text-purple-600">{subject.total}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="grade-badge inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-md">{subject.grade}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <i data-lucide="trending-up" className={`w-4 h-4 ${subject.performance.status}`}></i>
                                                        <span className={`text-xs font-medium ${subject.performance.status}`}>{subject.performance.label}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="px-6 py-6 text-center text-sm text-slate-500" colSpan={7}>
                                                No results available for the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AffectiveDomain scores={affectiveScore ?? null} />
                    <PsychomoDomain scores={psychomotorScore ?? null} />
                </div>
                <TeacherResultRemark
                    remark={teacherRemark ?? "No teacher remark available for this result."}
                    teacherName={classTeacherName}
                    className={classHistory?.class.name ?? "Class"}
                    date={teacherRemarkDate ?? undefined}
                />
            </div>

        </div>
    )
}

export default Page;
