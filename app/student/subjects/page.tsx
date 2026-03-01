import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { BookOpen, Clock, Users } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6 text-sm text-slate-600">Sign in to view your subjects.</div>;
  }

  const currentTerm = await prisma.term.findFirst({
    where: { isCurrent: true, session: { isCurrent: true } },
    select: { id: true, sessionId: true },
  });

  if (!currentTerm) {
    return <div className="p-6 text-sm text-slate-600">No current term is configured.</div>;
  }

  const student = await prisma.student.findFirst({
    where: { OR: [{ id: userId }, { userId }] },
    select: {
      classHistories: {
        where: { sessionId: currentTerm.sessionId, termId: currentTerm.id },
        take: 1,
        select: { classId: true },
      },
    },
  });

  const classId = student?.classHistories[0]?.classId;
  if (!classId) {
    return <div className="p-6 text-sm text-slate-600">No class is assigned for the current term.</div>;
  }

  const [subjectRows, classSize, timetableRows] = await Promise.all([
    prisma.subjectTeacher.findMany({
      where: {
        classId,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      select: {
        subjectId: true,
        subject: { select: { id: true, name: true, code: true } },
        teacher: {
          select: {
            user: {
              select: { firstName: true, lastName: true, image: true },
            },
          },
        },
      },
      orderBy: [{ subject: { name: "asc" } }],
    }),
    prisma.studentClassHistory.count({
      where: {
        classId,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
    }),
    prisma.timetableEntry.findMany({
      where: {
        classId,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
        status: "ACTIVE",
      },
      select: {
        subjectId: true,
        startTime: true,
        endTime: true,
      },
    }),
  ]);

  const weeklyHoursBySubject = new Map<string, number>();
  for (const row of timetableRows) {
    const [sh, sm] = row.startTime.split(":").map(Number);
    const [eh, em] = row.endTime.split(":").map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    const hours = Math.max(0, endMinutes - startMinutes) / 60;
    weeklyHoursBySubject.set(row.subjectId, (weeklyHoursBySubject.get(row.subjectId) ?? 0) + hours);
  }

  const subjects = subjectRows.map((row) => {
    const weeklyHours = weeklyHoursBySubject.get(row.subjectId) ?? 0;
    return {
      id: row.subject.id,
      code: row.subject.code ?? row.subject.id,
      name: row.subject.name,
      teacherName: `${row.teacher.user.firstName} ${row.teacher.user.lastName}`,
      teacherAvatar: row.teacher.user.image ?? undefined,
      weeklyHours: weeklyHours % 1 === 0 ? `${weeklyHours}h / week` : `${weeklyHours.toFixed(1)}h / week`,
    };
  });

  return (
    <div className=" space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
          >
            {/* Header Image */}
            <div className="relative h-32 bg-linear-to-br from-primary to-primary-soft">
              <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
              <div className="absolute bottom-0 text-white p-4">
                <h3 className="font-bold text-lg">{subject.name}</h3>
                <p className="text-xs opacity-90">Code: {subject.code}</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Teacher */}
              <div className="flex items-center gap-3 mb-4">
                <UserAvatar
                  src={subject.teacherAvatar}
                  alt={subject.teacherName}
                  size={40}
                  className="h-10 w-10 border border-border"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {subject.teacherName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Subject Teacher
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <span className="inline-flex items-center">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {subject.weeklyHours}
                </span>

                <span className="inline-flex items-center">
                  <Users className="w-4 h-4 inline mr-1" />
                  {classSize} Students
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
