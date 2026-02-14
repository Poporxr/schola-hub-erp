import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import ResultFiltersCard from "@/components/student/results/ResultFiltersCard";
import ResultHeroCard from "@/components/student/results/ResultHeroCard";
import ResultSummaryCards from "@/components/student/results/ResultSummaryCards";
import SubjectBreakdownTable from "@/components/student/results/SubjectBreakdownTable";
import ResultDomainCards from "@/components/student/results/ResultDomainCards";
import ResultRemarkCard from "@/components/student/results/ResultRemarkCard";
import { AffectiveData, OptionItem, PsychomotorData, SubjectResultRow, SummaryData } from "@/components/student/results/types";

type SearchParams = {
  sessionId?: string | string[];
  termId?: string | string[];
  classId?: string | string[];
};

const firstParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

const Page = async ({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) => {
  const resolvedSearchParams = await searchParams;
  const sessionIdParam = firstParam(resolvedSearchParams?.sessionId);
  const termIdParam = firstParam(resolvedSearchParams?.termId);
  const classIdParam = firstParam(resolvedSearchParams?.classId);

  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6 text-sm text-slate-600">Sign in to view your results.</div>;
  }

  const student = await prisma.student.findUnique({
    where: {id: userId },
    select: {
      id: true,
      admissionNumber: true,
      user: { select: { firstName: true, lastName: true, image: true } },
    },
  });

  if (!student) {
    return <div className="p-6 text-sm text-slate-600">No student profile is linked to this account.</div>;
  }

  const [currentTerm, histories] = await Promise.all([
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, sessionId: true },
    }),
    prisma.studentClassHistory.findMany({
      where: { studentId: student.id },
      select: {
        id: true,
        classId: true,
        sessionId: true,
        termId: true,
        class: { select: { id: true, name: true } },
        session: { select: { id: true, name: true, startDate: true } },
        term: { select: { id: true, name: true, startDate: true } },
      },
      orderBy: [{ session: { startDate: "desc" } }, { term: { startDate: "desc" } }],
    }),
  ]);

  if (!histories.length) {
    return <div className="p-6 text-sm text-slate-600">No class history found for this student.</div>;
  }

  const sessions: (OptionItem & { startDate: Date })[] = Array.from(
    new Map(histories.map((h) => [h.sessionId, { id: h.session.id, name: h.session.name, startDate: h.session.startDate }])).values()
  ).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  const selectedSessionId =
    (sessionIdParam && sessions.some((s) => s.id === sessionIdParam) ? sessionIdParam : undefined) ??
    (currentTerm && sessions.some((s) => s.id === currentTerm.sessionId) ? currentTerm.sessionId : undefined) ??
    sessions[0].id;

  const terms: (OptionItem & { startDate: Date })[] = Array.from(
    new Map(
      histories
        .filter((h) => h.sessionId === selectedSessionId)
        .map((h) => [h.termId, { id: h.term.id, name: h.term.name, startDate: h.term.startDate }])
    ).values()
  ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const selectedTermId =
    (termIdParam && terms.some((t) => t.id === termIdParam) ? termIdParam : undefined) ??
    (currentTerm && terms.some((t) => t.id === currentTerm.id) ? currentTerm.id : undefined) ??
    terms[0]?.id;

  const classes: OptionItem[] = Array.from(
    new Map(
      histories
        .filter((h) => h.sessionId === selectedSessionId && h.termId === selectedTermId)
        .map((h) => [h.classId, { id: h.class.id, name: h.class.name }])
    ).values()
  );

  const selectedClassId =
    (classIdParam && classes.some((c) => c.id === classIdParam) ? classIdParam : undefined) ?? classes[0]?.id;

  const selectedHistory = histories.find(
    (h) => h.sessionId === selectedSessionId && h.termId === selectedTermId && h.classId === selectedClassId
  );

  const results = selectedHistory
    ? await prisma.result.findMany({
        where: {
          studentId: student.id,
          classHistoryId: selectedHistory.id,
        },
        select: {
          id: true,
          ca1: true,
          ca2: true,
          project: true,
          exam: true,
          totalScore: true,
          grade: true,
          position: true,
          teacherRemark: true,
          principalRemark: true,
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
        orderBy: [{ subject: { name: "asc" } }],
      })
    : [];

  const classSize = selectedHistory
    ? await prisma.studentClassHistory.count({
        where: {
          classId: selectedHistory.classId,
          sessionId: selectedHistory.sessionId,
          termId: selectedHistory.termId,
        },
      })
    : 0;

  const totalSubjects = results.length;
  const totalScore = results.reduce((sum, row) => sum + row.totalScore, 0);
  const overallAverage = totalSubjects ? totalScore / totalSubjects : 0;
  const passedCount = results.filter((row) => row.totalScore >= 50).length;
  const status = totalSubjects && passedCount === totalSubjects ? "PASSED" : "IN PROGRESS";
  const maxScore = totalSubjects * 100;
  const classPosition = results.find((row) => row.position !== null)?.position;

  const affective = results.find((r) => r.affectiveScores[0])?.affectiveScores[0];
  const psychomotor = results.find((r) => r.psychomotorScores[0])?.psychomotorScores[0];
  const teacherRemark = results.find((r) => r.teacherRemark)?.teacherRemark;
  const principalRemark = results.find((r) => r.principalRemark)?.principalRemark;
  const summary: SummaryData = {
    overallAverage,
    totalScore,
    maxScore,
    classPosition,
    classSize,
    totalSubjects,
    passedCount,
    status,
  };
  const rows: SubjectResultRow[] = results.map((subject) => ({
    id: subject.id,
    subjectName: subject.subject.name,
    tests: (subject.ca1 ?? 0) + (subject.ca2 ?? 0),
    assignments: subject.project ?? 0,
    exam: subject.exam ?? 0,
    totalScore: subject.totalScore,
    grade: subject.grade,
  }));
  const affectiveData: AffectiveData | undefined = affective;
  const psychomotorData: PsychomotorData | undefined = psychomotor;

  return (
    <div>
      <ResultFiltersCard
        sessions={sessions.map(({ id, name }) => ({ id, name }))}
        terms={terms.map(({ id, name }) => ({ id, name }))}
        classes={classes}
        selectedSessionId={selectedSessionId}
        selectedTermId={selectedTermId}
        selectedClassId={selectedClassId}
      />
      <ResultHeroCard
        data={{
          studentId: student.id,
          fullName: `${student.user.firstName} ${student.user.lastName}`,
          admissionNumber: student.admissionNumber,
          image: student.user.image,
          className: selectedHistory?.class.name,
          termName: terms.find((t) => t.id === selectedTermId)?.name,
          sessionName: sessions.find((s) => s.id === selectedSessionId)?.name,
        }}
      />
      <ResultSummaryCards summary={summary} />
      <SubjectBreakdownTable rows={rows} />
      <ResultDomainCards affective={affectiveData} psychomotor={psychomotorData} />
      <ResultRemarkCard remark={teacherRemark ?? principalRemark} />
    </div>
  );
};

export default Page;
