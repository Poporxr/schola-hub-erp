import ResultsEntryClient, {
  type ResultStudent,
  type ResultContext,
} from "@/components/teacher/ResultEntryClient";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Sliders } from "lucide-react";

type SearchParams = {
  sessionId?: string | string[];
  termId?: string | string[];
  classId?: string | string[];
  subjectId?: string | string[];
};

const firstParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

async function getResultsEntryData({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}): Promise<{
  ctx: ResultContext;
  students: ResultStudent[];
  filters: {
    sessions: { id: string; name: string }[];
    terms: { id: string; name: string }[];
    classes: { id: string; name: string }[];
    subjects: { id: string; name: string }[];
    selectedSessionId?: string;
    selectedTermId?: string;
    selectedClassId?: string;
    selectedSubjectId?: string;
  };
}> {
  const resolvedSearchParams = await searchParams;
  const sessionIdParam = firstParam(resolvedSearchParams?.sessionId);
  const termIdParam = firstParam(resolvedSearchParams?.termId);
  const classIdParam = firstParam(resolvedSearchParams?.classId);
  const subjectIdParam = firstParam(resolvedSearchParams?.subjectId);

  const { userId } = await auth();
  if (!userId) {
    return {
      ctx: {
        classId: "",
        subjectId: "",
        sessionId: "",
        termId: "",
        className: "-",
        subjectName: "-",
        termLabel: "-",
        totalStudentsLabel: "0 students",
        maxTest: 20,
        maxExam: 80,
      },
      students: [],
      filters: {
        sessions: [],
        terms: [],
        classes: [],
        subjects: [],
      },
    };
  }

  const [teacher, currentTerm] = await Promise.all([
    prisma.teacher.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      select: { id: true },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, sessionId: true, name: true },
    }),
  ]);

  if (!teacher || !currentTerm) {
    return {
      ctx: {
        classId: "",
        subjectId: "",
        sessionId: "",
        termId: "",
        className: "-",
        subjectName: "-",
        termLabel: currentTerm?.name ?? "-",
        totalStudentsLabel: "0 students",
        maxTest: 20,
        maxExam: 80,
      },
      students: [],
      filters: {
        sessions: [],
        terms: [],
        classes: [],
        subjects: [],
      },
    };
  }

  const assignments = await prisma.subjectTeacher.findMany({
    where: {
      teacherId: teacher.id,
    },
    select: {
      classId: true,
      subjectId: true,
      sessionId: true,
      termId: true,
      session: { select: { id: true, name: true, startDate: true } },
      term: { select: { id: true, name: true, startDate: true } },
      class: { select: { name: true } },
      subject: { select: { name: true } },
    },
    orderBy: [{ session: { startDate: "desc" } }, { term: { startDate: "asc" } }, { class: { name: "asc" } }, { subject: { name: "asc" } }],
  });

  if (!assignments.length) {
    return {
      ctx: {
        classId: "",
        subjectId: "",
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
        className: "-",
        subjectName: "-",
        termLabel: currentTerm.name,
        totalStudentsLabel: "0 students",
        maxTest: 20,
        maxExam: 80,
      },
      students: [],
      filters: {
        sessions: [],
        terms: [],
        classes: [],
        subjects: [],
      },
    };
  }

  const sessions = Array.from(
    new Map(
      assignments.map((a) => [a.sessionId, { id: a.session.id, name: a.session.name, startDate: a.session.startDate }])
    ).values()
  ).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  const selectedSessionId =
    (sessionIdParam && sessions.some((s) => s.id === sessionIdParam) ? sessionIdParam : undefined) ??
    (sessions.some((s) => s.id === currentTerm.sessionId) ? currentTerm.sessionId : undefined) ??
    sessions[0]?.id;

  const terms = Array.from(
    new Map(
      assignments
        .filter((a) => a.sessionId === selectedSessionId)
        .map((a) => [a.termId, { id: a.term.id, name: a.term.name, startDate: a.term.startDate }])
    ).values()
  ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const selectedTermId =
    (termIdParam && terms.some((t) => t.id === termIdParam) ? termIdParam : undefined) ??
    (terms.some((t) => t.id === currentTerm.id) ? currentTerm.id : undefined) ??
    terms[0]?.id;

  const classes = Array.from(
    new Map(
      assignments
        .filter((a) => a.sessionId === selectedSessionId && a.termId === selectedTermId)
        .map((a) => [a.classId, { id: a.classId, name: a.class.name }])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const selectedClassId =
    (classIdParam && classes.some((c) => c.id === classIdParam) ? classIdParam : undefined) ??
    classes[0]?.id;

  const subjects = Array.from(
    new Map(
      assignments
        .filter(
          (a) =>
            a.sessionId === selectedSessionId &&
            a.termId === selectedTermId &&
            a.classId === selectedClassId
        )
        .map((a) => [a.subjectId, { id: a.subjectId, name: a.subject.name }])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const selectedSubjectId =
    (subjectIdParam && subjects.some((s) => s.id === subjectIdParam) ? subjectIdParam : undefined) ??
    subjects[0]?.id;

  const assignment = assignments.find(
    (a) =>
      a.sessionId === selectedSessionId &&
      a.termId === selectedTermId &&
      a.classId === selectedClassId &&
      a.subjectId === selectedSubjectId
  );

  if (!assignment) {
    return {
      ctx: {
        classId: selectedClassId ?? "",
        subjectId: selectedSubjectId ?? "",
        sessionId: selectedSessionId ?? "",
        termId: selectedTermId ?? "",
        className: classes.find((c) => c.id === selectedClassId)?.name ?? "-",
        subjectName: subjects.find((s) => s.id === selectedSubjectId)?.name ?? "-",
        termLabel: terms.find((t) => t.id === selectedTermId)?.name ?? "-",
        totalStudentsLabel: "0 students",
        maxTest: 20,
        maxExam: 80,
      },
      students: [],
      filters: {
        sessions: sessions.map(({ id, name }) => ({ id, name })),
        terms: terms.map(({ id, name }) => ({ id, name })),
        classes,
        subjects,
        selectedSessionId,
        selectedTermId,
        selectedClassId,
        selectedSubjectId,
      },
    };
  }

  const classHistories = await prisma.studentClassHistory.findMany({
    where: {
      classId: assignment.classId,
      sessionId: assignment.sessionId,
      termId: assignment.termId,
    },
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
    orderBy: [{ student: { admissionNumber: "asc" } }],
  });

  const historyIds = classHistories.map((h) => h.id);
  const existingResults = historyIds.length
    ? await prisma.result.findMany({
        where: {
          classHistoryId: { in: historyIds },
          subjectId: assignment.subjectId,
        },
        select: {
          studentId: true,
          ca1: true,
          exam: true,
          status: true,
          updatedAt: true,
        },
      })
    : [];

  const resultByStudentId = new Map(existingResults.map((r) => [r.studentId, r]));
  const students: ResultStudent[] = classHistories.map((row) => {
    const r = resultByStudentId.get(row.student.id);
    const rawStatus = (r?.status ?? "draft").toLowerCase();
    const status =
      rawStatus === "submitted"
        ? "submitted"
        : rawStatus === "saved"
          ? "saved"
          : rawStatus === "error"
            ? "error"
            : "draft";

    return {
      id: row.student.id,
      name: `${row.student.user.lastName.toUpperCase()}, ${row.student.user.firstName}`,
      admNo: row.student.admissionNumber,
      test: r?.ca1 ?? 0,
      exam: r?.exam ?? 0,
      status,
    };
  });

  const lastSaved = existingResults
    .map((r) => r.updatedAt)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const ctx: ResultContext = {
    classId: assignment.classId,
    subjectId: assignment.subjectId,
    sessionId: assignment.sessionId,
    termId: assignment.termId,
    className: assignment.class.name,
    subjectName: assignment.subject.name,
    termLabel: assignment.term.name,
    totalStudentsLabel: `${students.length} students`,
    lastSavedLabel: lastSaved
      ? lastSaved.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "--",
    maxTest: 20,
    maxExam: 80,
  };

  return {
    ctx,
    students,
    filters: {
      sessions: sessions.map(({ id, name }) => ({ id, name })),
      terms: terms.map(({ id, name }) => ({ id, name })),
      classes,
      subjects,
      selectedSessionId,
      selectedTermId,
      selectedClassId,
      selectedSubjectId,
    },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const { ctx, students, filters } = await getResultsEntryData({ searchParams });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          Filter Result Entry
        </h3>
        <form method="get" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Session</label>
            <select
              name="sessionId"
              defaultValue={filters.selectedSessionId}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {filters.sessions.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Term</label>
            <select
              name="termId"
              defaultValue={filters.selectedTermId}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {filters.terms.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
            <select
              name="classId"
              defaultValue={filters.selectedClassId}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {filters.classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <select
              name="subjectId"
              defaultValue={filters.selectedSubjectId}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {filters.subjects.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
      <ResultsEntryClient ctx={ctx} initialStudents={students} />
    </div>
  );
}
