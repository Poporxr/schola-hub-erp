import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type Payload = {
  action: "save" | "submit";
  classId: string;
  subjectId: string;
  sessionId: string;
  termId: string;
  students: Array<{ id: string; test: number; project: number; exam: number }>;
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacher = await prisma.teacher.findFirst({
    where: { OR: [{ id: userId }, { userId }] },
    select: { id: true },
  });
  if (!teacher) return Response.json({ error: "Teacher profile not found" }, { status: 404 });

  const body = (await req.json()) as Partial<Payload>;
  const action = body.action;
  const classId = String(body.classId ?? "");
  const subjectId = String(body.subjectId ?? "");
  const sessionId = String(body.sessionId ?? "");
  const termId = String(body.termId ?? "");
  const students = Array.isArray(body.students) ? body.students : [];

  if (!action || !classId || !subjectId || !sessionId || !termId || !students.length) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const teacherSubjectCatalog = await prisma.subjectTeacher.findMany({
    where: { teacherId: teacher.id },
    select: { subjectId: true },
    distinct: ["subjectId"],
  });
  const teacherSubjectIds = teacherSubjectCatalog.map((row) => row.subjectId);
  const isTeacherSubject = teacherSubjectIds.includes(subjectId);

  const [isSubjectTeacherAssigned, isClassTeacherAssigned, isSubjectLinkedToClass] =
    await Promise.all([
      prisma.subjectTeacher.count({
        where: {
          teacherId: teacher.id,
          classId,
          subjectId,
          sessionId,
          termId,
        },
      }),
      prisma.classTeacher.count({
        where: {
          teacherId: teacher.id,
          classId,
          sessionId,
          termId,
        },
      }),
      prisma.classSubject.count({
        where: {
          classId,
          subjectId,
        },
      }),
    ]);

  const canEnterResults =
    isSubjectTeacherAssigned > 0 ||
    (isClassTeacherAssigned > 0 && isTeacherSubject && isSubjectLinkedToClass > 0);

  if (!canEnterResults) {
    return Response.json(
      { error: "Not assigned to this subject/class for the selected term." },
      { status: 403 }
    );
  }

  const histories = await prisma.studentClassHistory.findMany({
    where: {
      classId,
      sessionId,
      termId,
      studentId: { in: students.map((s) => s.id) },
    },
    select: { id: true, studentId: true },
  });
  const historyByStudent = new Map(histories.map((h) => [h.studentId, h.id]));
  const status = action === "submit" ? "submitted" : "saved";

  await prisma.$transaction(
    students
      .map((row) => {
        const classHistoryId = historyByStudent.get(row.id);
        if (!classHistoryId) return null;
        const ca1 = Number.isFinite(row.test) ? row.test : 0;
        const project = Number.isFinite(row.project) ? row.project : 0;
        const exam = Number.isFinite(row.exam) ? row.exam : 0;
        const totalScore = ca1 + project + exam;
        return prisma.result.upsert({
          where: {
            studentId_subjectId_classHistoryId: {
              studentId: row.id,
              subjectId,
              classHistoryId,
            },
          },
          update: {
            ca1,
            ca2: 0,
            project,
            exam,
            totalScore,
            status,
          },
          create: {
            studentId: row.id,
            subjectId,
            classHistoryId,
            ca1,
            ca2: 0,
            project,
            exam,
            totalScore,
            status,
          },
        });
      })
      .filter((op): op is NonNullable<typeof op> => op !== null)
  );

  return Response.json({ ok: true });
}
