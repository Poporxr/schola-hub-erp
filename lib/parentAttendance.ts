import { prisma } from "@/lib/prisma";

export type ParentAttendanceRow = {
  id: string;
  date: string;
  status: string;
  period: string | null;
  notes: string | null;
  className: string | null;
};

export type ParentAttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
};

export type ParentAttendanceData = {
  rows: ParentAttendanceRow[];
  summary: ParentAttendanceSummary;
  attendanceRate: number;
  dataScopeLabel: string;
  classNameFallback: string | null;
};

export type ParentAttendanceResult =
  | { ok: true; data: ParentAttendanceData }
  | { ok: false; error: string };

export async function getParentAttendanceData({
  userId,
  studentId,
}: {
  userId: string;
  studentId: string;
}): Promise<ParentAttendanceResult> {
  const [student, currentTerm] = await Promise.all([
    prisma.student.findFirst({
      where: {
        id: studentId,
        parentStudents: {
          some: { parent: { OR: [{ id: userId }, { userId }] } },
        },
      },
      select: {
        id: true,
        classHistories: {
          orderBy: [{ createdAt: "desc" }],
          select: {
            class: { select: { name: true } },
            sessionId: true,
            termId: true,
          },
        },
      },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, sessionId: true, startDate: true, endDate: true },
    }),
  ]);

  if (!student) {
    return { ok: false, error: "Student not found or not linked to this parent." };
  }
  if (!currentTerm) {
    return { ok: false, error: "No current term configured." };
  }

  const classHistory = student.classHistories.find(
    (history) => history.sessionId === currentTerm.sessionId && history.termId === currentTerm.id
  );

  const attendanceRows = await prisma.attendance.findMany({
    where: {
      studentId: student.id,
      date: {
        gte: currentTerm.startDate,
        lte: currentTerm.endDate,
      },
      OR: [
        { sessionId: currentTerm.sessionId, termId: currentTerm.id },
        { sessionId: currentTerm.sessionId, termId: null },
        { sessionId: null, termId: currentTerm.id },
        { sessionId: null, termId: null },
      ],
    },
    orderBy: [{ date: "desc" }],
    select: {
      id: true,
      date: true,
      status: true,
      period: true,
      notes: true,
      class: { select: { name: true } },
    },
  });

  const fallbackRows =
    attendanceRows.length === 0
      ? await prisma.attendance.findMany({
          where: { studentId: student.id },
          orderBy: [{ date: "desc" }],
          take: 10,
          select: {
            id: true,
            date: true,
            status: true,
            period: true,
            notes: true,
            class: { select: { name: true } },
          },
        })
      : [];

  const rowsToShow = attendanceRows.length ? attendanceRows : fallbackRows;
  const dataScopeLabel = attendanceRows.length
    ? `Current term (${currentTerm.startDate.toLocaleDateString("en-US")} - ${currentTerm.endDate.toLocaleDateString(
        "en-US"
      )})`
    : "Attendance records for the past 10 enteries.";

  const summary = rowsToShow.reduce(
    (acc, row) => {
      if (row.status === "PRESENT") acc.present += 1;
      if (row.status === "ABSENT") acc.absent += 1;
      if (row.status === "LATE") acc.late += 1;
      if (row.status === "EXCUSED") acc.excused += 1;
      acc.total += 1;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
  );

  const attendanceRate = summary.total
    ? Math.round(((summary.present + summary.late + summary.excused) / summary.total) * 100)
    : 0;

  return {
    ok: true,
    data: {
      rows: rowsToShow.map((row) => ({
        id: row.id,
        date: row.date.toISOString(),
        status: row.status,
        period: row.period,
        notes: row.notes,
        className: row.class?.name ?? null,
      })),
      summary,
      attendanceRate,
      dataScopeLabel,
      classNameFallback: classHistory?.class.name ?? null,
    },
  };
}
