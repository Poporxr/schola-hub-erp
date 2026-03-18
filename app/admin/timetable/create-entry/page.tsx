import AdminTimetableEntryClient from "@/components/timetable/AdminTimetableEntryClient";
import BackButton from "@/components/BackButton";
import { prisma } from "@/lib/prisma";

export default async function AdminTimetableCreateEntryPage() {
  let sessions: { id: string; name: string; isCurrent: boolean }[] = [];
  let terms: { id: string; name: string; sessionId: string; isCurrent: boolean }[] = [];
  let classes: { id: string; name: string }[] = [];
  let classSubjects: { classId: string; subject: { id: string; name: string } }[] = [];
  let subjectTeachers: {
    classId: string;
    subjectId: string;
    sessionId: string;
    termId: string;
    teacher: { id: string; user: { firstName: string; lastName: string } };
  }[] = [];
  let currentTerm: { id: string; sessionId: string } | null = null;
  let dbError = "";

  try {
    [sessions, terms, classes, classSubjects, subjectTeachers, currentTerm] = await Promise.all([
      prisma.academicSession.findMany({
        select: { id: true, name: true, isCurrent: true },
        orderBy: [{ startDate: "desc" }, { name: "desc" }],
      }),
      prisma.term.findMany({
        select: { id: true, name: true, sessionId: true, isCurrent: true },
        orderBy: [{ startDate: "desc" }, { name: "asc" }],
      }),
      prisma.class.findMany({
        select: { id: true, name: true },
        orderBy: [{ name: "asc" }],
      }),
      prisma.classSubject.findMany({
        select: {
          classId: true,
          subject: { select: { id: true, name: true } },
        },
      }),
      prisma.subjectTeacher.findMany({
        select: {
          classId: true,
          subjectId: true,
          sessionId: true,
          termId: true,
          teacher: {
            select: { id: true, user: { select: { firstName: true, lastName: true } } },
          },
        },
      }),
      prisma.term.findFirst({
        where: { isCurrent: true, session: { isCurrent: true } },
        select: { id: true, sessionId: true },
      }),
    ]);
  } catch (error) {
    console.error("AdminTimetableCreateEntryPage failed to load", error);
    dbError = "Database is temporarily unavailable. Please try again shortly.";
  }

  const subjectsMap = new Map<string, { id: string; name: string; classIds: Set<string> }>();
  for (const row of classSubjects) {
    const existing = subjectsMap.get(row.subject.id);
    if (existing) {
      existing.classIds.add(row.classId);
      continue;
    }
    subjectsMap.set(row.subject.id, {
      id: row.subject.id,
      name: row.subject.name,
      classIds: new Set([row.classId]),
    });
  }

  const subjectOptions = Array.from(subjectsMap.values()).map((item) => ({
    id: item.id,
    name: item.name,
    classIds: Array.from(item.classIds),
  }));

  const teacherAssignments = subjectTeachers.map((row) => ({
    teacherId: row.teacher.id,
    teacherName: `${row.teacher.user.firstName} ${row.teacher.user.lastName}`.trim(),
    classId: row.classId,
    subjectId: row.subjectId,
    sessionId: row.sessionId,
    termId: row.termId,
  }));

  const fallbackSessionId = sessions[0]?.id ?? "";
  const defaultSessionId = currentTerm?.sessionId ?? fallbackSessionId;
  const defaultTermId =
    currentTerm?.id ?? terms.find((item) => item.sessionId === defaultSessionId)?.id ?? terms[0]?.id ?? "";

  return (
    <div className="space-y-4">
      <BackButton />
      <AdminTimetableEntryClient
        sessions={sessions}
        terms={terms}
        classes={classes}
        subjects={subjectOptions}
        teacherAssignments={teacherAssignments}
        defaultSessionId={defaultSessionId}
        defaultTermId={defaultTermId}
        dbError={dbError}
      />
    </div>
  );
}
