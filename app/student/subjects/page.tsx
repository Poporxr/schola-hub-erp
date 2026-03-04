import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { BookOpen, Clock, Layers, Users } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { greetingForHour } from "@/lib/settings";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6 text-sm text-slate-600">Sign in to view your subjects.</div>;
  }

  const currentTerm = await prisma.term.findFirst({
    where: { isCurrent: true, session: { isCurrent: true } },
    select: { id: true, sessionId: true, name: true, session: { select: { name: true } } },
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
      user: { select: { firstName: true } },
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
      weeklyHoursValue: weeklyHours,
      weeklyHours: weeklyHours % 1 === 0 ? `${weeklyHours}h / week` : `${weeklyHours.toFixed(1)}h / week`,
    };
  });

  const totalWeeklyHours = subjects.reduce((sum, subject) => sum + subject.weeklyHoursValue, 0);
  const averageWeeklyHours = subjects.length ? Number((totalWeeklyHours / subjects.length).toFixed(1)) : 0;
  const now = new Date();

  return (
    <div className="space-y-6">


      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Subjects</p>
            <BookOpen className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{subjects.length}</p>
          <p className="mt-2 text-xs text-slate-500">Active this term</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Weekly Average</p>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{averageWeeklyHours}h</p>
          <p className="mt-2 text-xs text-slate-500">Per subject</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Class Size</p>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{classSize}</p>
          <p className="mt-2 text-xs text-slate-500">Students enrolled</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Class Load</p>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalWeeklyHours.toFixed(1)}h</p>
          <p className="mt-2 text-xs text-slate-500">Total weekly hours</p>
        </div>
      </div>

      {subjects.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-br from-indigo-50/60 via-transparent to-white" />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{subject.code}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{subject.name}</h3>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <UserAvatar
                    src={subject.teacherAvatar}
                    alt={subject.teacherName}
                    size={40}
                    className="h-10 w-10 border border-slate-200"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{subject.teacherName}</p>
                    <p className="text-xs text-slate-500">Subject Teacher</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {subject.weeklyHours}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                    <Users className="w-4 h-4" />
                    {classSize} Students
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500">No subjects found for this term.</div>
      )}
    </div>
  );
};

export default Page;
