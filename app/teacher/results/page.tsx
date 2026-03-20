import ResultsEntryClient, {
  type ResultStudent,
  type ResultContext,
} from "@/components/teacher/ResultEntryClient";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import ResultsFilters from "@/components/teacher/ResultsFilters";

type SearchParams = {
  sessionId?: string | string[];
  termId?: string | string[];
  classId?: string | string[];
  subjectId?: string | string[];
};

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

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
        maxTest: 10,
        maxProject: 30,
        maxExam: 60,
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
        maxTest: 10,
        maxProject: 30,
        maxExam: 60,
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

  const [subjectAssignments, classAssignments] = await Promise.all([
    prisma.subjectTeacher.findMany({
      where: { teacherId: teacher.id },
      select: {
        classId: true,
        subjectId: true,
        sessionId: true,
        termId: true,
        session: { select: { id: true, name: true, startDate: true } },
        term: { select: { id: true, name: true, startDate: true } },
        class: { select: { name: true } },
        subject: {
          select: {
            id: true,
            name: true,
            assessmentMax: true,
            projectMax: true,
            examMax: true,
          },
        },
      },
      orderBy: [
        { session: { startDate: "desc" } },
        { term: { startDate: "asc" } },
        { class: { name: "asc" } },
      ],
    }),
    prisma.classTeacher.findMany({
      where: { teacherId: teacher.id },
      select: {
        classId: true,
        sessionId: true,
        termId: true,
        session: { select: { id: true, name: true, startDate: true } },
        term: { select: { id: true, name: true, startDate: true } },
        class: { select: { name: true } },
      },
      orderBy: [
        { session: { startDate: "desc" } },
        { term: { startDate: "asc" } },
        { class: { name: "asc" } },
      ],
    }),
  ]);

  const teacherSubjectCatalogIds = Array.from(
    new Set(subjectAssignments.map((row) => row.subjectId))
  );

  if (!subjectAssignments.length && !classAssignments.length) {
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
        maxTest: 10,
        maxProject: 30,
        maxExam: 60,
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

  const allSessionTermRows = [...subjectAssignments, ...classAssignments];

  const sessions = Array.from(
    new Map(
      allSessionTermRows.map((a) => [
        a.sessionId,
        { id: a.session.id, name: a.session.name, startDate: a.session.startDate },
      ])
    ).values()
  ).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  const selectedSessionId =
    (sessionIdParam && sessions.some((s) => s.id === sessionIdParam)
      ? sessionIdParam
      : undefined) ??
    (sessions.some((s) => s.id === currentTerm.sessionId)
      ? currentTerm.sessionId
      : undefined) ??
    sessions[0]?.id;

  const terms = Array.from(
    new Map(
      allSessionTermRows
        .filter((a) => a.sessionId === selectedSessionId)
        .map((a) => [
          a.termId,
          { id: a.term.id, name: a.term.name, startDate: a.term.startDate },
        ])
    ).values()
  ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const selectedTermId =
    (termIdParam && terms.some((t) => t.id === termIdParam)
      ? termIdParam
      : undefined) ??
    (terms.some((t) => t.id === currentTerm.id) ? currentTerm.id : undefined) ??
    terms[0]?.id;

  const subjectAssignedClassRowsForTerm = subjectAssignments
    .filter((a) => a.sessionId === selectedSessionId && a.termId === selectedTermId)
    .map((a) => ({ classId: a.classId, className: a.class.name }));

  const classTeacherRowsForTerm = classAssignments.filter(
    (a) => a.sessionId === selectedSessionId && a.termId === selectedTermId
  );

  const classTeacherClassIds = classTeacherRowsForTerm.map((row) => row.classId);
  const classTeacherClassSubjects =
    classTeacherClassIds.length && teacherSubjectCatalogIds.length
      ? await prisma.classSubject.findMany({
          where: {
            classId: { in: classTeacherClassIds },
            subjectId: { in: teacherSubjectCatalogIds },
          },
          select: { classId: true },
        })
      : [];

  const classTeacherClassIdsWithTeacherSubjects = new Set(
    classTeacherClassSubjects.map((row) => row.classId)
  );

  const eligibleClassTeacherRows = classTeacherRowsForTerm
    .filter((row) => classTeacherClassIdsWithTeacherSubjects.has(row.classId))
    .map((row) => ({ classId: row.classId, className: row.class.name }));

  const classRowsForTerm = [
    ...subjectAssignedClassRowsForTerm,
    ...eligibleClassTeacherRows,
  ];

  const classes = Array.from(
    new Map(classRowsForTerm.map((a) => [a.classId, { id: a.classId, name: a.className }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const selectedClassId =
    (classIdParam && classes.some((c) => c.id === classIdParam)
      ? classIdParam
      : undefined) ??
    classes[0]?.id;

  const directSubjects = selectedClassId
    ? subjectAssignments
        .filter(
          (row) =>
            row.sessionId === selectedSessionId &&
            row.termId === selectedTermId &&
            row.classId === selectedClassId
        )
        .map((row) => ({
          id: row.subject.id,
          name: row.subject.name,
          assessmentMax: row.subject.assessmentMax,
          projectMax: row.subject.projectMax,
          examMax: row.subject.examMax,
        }))
    : [];

  const canUseClassTeacherFallback = Boolean(
    selectedClassId &&
      classTeacherRowsForTerm.some((row) => row.classId === selectedClassId) &&
      teacherSubjectCatalogIds.length
  );

  const fallbackClassSubjects = canUseClassTeacherFallback
    ? await prisma.classSubject.findMany({
        where: {
          classId: selectedClassId,
          subjectId: { in: teacherSubjectCatalogIds },
        },
        select: {
          subject: {
            select: {
              id: true,
              name: true,
              assessmentMax: true,
              projectMax: true,
              examMax: true,
            },
          },
        },
        orderBy: [{ subject: { name: "asc" } }],
      })
    : [];

  const fallbackSubjects = fallbackClassSubjects.map((row) => ({
    id: row.subject.id,
    name: row.subject.name,
    assessmentMax: row.subject.assessmentMax,
    projectMax: row.subject.projectMax,
    examMax: row.subject.examMax,
  }));

  const subjects = Array.from(
    new Map(
      [...directSubjects, ...fallbackSubjects].map((item) => [item.id, item])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const selectedSubjectId =
    (subjectIdParam && subjects.some((s) => s.id === subjectIdParam)
      ? subjectIdParam
      : undefined) ??
    subjects[0]?.id;
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  if (!selectedSessionId || !selectedTermId || !selectedClassId || !selectedSubjectId) {
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
        maxTest: selectedSubject?.assessmentMax ?? 10,
        maxProject: selectedSubject?.projectMax ?? 30,
        maxExam: selectedSubject?.examMax ?? 60,
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

  const effectiveTermId = selectedTermId;

  const classHistories = await prisma.studentClassHistory.findMany({
    where: {
      classId: selectedClassId,
      sessionId: selectedSessionId,
      termId: effectiveTermId,
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
          subjectId: selectedSubjectId,
        },
        select: {
          studentId: true,
          ca1: true,
          project: true,
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
      project: r?.project ?? 0,
      exam: r?.exam ?? 0,
      status,
    };
  });

  const lastSaved = existingResults
    .map((r) => r.updatedAt)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const ctx: ResultContext = {
    classId: selectedClassId,
    subjectId: selectedSubjectId,
    sessionId: selectedSessionId,
    termId: effectiveTermId,
    className: classes.find((c) => c.id === selectedClassId)?.name ?? "-",
    subjectName: subjects.find((s) => s.id === selectedSubjectId)?.name ?? "-",
    termLabel: terms.find((t) => t.id === effectiveTermId)?.name ?? "-",
    totalStudentsLabel: `${students.length} students`,
    lastSavedLabel: lastSaved
      ? lastSaved.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "--",
    maxTest: selectedSubject?.assessmentMax ?? 10,
    maxProject: selectedSubject?.projectMax ?? 30,
    maxExam: selectedSubject?.examMax ?? 60,
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
      selectedTermId: effectiveTermId,
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
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Results
          </p>
          <h1 className="text-2xl font-bold text-white/90 ">Enter Student Results</h1>
          <p className="text-sm text-white/70">
            Capture assessments for your assigned classes with real-time status tracking.
          </p>
        </div>
        <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <ResultsFilters
        sessions={filters.sessions}
        terms={filters.terms}
        classes={filters.classes}
        subjects={filters.subjects}
        selectedSessionId={filters.selectedSessionId}
        selectedTermId={filters.selectedTermId}
        selectedClassId={filters.selectedClassId}
        selectedSubjectId={filters.selectedSubjectId}
      />
      <ResultsEntryClient
        key={[ctx.sessionId, ctx.termId, ctx.classId, ctx.subjectId].join(":")}
        ctx={ctx}
        initialStudents={students}
      />
    </div>
  );
}
