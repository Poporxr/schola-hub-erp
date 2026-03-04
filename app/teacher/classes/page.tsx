import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { BookOpen, CalendarDays, CheckCircle, School, Users } from "lucide-react";
import { greetingForHour } from "@/lib/settings";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6 text-sm text-slate-600">Sign in to view classes.</div>;
  }

  const [teacher, currentTerm] = await Promise.all([
    prisma.teacher.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      select: { id: true, user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, sessionId: true, name: true },
    }),
  ]);

  if (!teacher) {
    return <div className="p-6 text-sm text-slate-600">Teacher profile not found.</div>;
  }
  if (!currentTerm) {
    return <div className="p-6 text-sm text-slate-600">No current term configured.</div>;
  }

  const [classTeacherRows, subjectTeacherRows] = await Promise.all([
    prisma.classTeacher.findMany({
      where: {
        teacherId: teacher.id,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      select: { classId: true, class: { select: { id: true, name: true } } },
    }),
    prisma.subjectTeacher.findMany({
      where: {
        teacherId: teacher.id,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      select: {
        classId: true,
        subjectId: true,
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
    }),
  ]);

  const classMap = new Map<string, { id: string; name: string; isClassTeacher: boolean; subjectNames: string[] }>();

  for (const row of classTeacherRows) {
    classMap.set(row.classId, { id: row.class.id, name: row.class.name, isClassTeacher: true, subjectNames: [] });
  }

  for (const row of subjectTeacherRows) {
    const existing = classMap.get(row.classId) ?? {
      id: row.class.id,
      name: row.class.name,
      isClassTeacher: false,
      subjectNames: [],
    };
    if (!existing.subjectNames.includes(row.subject.name)) {
      existing.subjectNames.push(row.subject.name);
    }
    classMap.set(row.classId, existing);
  }

  const filteredClasses = Array.from(classMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  const classStats = await Promise.all(
    filteredClasses.map(async (item) => {
      const [totalStudents, weeklyPeriods] = await Promise.all([
        prisma.studentClassHistory.count({
          where: {
            classId: item.id,
            sessionId: currentTerm.sessionId,
            termId: currentTerm.id,
          },
        }),
        prisma.timetableEntry.count({
          where: {
            classId: item.id,
            teacherId: teacher.id,
            sessionId: currentTerm.sessionId,
            termId: currentTerm.id,
            status: "ACTIVE",
          },
        }),
      ]);

      return {
        ...item,
        totalStudents,
        weeklyPeriods,
      };
    })
  );

  const totalClasses = classStats.length;
  const totalStudents = classStats.reduce((sum, item) => sum + item.totalStudents, 0);
  const totalWeeklyPeriods = classStats.reduce((sum, item) => sum + item.weeklyPeriods, 0);
  const homeroomCount = classStats.filter((item) => item.isClassTeacher).length;
  const teacherName = `${teacher.user.firstName ?? ""} ${teacher.user.lastName ?? ""}`.trim() || "Teacher";
  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="space-y-6">

      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Classes</p>
            <h1 className="text-2xl font-bold mt-2">Class Directory</h1>
            <p className="text-white/70 mt-2">Track class composition, homeroom coverage, and capacity.</p>
          </div>

        </div>
        <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Classes</p>
            <School className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalClasses}</p>
          <p className="mt-2 text-xs text-slate-500">Active this term</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Students Covered</p>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalStudents}</p>
          <p className="mt-2 text-xs text-slate-500">Across assigned classes</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Weekly Periods</p>
            <CalendarDays className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalWeeklyPeriods}</p>
          <p className="mt-2 text-xs text-slate-500">Scheduled periods</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-white/70">Homeroom</p>
            <CheckCircle className="h-4 w-4 text-white/70" />
          </div>
          <p className="mt-3 text-3xl font-bold">{homeroomCount}</p>
          <p className="mt-2 text-xs text-white/70">Class teacher roles</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">My Assigned Classes</h3>
            <p className="text-xs text-slate-500">Classes you teach this term ({currentTerm.name})</p>
          </div>
        </div>

        {classStats.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classStats.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-lg">{item.name}</h4>
                    <p className="text-xs text-slate-500">Assigned class</p>
                  </div>
                  {item.isClassTeacher ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                      Class Teacher
                    </span>
                  ) : null}
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Students</span>
                    <span className="font-semibold text-slate-900">{item.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Subject{item.subjectNames.length > 1 ? "s" : ""}</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {item.subjectNames.length ? item.subjectNames.join(", ") : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Weekly Periods</span>
                    <span className="font-semibold text-slate-900">{item.weeklyPeriods} Periods</span>
                  </div>
                </div>

                <Link
                  href={`/teacher/classes/${item.id}`}
                  className="block w-full rounded-lg border border-slate-900 text-slate-900 hover:bg-slate-50 py-2 px-4 text-center font-medium text-sm transition-colors whitespace-nowrap"
                >
                  View Class Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No assigned classes found for the current term.</p>
        )}
      </div>
    </div>
  );
};

export default Page;
