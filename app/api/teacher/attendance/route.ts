import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

type ClientStatus = "present" | "absent" | "late";

function parseDateOnly(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function toClientStatus(status: AttendanceStatus): ClientStatus {
  if (status === AttendanceStatus.ABSENT) return "absent";
  if (status === AttendanceStatus.LATE) return "late";
  return "present";
}

function toDbStatus(status: ClientStatus): AttendanceStatus {
  if (status === "absent") return AttendanceStatus.ABSENT;
  if (status === "late") return AttendanceStatus.LATE;
  return AttendanceStatus.PRESENT;
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacher = await prisma.teacher.findFirst({
    where: { OR: [{ id: userId }, { userId }] },
    select: { id: true },
  });
  if (!teacher) return Response.json({ error: "Teacher profile not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const date = searchParams.get("date");
  if (!classId || !date) {
    return Response.json({ error: "Missing classId or date" }, { status: 400 });
  }

  const currentTerm = await prisma.term.findFirst({
    where: { isCurrent: true, session: { isCurrent: true } },
    select: { id: true, sessionId: true },
  });
  if (!currentTerm) return Response.json({ error: "No current term configured" }, { status: 400 });

  const assignmentCount = await prisma.subjectTeacher.count({
    where: {
      teacherId: teacher.id,
      classId,
      sessionId: currentTerm.sessionId,
      termId: currentTerm.id,
    },
  });
  const homeroomCount = await prisma.classTeacher.count({
    where: {
      teacherId: teacher.id,
      classId,
      sessionId: currentTerm.sessionId,
      termId: currentTerm.id,
    },
  });
  if (!assignmentCount && !homeroomCount) {
    return Response.json({ error: "You are not assigned to this class" }, { status: 403 });
  }

  const [studentsInClass, attendanceRows] = await Promise.all([
    prisma.studentClassHistory.findMany({
      where: {
        classId,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      select: {
        student: {
          select: {
            id: true,
            admissionNumber: true,
            gender: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: [{ student: { admissionNumber: "asc" } }],
    }),
    prisma.attendance.findMany({
      where: {
        classId,
        date: parseDateOnly(date),
        period: null,
        subjectId: null,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      select: { studentId: true, status: true },
    }),
  ]);

  const statusByStudent = new Map(attendanceRows.map((row) => [row.studentId, toClientStatus(row.status)]));
  const students = studentsInClass.map((row, index) => ({
    id: row.student.id,
    sn: index + 1,
    name: `${row.student.user.firstName} ${row.student.user.lastName}`,
    admissionNo: row.student.admissionNumber,
    gender: row.student.gender === "MALE" ? "Male" : "Female",
    status: (statusByStudent.get(row.student.id) ?? "present") as ClientStatus,
  }));

  return Response.json({ students });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teacher = await prisma.teacher.findFirst({
    where: { OR: [{ id: userId }, { userId }] },
    select: { id: true },
  });
  if (!teacher) return Response.json({ error: "Teacher profile not found" }, { status: 404 });

  const body = await req.json();
  const classId = String(body?.classId ?? "");
  const date = String(body?.date ?? "");
  const students = Array.isArray(body?.students) ? body.students : [];
  if (!classId || !date || !students.length) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const currentTerm = await prisma.term.findFirst({
    where: { isCurrent: true, session: { isCurrent: true } },
    select: { id: true, sessionId: true },
  });
  if (!currentTerm) return Response.json({ error: "No current term configured" }, { status: 400 });

  const assignmentCount = await prisma.subjectTeacher.count({
    where: {
      teacherId: teacher.id,
      classId,
      sessionId: currentTerm.sessionId,
      termId: currentTerm.id,
    },
  });
  const homeroomCount = await prisma.classTeacher.count({
    where: {
      teacherId: teacher.id,
      classId,
      sessionId: currentTerm.sessionId,
      termId: currentTerm.id,
    },
  });
  if (!assignmentCount && !homeroomCount) {
    return Response.json({ error: "You are not assigned to this class" }, { status: 403 });
  }

  const dateValue = parseDateOnly(date);

  const studentIds = students.map((row: { id: string }) => row.id);
  await prisma.$transaction([
    prisma.attendance.deleteMany({
      where: {
        classId,
        date: dateValue,
        period: null,
        subjectId: null,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
        studentId: { in: studentIds },
      },
    }),
    prisma.attendance.createMany({
      data: students.map((row: { id: string; status: ClientStatus }) => ({
        studentId: row.id,
        classId,
        teacherId: teacher.id,
        subjectId: null,
        date: dateValue,
        period: null,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
        status: toDbStatus(row.status),
      })),
    }),
  ]);

  return Response.json({ ok: true });
}
