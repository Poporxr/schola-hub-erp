import ClassInsights from "@/components/ClassInsights";
import GradeBreakdown from "@/components/GradeBreakdown";
import Pagination from "@/components/Pagination";
import { ResultsClassFilter, ResultsTermFilter } from "@/components/ResultsFilters";
import ResultsSearchInput from "@/components/ResultsSearchInput";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/utils";
import { ArrowUp, ArrowUpDown, Award, BarChart3, CheckCircle2, Download, Printer, Send, Sliders, TrendingUp, Trophy, Upload, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
                <div className="px-6 py-6 bg-[#7e2cee] rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Academic Results Management</h1>
                                    <p className="text-white/90 text-sm mt-1">
                                        {currentTerm?.name ?? "-"} - {classes.find((c) => c.id === classId)?.name ?? "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="md:flex md:items-center grid gap-1.5 md:gap-3">
                            <button className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Import
                            </button>
                            <button className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button className="px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                Publish Results
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-purple-600" />
                        Filter Results
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ResultsClassFilter classes={classes} classId={classId} />
                        <ResultsTermFilter terms={terms} termId={termId} />
                        <ResultsSearchInput key={search ?? ""} initialValue={search} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white report-card-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white/90">Class Average</span>
                            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold mb-1">{classAverage}%</p>
                        <div className="flex items-center gap-1 text-xs text-white/80">
                            <ArrowUp className="w-3 h-3" />
                            <span>+2.3% from last term</span>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white report-card-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white/90">Top Performer</span>
                            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Trophy className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold mb-1">{topPerformer ? `${topPerformer.total}%` : "-"}</p>
                        <p className="text-xs text-white/80">{topPerformer?.name ?? "-"}</p>
                    </div>

                    <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white report-card-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white/90">Pass Rate</span>
                            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold mb-1">{passRate}%</p>
                        <p className="text-xs text-white/80">{passCount} of {totalStudentsEvaluated} students</p>
                    </div>

                    <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white report-card-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white/90">Students Evaluated</span>
                            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold mb-1">{totalStudentsEvaluated}</p>
                        <p className="text-xs text-white/80">Students with results</p>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-purple-50 to-indigo-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Student Report Cards</h3>
                                <p className="text-sm text-slate-600 mt-1">{classes.find((c) => c.id === classId)?.name ?? "-"} - {currentTerm?.name ?? "-"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 text-xs text-slate-600 hover:bg-white rounded-lg transition-colors border border-slate-200">
                                    <ArrowUpDown className="w-3 h-3 inline mr-1" />
                                    Sort by Name
                                </button>
                                <button className="px-3 py-1.5 text-xs text-slate-600 hover:bg-white rounded-lg transition-colors border border-slate-200">
                                    <BarChart3 className="w-3 h-3 inline mr-1" />
                                    Sort by Score
                                </button>
                            </div>
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
                                    <tr className="hover:bg-purple-50/50 transition-colors" key={resultItem.studentId}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Student" className="w-10 h-10 rounded-full border-2 border-slate-200" width={10} height={10} />
                                                <span className="font-semibold text-slate-900">{resultItem.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{resultItem.admissionNumber}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.ca1}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.ca2}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.project}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.exam}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-bold text-purple-600">{resultItem.total}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="grade-badge inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-md">
                                                {resultItem.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-slate-300 to-slate-400 text-slate-700 font-bold text-sm shadow-md">
                                                {resultItem.position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/results/${resultItem.studentId}`} className="text-purple-600 hover:text-purple-700 font-medium text-sm">View</Link>
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

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">Score Distribution</h3>
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
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
