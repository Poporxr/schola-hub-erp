import ClassInsights from "@/components/ClassInsights";
import GradeBreakdown from "@/components/GradeBreakdown";
import Pagination from "@/components/Pagination";
import { ResultsClassFilter, ResultsTermFilter } from "@/components/ResultsFilters";
import ResultsSearchInput from "@/components/ResultsSearchInput";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/utils";
import { ArrowUp, BarChart3, CheckCircle2, Download, Printer, Send, Sliders, TrendingUp, Trophy, Upload, Users } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";

type SearchParams = {
    classId?: string | string[];
    termId?: string | string[];
    search?: string | string[];
    page?: string | string[];
};

function scoreToGrade(avg: number) {
    if (avg >= 90) return "A_PLUS";
    if (avg >= 80) return "A";
    if (avg >= 70) return "B";
    if (avg >= 60) return "C";
    if (avg >= 50) return "D";
    if (avg >= 40) return "E";
    return "F";
}

const Page = async ({
    searchParams,
}: {
    searchParams?: SearchParams | Promise<SearchParams>;
}) => {
    const resolvedSearchParams = await searchParams;
    const classIdParam = Array.isArray(resolvedSearchParams?.classId)
        ? resolvedSearchParams?.classId[0]
        : resolvedSearchParams?.classId;
    const termIdParam = Array.isArray(resolvedSearchParams?.termId)
        ? resolvedSearchParams?.termId[0]
        : resolvedSearchParams?.termId;
    const search = Array.isArray(resolvedSearchParams?.search)
        ? resolvedSearchParams?.search[0]
        : resolvedSearchParams?.search;
    const pageParam = Array.isArray(resolvedSearchParams?.page)
        ? resolvedSearchParams?.page[0]
        : resolvedSearchParams?.page;
    const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

    const [classes, currentSession] = await Promise.all([
        prisma.class.findMany({ orderBy: [{ name: "asc" }], select: { id: true, name: true } }),
        prisma.academicSession.findFirst({ where: { isCurrent: true }, select: { id: true, name: true } }),
    ]);

    const currentTerm = currentSession
        ? await prisma.term.findFirst({
              where: { sessionId: currentSession.id, isCurrent: true },
              select: { id: true, name: true },
          })
        : null;

    const classId = classIdParam ?? classes[0]?.id;
    const termId = termIdParam ?? currentTerm?.id;

    const terms = currentSession
        ? await prisma.term.findMany({
              where: { sessionId: currentSession.id },
              orderBy: [{ startDate: "asc" }],
              select: { id: true, name: true },
          })
        : [];

    const histories = classId && termId && currentSession
        ? await prisma.studentClassHistory.findMany({
              where: { classId, termId, sessionId: currentSession.id },
              select: {
                  id: true,
                  student: {
                      select: {
                          id: true,
                          admissionNumber: true,
                          user: { select: { firstName: true, lastName: true } },
                      },
                  },
              },
          })
        : [];

    const historyIds = histories.map((h) => h.id);

    const results = historyIds.length
        ? await prisma.result.findMany({
              where: { classHistoryId: { in: historyIds } },
              select: {
                  studentId: true,
                  ca1: true,
                  ca2: true,
                  project: true,
                  exam: true,
                  totalScore: true,
              },
          })
        : [];

    const byStudent = new Map<
        string,
        { ca1: number; ca2: number; project: number; exam: number; total: number; count: number }
    >();
    for (const r of results) {
        const entry = byStudent.get(r.studentId) ?? { ca1: 0, ca2: 0, project: 0, exam: 0, total: 0, count: 0 };
        entry.ca1 += r.ca1 ?? 0;
        entry.ca2 += r.ca2 ?? 0;
        entry.project += r.project ?? 0;
        entry.exam += r.exam ?? 0;
        entry.total += r.totalScore;
        entry.count += 1;
        byStudent.set(r.studentId, entry);
    }

    const rows = histories
        .map((h) => {
            const stats = byStudent.get(h.student.id);
            if (!stats) return null;
            const avg = stats.count ? stats.total / stats.count : 0;
            return {
                studentId: h.student.id,
                admissionNumber: h.student.admissionNumber,
                name: `${h.student.user.firstName} ${h.student.user.lastName}`,
                ca1: Math.round(stats.ca1),
                ca2: Math.round(stats.ca2),
                project: Math.round(stats.project),
                exam: Math.round(stats.exam),
                total: Math.round(avg),
                grade: scoreToGrade(avg),
            };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

    const searchQuery = search?.trim().toLowerCase();
    const filteredRows = searchQuery
        ? rows.filter((r) => r.name.toLowerCase().includes(searchQuery) || r.admissionNumber.toLowerCase().includes(searchQuery))
        : rows;

    const sorted = [...filteredRows].sort((a, b) => b.total - a.total);
    const ranked = sorted.map((row, idx) => ({ ...row, position: idx + 1 }));

    const totalStudentsEvaluated = ranked.length;
    const classAverage = totalStudentsEvaluated
        ? Math.round(ranked.reduce((sum, r) => sum + r.total, 0) / totalStudentsEvaluated)
        : 0;
    const passCount = ranked.filter((r) => r.total >= 50).length;
    const passRate = totalStudentsEvaluated ? Math.round((passCount / totalStudentsEvaluated) * 100) : 0;
    const topPerformer = ranked[0];

    const gradeCounts = ranked.reduce<Record<string, number>>((acc, r) => {
        acc[r.grade] = (acc[r.grade] ?? 0) + 1;
        return acc;
    }, {});

    const total = ranked.length;
    const start = (page - 1) * ITEM_PER_PAGE;
    const end = start + ITEM_PER_PAGE;
    const pagedRows = ranked.slice(start, end);

    return (
        <>
            <div className="space-y-6 max-w-400 mx-auto w-full">
                <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Results Overview</p>
                        <h1 className="text-2xl font-bold mt-2">Academic Results Management</h1>
                        <p className="text-white/70 max-w-2xl mt-2">
                            {currentTerm?.name ?? "N/A"} — {classes.find((c) => c.id === classId)?.name ?? "Class"}
                        </p>
                    </div>
                    <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="relative z-10 mt-4 md:flex md:items-center grid gap-1.5 md:gap-3">
                        <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Import
                        </button>
                        <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Publish Results
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-slate-500" />
                        Filter Results
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ResultsClassFilter classes={classes} classId={classId} />
                        <ResultsTermFilter terms={terms} termId={termId} />
                        <ResultsSearchInput key={search ?? ""} initialValue={search} />
                    </div>
                </div>

                <KpiGrid>
                    <KpiCard
                        label="Class Average"
                        value={`${classAverage}%`}
                        icon={<TrendingUp className="h-4 w-4 text-slate-400" />}
                        footer={
                            <div className="flex items-center text-xs">
                                <span className="font-semibold flex items-center gap-1 text-emerald-600">
                                    <ArrowUp className="w-3 h-3" /> +2.3%
                                </span>
                                <span className="text-slate-400 ml-2">from last term</span>
                            </div>
                        }
                    />
                    <KpiCard
                        label="Top Performer"
                        value={topPerformer ? `${topPerformer.total}%` : "-"}
                        icon={<Trophy className="h-4 w-4 text-amber-500" />}
                        subtext={topPerformer?.name ?? "-"}
                    />
                    <KpiCard
                        label="Pass Rate"
                        value={`${passRate}%`}
                        icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        subtext={`${passCount} of ${totalStudentsEvaluated} students`}
                    />
                    <KpiCard
                        label="Students Evaluated"
                        value={totalStudentsEvaluated}
                        icon={<Users className="h-4 w-4 text-white/70" />}
                        subtext="Students with results"
                        tone="dark"
                    />
                </KpiGrid>

                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Student Report Cards</h3>
                            <p className="text-xs text-slate-500">{classes.find((c) => c.id === classId)?.name ?? "-"} - {currentTerm?.name ?? "-"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="text-sm text-slate-900 hover:text-indigo-700 font-medium">Sort by Name</button>
                            <button className="text-sm text-slate-900 hover:text-indigo-700 font-medium">Sort by Score</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10">
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-semibold">
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4 text-center">Test</th>
                                    <th className="px-6 py-4 text-center">Exam</th>
                                    <th className="px-6 py-4 text-center">Assignment</th>
                                    <th className="px-6 py-4 text-center">Project</th>
                                    <th className="px-6 py-4 text-center">Total</th>
                                    <th className="px-6 py-4 text-center">Grade</th>
                                    <th className="px-6 py-4 text-center">Rank</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {pagedRows.map((resultItem) => (
                                    <tr className="hover:bg-slate-50 transition-colors" key={resultItem.studentId}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar
                                                    src={undefined}
                                                    alt="Student"
                                                    size={40}
                                                    className="w-10 h-10 border-2 border-border"
                                                />
                                                <span className="font-semibold text-slate-900">{resultItem.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{resultItem.admissionNumber}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.ca1}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.ca2}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.project}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.exam}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-bold text-slate-900">{resultItem.total}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                {resultItem.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                                                {resultItem.position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/results/${resultItem.studentId}`} className="text-slate-900 hover:text-indigo-700 font-medium text-sm">View</Link>
                                                <button className="text-slate-400 hover:text-slate-600">
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination page={page} count={total} />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Score Distribution</h3>
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-slate-500" />
                        </div>
                    </div>
                    <div className="h-64 overflow-hidden">
                        <canvas id="scoreDistributionChart"></canvas>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GradeBreakdown counts={gradeCounts} total={totalStudentsEvaluated} />
                    <ClassInsights />
                </div>

            </div>
        </>
    );
};

export default Page;
