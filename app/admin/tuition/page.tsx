import FeesManagementClient from "@/components/actions/FeesManagementClient";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true, name: true },
  });

  const currentTerm = currentSession
    ? await prisma.term.findFirst({
        where: { sessionId: currentSession.id, isCurrent: true },
        select: { id: true, name: true, sessionId: true },
      })
    : null;

  const [sessions, terms, levels, classes, feeStructuresRaw, feeItems, assignmentsRaw, paymentsGrouped, studentsGrouped] =
    await Promise.all([
      prisma.academicSession.findMany({
        orderBy: [{ startDate: "desc" }],
        select: { id: true, name: true },
      }),
      prisma.term.findMany({
        orderBy: [{ startDate: "desc" }],
        select: { id: true, name: true, sessionId: true },
      }),
      prisma.level.findMany({
        orderBy: [{ name: "asc" }],
        select: { id: true, name: true },
      }),
      prisma.class.findMany({
        orderBy: [{ name: "asc" }],
        select: { id: true, name: true },
      }),
      prisma.feeStructure.findMany({
        where: currentSession ? { sessionId: currentSession.id } : undefined,
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          status: true,
          createdBy: true,
          sessionId: true,
          termId: true,
          levelId: true,
          items: {
            select: { id: true, name: true, amount: true, isOptional: true },
          },
        },
      }),
      prisma.feeStructureItem.findMany({
        select: { feeStructureId: true, amount: true },
      }),
      prisma.classFeeAssignment.findMany({
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          classId: true,
          feeStructureId: true,
          sessionId: true,
          termId: true,
          class: { select: { name: true } },
          feeStructure: { select: { name: true } },
        },
      }),
      prisma.payment.groupBy({
        by: ["assignmentId"],
        _sum: { amount: true },
      }),
      currentSession && currentTerm
        ? prisma.studentClassHistory.groupBy({
            by: ["classId"],
            where: { sessionId: currentSession.id, termId: currentTerm.id },
            _count: { _all: true },
          })
        : Promise.resolve([]),
    ]);

  const totalsByStructure = new Map<string, number>();
  for (const item of feeItems) {
    totalsByStructure.set(
      item.feeStructureId,
      (totalsByStructure.get(item.feeStructureId) ?? 0) + item.amount
    );
  }

  const sessionMap = new Map(sessions.map((s) => [s.id, s.name]));
  const termMap = new Map(terms.map((t) => [t.id, t.name]));
  const studentMap = new Map(studentsGrouped.map((row) => [row.classId, row._count._all]));
  const paymentMap = new Map(
    paymentsGrouped.map((row) => [row.assignmentId, row._sum.amount ?? 0])
  );

  const feeStructures = feeStructuresRaw.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    createdBy: row.createdBy || "Admin",
    sessionName: sessionMap.get(row.sessionId) ?? "",
    termName: termMap.get(row.termId) ?? "",
    termId: row.termId,
    levelId: row.levelId,
    total: totalsByStructure.get(row.id) ?? 0,
    items: row.items.map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      optional: item.isOptional,
    })),
  }));

  const assignments = assignmentsRaw.map((row) => {
    const students = studentMap.get(row.classId) ?? 0;
    const expected = (totalsByStructure.get(row.feeStructureId) ?? 0) * students;
    const collected = paymentMap.get(row.id) ?? 0;
    const outstanding = Math.max(expected - collected, 0);
    const progress = expected > 0 ? Math.round((collected / expected) * 100) : 0;
    return {
      id: row.id,
      classId: row.classId,
      className: row.class.name,
      structureId: row.feeStructureId,
      structureName: row.feeStructure.name,
      sessionId: row.sessionId,
      termId: row.termId,
      students,
      expected,
      collected,
      outstanding,
      progress,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <FeesManagementClient
        feeStructures={feeStructures}
        assignments={assignments}
        sessions={sessions}
        terms={terms}
        levels={levels}
        classes={classes}
        currentSessionId={currentSession?.id ?? null}
        currentSessionName={currentSession?.name ?? null}
        currentTermId={currentTerm?.id ?? null}
      />
    </div>
  );
}