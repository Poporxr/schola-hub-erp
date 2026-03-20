import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import ResultFiltersCard from "@/components/student/results/ResultFiltersCard";
import ResultHeroCard from "@/components/student/results/ResultHeroCard";
import ResultSummaryCards from "@/components/student/results/ResultSummaryCards";
import SubjectBreakdownTable from "@/components/student/results/SubjectBreakdownTable";
import ResultDomainCards from "@/components/student/results/ResultDomainCards";
import ResultRemarkCard from "@/components/student/results/ResultRemarkCard";
import { AffectiveData, OptionItem, PsychomotorData, SubjectResultRow, SummaryData } from "@/components/student/results/types";
import { getStudentRemark } from "@/lib/get-student-remark";

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

  const student = await prisma.student.findFirst({
    where: { OR: [{ id: userId }, { userId }] },
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

  const classHistoryRows = selectedHistory
    ? await prisma.studentClassHistory.findMany({
        where: {
          classId: selectedHistory.classId,
          sessionId: selectedHistory.sessionId,
          termId: selectedHistory.termId,
        },
        select: { id: true, studentId: true },
      })
    : [];

  const classResultsForRank = classHistoryRows.length
    ? await prisma.result.findMany({
        where: {
          classHistoryId: { in: classHistoryRows.map((row) => row.id) },
        },
        select: { studentId: true, totalScore: true },
      })
    : [];

  const rankingMap = classResultsForRank.reduce((map, row) => {
    const entry = map.get(row.studentId) ?? { sum: 0, count: 0 };
    entry.sum += row.totalScore;
    entry.count += 1;
    map.set(row.studentId, entry);
    return map;
  }, new Map<string, { sum: number; count: number }>());

  const rankedStudentIds = Array.from(rankingMap.entries())
    .map(([studentId, entry]) => ({
      studentId,
      average: entry.count ? entry.sum / entry.count : 0,
    }))
    .sort((a, b) => b.average - a.average)
    .map((row) => row.studentId);

  const totalSubjects = results.length;
  const totalScore = results.reduce((sum, row) => sum + row.totalScore, 0);
  const overallAverage = totalSubjects ? totalScore / totalSubjects : 0;
  const passedCount = results.filter((row) => row.totalScore >= 50).length;
  const status = totalSubjects && passedCount === totalSubjects ? "PASSED" : "IN PROGRESS";
  const maxScore = totalSubjects * 100;
  const classPosition = rankedStudentIds.length ? rankedStudentIds.indexOf(student.id) + 1 : null;
  const classSize = classHistoryRows.length;

  const affective = results.find((r) => r.affectiveScores[0])?.affectiveScores[0];
  const psychomotor = results.find((r) => r.psychomotorScores[0])?.psychomotorScores[0];
  const autoRemark = totalSubjects ? getStudentRemark(overallAverage) : null;
  const teacherRemark = results.find((r) => r.teacherRemark)?.teacherRemark ?? autoRemark?.teacherRemark;
  const principalRemark = results.find((r) => r.principalRemark)?.principalRemark ?? autoRemark?.principalRemark;
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
    exam: subject.exam ?? 0,
    totalScore: subject.totalScore,
    grade: subject.grade,
  }));
  const affectiveData: AffectiveData | undefined = affective;
  const psychomotorData: PsychomotorData | undefined = psychomotor;

  return (
    <div className="space-y-6 max-w-400 mx-auto w-full">
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
          sessionId: selectedSessionId,
          termId: selectedTermId,
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
      <ResultRemarkCard teacherRemark={teacherRemark} principalRemark={principalRemark} />
    </div>
  );
};

export default Page;
