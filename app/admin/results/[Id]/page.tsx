import AffectiveDomain from "@/components/AffectiveDomain";
import BackButton from "@/components/BackButton";
import PsychomoDomain from "@/components/PsychomotorDomain";
import ResultCardSummary from "@/components/ResultSummaryCard";
import SubjectBreakdownTable from "@/components/student/results/SubjectBreakdownTable";
import TeacherResultRemark from "@/components/TeacherResultRemark";
import { Calendar, Download, Hash, Printer, School } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import { getStudentRemark } from "@/lib/get-student-remark";
import { prisma } from "@/lib/prisma";
import { domainScaleToLabel } from "@/lib/domain-scale";

const Page = async ({ params }: { params: { Id: string } | Promise<{ Id: string }> }) => {
    const resolvedParams = await params;
    const studentId = resolvedParams.Id;

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            id: true,
            admissionNumber: true,
            user: { select: { firstName: true, lastName: true, image: true } },
        },
    });

    if (!student) {
        return <div className="p-6 text-sm text-slate-600">Student not found.</div>;
    }

    const currentTerm = await prisma.term.findFirst({
        where: { isCurrent: true, session: { isCurrent: true } },
        select: { id: true, name: true, sessionId: true, session: { select: { id: true, name: true } } },
    });

    const classHistory =
        currentTerm
            ? await prisma.studentClassHistory.findUnique({
                where: {
                    studentId_sessionId_termId: {
                        studentId,
                        sessionId: currentTerm.sessionId,
                        termId: currentTerm.id,
                    },
                },
                select: {
                    id: true,
                    sessionId: true,
                    termId: true,
                    session: { select: { id: true, name: true } },
                    term: { select: { id: true, name: true } },
                    class: {
                        select: {
                            id: true,
                            name: true,
                            teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
                        },
                    },
                },
            })
            : null;

    const fallbackHistory =
        classHistory ??
        (await prisma.studentClassHistory.findFirst({
            where: { studentId },
            orderBy: [{ session: { startDate: "desc" } }, { term: { startDate: "desc" } }],
            select: {
                id: true,
                sessionId: true,
                termId: true,
                session: { select: { id: true, name: true } },
                term: { select: { id: true, name: true } },
                class: {
                    select: {
                        id: true,
                        name: true,
                        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
                    },
                },
            },
        }));

    const activeHistory = fallbackHistory;

    const [results, classHistories] = await Promise.all([
        activeHistory
            ? prisma.result.findMany({
                where: { studentId, classHistoryId: activeHistory.id },
                orderBy: [{ updatedAt: "desc" }],
                include: {
                    subject: { select: { id: true, name: true } },
                    teachers: { select: { user: { select: { firstName: true, lastName: true } } } },
                },
            })
            : Promise.resolve([]),
        activeHistory
            ? prisma.studentClassHistory.findMany({
                where: {
                    classId: activeHistory.class.id,
                    sessionId: activeHistory.sessionId,
                    termId: activeHistory.termId,
                },
                select: { id: true, studentId: true },
            })
            : Promise.resolve([]),
    ]);

    const domainRecord = activeHistory
        ? await prisma.studentDomainRecord.findUnique({
            where: {
                studentId_classId_sessionId_termId: {
                    studentId,
                    classId: activeHistory.class.id,
                    sessionId: activeHistory.sessionId,
                    termId: activeHistory.termId,
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
    const classPosition = sortedTotals.length ? sortedTotals.indexOf(student.id) + 1 : null;

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
    const remarkSource = results.find((row) => row.teacherRemark || row.principalRemark);
    const teacherRemark =
        remarkSource?.teacherRemark ??
        autoRemark?.teacherRemark ??
        "No teacher remark available for this result.";
    const principalRemark =
        remarkSource?.principalRemark ??
        autoRemark?.principalRemark ??
        "No principal remark available for this result.";
    const teacherRemarkDate = new Date();
    const classTeacherName = activeHistory?.class.teacher
        ? `${activeHistory.class.teacher.user.firstName} ${activeHistory.class.teacher.user.lastName}`.trim()
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
        <div className="space-y-6 max-w-400 mx-auto w-full">
            <BackButton />
            <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <UserAvatar
                            src={student.user.image ?? undefined}
                            alt="Student"
                            size={80}
                            className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-sm"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-white/90">{student.user.firstName} {student.user.lastName}</h1>
                            <div className="lg:flex items-center gap-4 text-white/80 text-sm mt-2">
                                <span className="flex items-center gap-1">
                                    <Hash className="w-4 h-4" />
                                    {student.admissionNumber}
                                </span>
                                <span className="flex items-center gap-1">
                                    <School className="w-4 h-4" />
                                    {activeHistory?.class.name ?? "Class not assigned"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {activeHistory?.term.name ?? "Term"} {activeHistory?.session.name ?? ""}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {activeHistory ? (
                            <Link
                                href={`/print/${student.id}?studentId=${student.id}&sessionId=${activeHistory.sessionId}&termId=${activeHistory.termId}`}
                                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
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
                        <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                    </div>
                </div>
                <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            <ResultCardSummary summary={summary} />

            <SubjectBreakdownTable rows={subjectRows} emptyMessage="No results available for this student." />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AffectiveDomain scores={affectiveScore ?? null} />
                <PsychomoDomain scores={psychomotorScore ?? null} />
            </div>
            <TeacherResultRemark
                remark={teacherRemark}
                principalRemark={principalRemark}
                teacherName={classTeacherName}
                className={activeHistory?.class.name ?? "Class"}
                date={teacherRemarkDate ?? undefined}
            />
        </div>
    );
}
export default Page;
