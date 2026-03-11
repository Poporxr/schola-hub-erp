import AttendanceClient from "@/components/teacher/AttendanceClient";
import { prisma } from "@/lib/prisma";
import { todayDateInputValue } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";


type StudentRow = {
  id: string;
  sn: number;
  name: string;
  admissionNo: string;
  gender: "Male" | "Female";
  status: "present" | "absent" | "late";
};

export default async function Page() {
  const { userId } = await auth();
  if (!userId) return <div className="p-6 text-sm text-slate-600">Sign in to view attendance.</div>;

  const [teacher, currentTerm] = await Promise.all([
    prisma.teacher.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      select: {
        id: true,
        classTeachers: {
          where: {
            session: { isCurrent: true },
            term: { isCurrent: true },
          },
          select: { class: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, sessionId: true, name: true },
    }),
  ]);

  if (!teacher) return <div className="p-6 text-sm text-slate-600">Teacher profile not found.</div>;
  if (!currentTerm) return <div className="p-6 text-sm text-slate-600">No current term configured.</div>;

  const classOptions = teacher.classTeachers
    .map((row) => row.class)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!classOptions.length) {
    return <div className="p-6 text-sm text-slate-600">No class teacher assignment found.</div>;
  }

  const selectedClassId = classOptions[0].id;
  const selectedDate = todayDateInputValue();

  const [studentsInClass, existingAttendance] = await Promise.all([
    prisma.studentClassHistory.findMany({
      where: {
        classId: selectedClassId,
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
        classId: selectedClassId,
        date: new Date(`${selectedDate}T00:00:00.000Z`),
        subjectId: null,
        period: null,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      select: { studentId: true, status: true },
    }),
  ]);

  const existingStatus = new Map(existingAttendance.map((row) => [row.studentId, row.status]));
  const initialStudents: StudentRow[] = studentsInClass.map((row, index) => ({
    id: row.student.id,
    sn: index + 1,
    name: `${row.student.user.firstName} ${row.student.user.lastName}`,
    admissionNo: row.student.admissionNumber,
    gender: row.student.gender === "MALE" ? "Male" : "Female",
    status:
      existingStatus.get(row.student.id) === "ABSENT"
        ? "absent"
        : existingStatus.get(row.student.id) === "LATE"
          ? "late"
          : "present",
  }));

  return (
    <AttendanceClient
      initialStudents={initialStudents}
      classOptions={classOptions}
      initialClassId={selectedClassId}
      initialDate={selectedDate}
      termLabel={currentTerm.name}
    />
  );
}
