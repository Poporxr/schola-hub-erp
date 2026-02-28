import Image from "next/image";
import PrintButton from "@/components/PrintButton";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

const formatPosition = (position: number | null) => {
  if (!position) return "-";
  const suffix =
    position % 10 === 1 && position % 100 !== 11
      ? "st"
      : position % 10 === 2 && position % 100 !== 12
        ? "nd"
        : position % 10 === 3 && position % 100 !== 13
          ? "rd"
          : "th";
  return `${position}${suffix}`;
};

const formatGrade = (grade?: string | null) => {
  if (!grade) return "-";
  if (grade === "A_PLUS") return "A+";
  return grade;
};

const deriveGrade = (score: number | null) => {
  if (score === null || Number.isNaN(score)) return "-";
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";
  return "F";
};

const formatDate = (date?: Date | null) => {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const remarkForScore = (score: number) => {
  if (score >= 90) return "Outstanding";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Satisfactory";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
};

export default async function PrintResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ Id?: string; id?: string }>;
  searchParams?: Promise<{ studentId?: string; sessionId?: string; termId?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6 text-sm text-slate-600">Sign in to print results.</div>;
  }

  const routeParams = await params;
  const queryParams = searchParams ? await searchParams : undefined;

  const studentId = routeParams?.Id ?? routeParams?.id ?? queryParams?.studentId;
  const sessionId = queryParams?.sessionId;
  const termId = queryParams?.termId;

  if (!studentId) {
    return <div className="p-6 text-sm text-slate-600">Invalid print request.</div>;
  }

  const classHistory = await prisma.studentClassHistory.findUnique({
    where: sessionId && termId ? { studentId_sessionId_termId: { studentId, sessionId, termId } } : { id: studentId },
    select: {
      id: true,
      sessionId: true,
      termId: true,
      session: { select: { name: true } },
      term: { select: { name: true } },
      class: {
        select: {
          id: true,
          name: true,
          teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
        },
      },
      student: {
        select: {
          id: true,
          admissionNumber: true,
          user: { select: { firstName: true, lastName: true, image: true } },
          parentStudents: { select: { parent: { select: { id: true, userId: true } } } },
        },
      },
    },
  });

  if (!classHistory) {
    return <div className="p-6 text-sm text-slate-600">Result data not found.</div>;
  }

  const isLinked = classHistory.student.parentStudents.some(
    (row) => row.parent.userId === userId || row.parent.id === userId,
  );

  if (!isLinked) {
    return <div className="p-6 text-sm text-slate-600">You do not have access to this result.</div>;
  }

  const [results, classHistories] = await Promise.all([
    prisma.result.findMany({
      where: {
        studentId: classHistory.student.id,
        classHistoryId: classHistory.id,
      },
      orderBy: [{ subject: { name: "asc" } }],
      include: {
        subject: { select: { id: true, name: true } },
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
    }),
    prisma.studentClassHistory.findMany({
      where: {
        classId: classHistory.class.id,
        sessionId: classHistory.sessionId,
        termId: classHistory.termId,
      },
      select: { id: true, studentId: true },
    }),
  ]);

  const classResults = classHistories.length
    ? await prisma.result.findMany({
        where: { classHistoryId: { in: classHistories.map((row) => row.id) } },
        select: { studentId: true, subjectId: true, totalScore: true },
      })
    : [];

  const totalsByStudent = classResults.reduce((map, row) => {
    map.set(row.studentId, (map.get(row.studentId) ?? 0) + row.totalScore);
    return map;
  }, new Map<string, number>());

  const sortedTotals = Array.from(totalsByStudent.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([studentId]) => studentId);

  const classPosition = sortedTotals.length ? sortedTotals.indexOf(classHistory.student.id) + 1 : null;
  const classSize = classHistories.length || null;

  const subjectStats = classResults.reduce((map, row) => {
    const stats = map.get(row.subjectId) ?? { totals: [], byStudent: new Map<string, number>() };
    stats.totals.push(row.totalScore);
    stats.byStudent.set(row.studentId, row.totalScore);
    map.set(row.subjectId, stats);
    return map;
  }, new Map<string, { totals: number[]; byStudent: Map<string, number> }>());

  const totalScore = results.reduce((sum, row) => sum + row.totalScore, 0);
  const subjectCount = results.length;
  const totalObtainable = subjectCount ? subjectCount * 100 : 0;
  const averageScore = subjectCount ? Number((totalScore / subjectCount).toFixed(1)) : null;
  const overallGrade = deriveGrade(averageScore);

  const affectiveScore = results.find((row) => row.affectiveScores.length)?.affectiveScores[0] ?? null;
  const psychomotorScore = results.find((row) => row.psychomotorScores.length)?.psychomotorScores[0] ?? null;
  const teacherRemarkSource = results.find((row) => row.teacherRemark || row.principalRemark);

  const classTeacherName = classHistory.class.teacher
    ? `${classHistory.class.teacher.user.firstName} ${classHistory.class.teacher.user.lastName}`.trim()
    : "Form Teacher";

  const subjectRows = results.map((result, index) => {
    const stats = subjectStats.get(result.subject.id);
    const totals = stats?.totals ?? [];
    const totalSum = totals.reduce((sum, score) => sum + score, 0);
    const avg = totals.length ? Number((totalSum / totals.length).toFixed(1)) : null;
    const ranking = stats
      ? Array.from(stats.byStudent.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([studentId]) => studentId)
      : [];
    const subjectPosition = ranking.length ? ranking.indexOf(classHistory.student.id) + 1 : null;

    return {
      id: result.id,
      sn: index + 1,
      subject: result.subject.name,
      ca1: result.ca1 ?? 0,
      ca2: result.ca2 ?? 0,
      exam: result.exam ?? 0,
      total: result.totalScore,
      grade: formatGrade(result.grade) === "-" ? deriveGrade(result.totalScore) : formatGrade(result.grade),
      remark: remarkForScore(result.totalScore),
      avg,
      pos: subjectPosition,
    };
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white overflow-y-auto">
      <div className="mx-auto max-w-5xl px-2 py-4 print:px-0 print:py-0">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 print:shadow-none print:border-0 print:rounded-none">
          <div className="border-b border-slate-200 px-4 py-4 print:px-0 print:py-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                  <Image
                    src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop"
                    alt="School Logo"
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Excellence International School</h1>
                  <p className="text-xs text-slate-500">Plot 45, Education Avenue, Victoria Island, Lagos State</p>
                  <p className="text-xs text-slate-500">+234 801 234 5678 | info@excellenceschool.edu.ng</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Terminal Report</p>
                  <p className="text-sm font-semibold">{classHistory.term?.name ?? "Term"} | {classHistory.session?.name ?? "Session"}</p>
                </div>
                <div className="h-16 w-16 rounded-2xl overflow-hidden border border-slate-200">
                  <Image
                    src={classHistory.student.user.image ?? "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                    alt="Student"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 print:px-0 print:py-3">
            <div className="grid gap-4 lg:grid-cols">
              <div className="rounded-2xl border border-slate-200 p-3">
                <h2 className="text-sm uppercase tracking-[0.2em] text-slate-400">Student Profile</h2>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="font-semibold">{classHistory.student.user.firstName} {classHistory.student.user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Admission No</p>
                    <p className="font-semibold">{classHistory.student.admissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Class</p>
                    <p className="font-semibold">{classHistory.class.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Class Size</p>
                    <p className="font-semibold">{classSize ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Position</p>
                    <p className="font-semibold text-emerald-600">{formatPosition(classPosition)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Form Teacher</p>
                    <p className="font-semibold">{classTeacherName}</p>
                  </div>
                </div>
              </div>


            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-180 border-collapse text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 print:table-header-group">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">#</th>
                    <th className="px-4 py-3 text-left font-semibold">Subject</th>
                    <th className="px-4 py-3 text-center font-semibold">CA1</th>
                    <th className="px-4 py-3 text-center font-semibold">CA2</th>
                    <th className="px-4 py-3 text-center font-semibold">Exam</th>
                    <th className="px-4 py-3 text-center font-semibold">Total</th>
                    <th className="px-4 py-3 text-center font-semibold">Grade</th>
                    <th className="px-4 py-3 text-center font-semibold">Class Avg</th>
                    <th className="px-4 py-3 text-center font-semibold">Pos</th>
                    <th className="px-4 py-3 text-center font-semibold">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectRows.length ? (
                    subjectRows.map((row) => (
                      <tr key={row.id} className="border-t border-slate-200">
                        <td className="px-4 py-3 text-left">{row.sn}</td>
                        <td className="px-4 py-3 font-medium">{row.subject}</td>
                        <td className="px-4 py-3 text-center">{row.ca1}</td>
                        <td className="px-4 py-3 text-center">{row.ca2}</td>
                        <td className="px-4 py-3 text-center">{row.exam}</td>
                        <td className="px-4 py-3 text-center font-semibold">{row.total}</td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-700">{row.grade}</td>
                        <td className="px-4 py-3 text-center">{row.avg ?? "-"}</td>
                        <td className="px-4 py-3 text-center">{formatPosition(row.pos)}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{row.remark}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-4 text-center text-slate-500">
                        No results available for this record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Affective Domain</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Punctuality", affectiveScore?.punctuality ?? "N/A"],
                    ["Neatness", affectiveScore?.neatness ?? "N/A"],
                    ["Politeness", affectiveScore?.politeness ?? "N/A"],
                    ["Honesty", affectiveScore?.honesty ?? "N/A"],
                    ["Relationship with Others", affectiveScore?.relationshipWithOthers ?? "N/A"],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Psychomotor Domain</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Handwriting", psychomotorScore?.handwriting ?? "N/A"],
                    ["Sports & Games", psychomotorScore?.sportsAndGames ?? "N/A"],
                    ["Drawing & Painting", psychomotorScore?.drawingAndPainting ?? "N/A"],
                    ["Musical Skills", psychomotorScore?.musicalSkills ?? "N/A"],
                    ["Verbal Fluency", psychomotorScore?.verbalFluency ?? "N/A"],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Form Teacher&apos;s Remark</h3>
                <p className="mt-3 text-sm text-slate-600">
                  {teacherRemarkSource?.teacherRemark ?? "No teacher remark provided for this term."}
                </p>
                <div className="mt-4 border-t border-slate-200 pt-4 text-sm">
                  <p className="font-semibold">{classTeacherName}</p>
                  <p className="text-xs text-slate-500">Form Teacher | {classHistory.class.name}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Principal&apos;s Remark</h3>
                <p className="mt-3 text-sm text-slate-600">
                  {teacherRemarkSource?.principalRemark ?? "No principal remark provided for this term."}
                </p>
                <div className="mt-4 border-t border-slate-200 pt-4 text-sm">
                  <p className="font-semibold">Principal</p>
                  <p className="text-xs text-slate-500">Issued on {formatDate(teacherRemarkSource?.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">Grading Key:</span> A+ (90-100) Outstanding | A (80-89) Excellent | B (70-79) Very Good | C (60-69) Good | D (50-59) Satisfactory | E (40-49) Weak Pass | F (0-39) Fail
            </div>
          </div>
        </div>
      </div>
      <PrintButton />
    </div>
  );
}
