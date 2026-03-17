import BackButton from "@/components/BackButton";
import FormButton from "@/components/buttons/FormButton";
import ClassDetailActions from "@/components/buttons/ClassDetailActions";
import ClassSubjects from "@/components/ClassSubjects";
import ClassStudent from "@/components/List/ClassStudent";
import WeeklyTimetable from "@/components/WeeklyTimetable";
import { Award, BookOpen, ClipboardList, School, TrendingUp, UserCheck, Users } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function Page({
  params,
}: {
  params?: { classId?: string } | Promise<{ classId?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const resolvedParams = await params;
  const classId = resolvedParams?.classId;
  if (!classId) {
    notFound();
  }

  const teacher = await prisma.teacher.findFirst({
    where: { OR: [{ id: userId }, { userId }] },
    select: { id: true },
  });
  if (!teacher) {
    notFound();
  }

  const [isClassTeacher, isSubjectTeacher] = await Promise.all([
    prisma.classTeacher.count({ where: { teacherId: teacher.id, classId } }),
    prisma.subjectTeacher.count({ where: { teacherId: teacher.id, classId } }),
  ]);
  if (!isClassTeacher && !isSubjectTeacher) {
    notFound();
  }

  const classInfo = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      levelId: true,
      capacity: true,
      promotionTrack: true,
      promotionRank: true,
      isTerminal: true,
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
  });
  if (!classInfo) {
    notFound();
  }

  const classOptions = [{ id: classInfo.id, name: classInfo.name }];

  const levels = await prisma.level.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true, type: true },
  });

  const classMeta = {
    levels,
  };

  const classFormData = {
    id: classInfo.id,
    name: classInfo.name,
    levelId: classInfo.levelId,
    maxStudents: classInfo.capacity,
    promotionTrack: classInfo.promotionTrack,
    promotionRank: classInfo.promotionRank,
    isTerminal: classInfo.isTerminal,
  };

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true, name: true },
  });

  const currentTerm = currentSession
    ? await prisma.term.findFirst({
        where: { sessionId: currentSession.id, isCurrent: true },
        select: { id: true, name: true },
      })
    : null;

  const [students, classSubjects, timetableEntries] = await Promise.all([
    prisma.student.findMany({
      where: currentSession && currentTerm
        ? { classHistories: { some: { classId, sessionId: currentSession.id, termId: currentTerm.id } } }
        : { classHistories: { some: { classId } } },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        admissionNumber: true,
        gender: true,
        user: { select: { firstName: true, lastName: true, email: true, phone: true, image: true } },
      },
    }),
    prisma.classSubject.findMany({
      where: { classId },
      select: {
        subject: { select: { id: true, name: true } },
      },
    }),
    prisma.timetableEntry.findMany({
      where: currentSession && currentTerm
        ? { classId, sessionId: currentSession.id, termId: currentTerm.id }
        : { classId },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      select: {
        weekday: true,
        startTime: true,
        endTime: true,
        subject: { select: { name: true } },
        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
    }),
  ]);

  const subjectTeachers = await prisma.subjectTeacher.findMany({
    where: { classId },
    select: {
      subjectId: true,
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  const teacherNamesBySubject = new Map<string, string[]>();
  for (const row of subjectTeachers) {
    const name = `${row.teacher.user.firstName} ${row.teacher.user.lastName}`;
    const list = teacherNamesBySubject.get(row.subjectId) ?? [];
    list.push(name);
    teacherNamesBySubject.set(row.subjectId, list);
  }

  const subjects = classSubjects.map((row) => ({
    id: row.subject.id,
    name: row.subject.name,
    teacherNames: teacherNamesBySubject.get(row.subject.id) ?? [],
  }));

  const timetable = timetableEntries.map((entry) => ({
    weekday: entry.weekday,
    startTime: entry.startTime,
    endTime: entry.endTime,
    subject: entry.subject.name,
    teacher: `${entry.teacher.user.firstName} ${entry.teacher.user.lastName}`,
  }));

  const classHistories = currentSession && currentTerm
    ? await prisma.studentClassHistory.findMany({
        where: { classId, sessionId: currentSession.id, termId: currentTerm.id },
        select: { id: true, studentId: true },
      })
    : [];

  const resultRows = classHistories.length
    ? await prisma.result.findMany({
        where: { classHistoryId: { in: classHistories.map((row) => row.id) } },
        select: { studentId: true, totalScore: true, createdAt: true },
      })
    : [];

  const totalScore = resultRows.reduce((sum, row) => sum + row.totalScore, 0);
  const averageScore = resultRows.length ? totalScore / resultRows.length : null;

  const totalsByStudent = new Map<string, { sum: number; count: number }>();
  for (const row of resultRows) {
    const entry = totalsByStudent.get(row.studentId) ?? { sum: 0, count: 0 };
    entry.sum += row.totalScore;
    entry.count += 1;
    totalsByStudent.set(row.studentId, entry);
  }

  let topStudentId: string | null = null;
  let topStudentAverage: number | null = null;
  for (const [studentId, entry] of totalsByStudent.entries()) {
    const avg = entry.count ? entry.sum / entry.count : 0;
    if (topStudentAverage === null || avg > topStudentAverage) {
      topStudentAverage = avg;
      topStudentId = studentId;
    }
  }

  const topStudent = topStudentId
    ? students.find((student) => student.id === topStudentId)
    : null;
  const topStudentName = topStudent
    ? `${topStudent.user.firstName} ${topStudent.user.lastName}`
    : "N/A";

  const start30Days = new Date();
  start30Days.setDate(start30Days.getDate() - 30);
  const recentExamsCount = resultRows.filter((row) => row.createdAt >= start30Days).length;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [attendanceTotal, attendancePresent] = currentSession && currentTerm
    ? await Promise.all([
        prisma.attendance.count({
          where: { classId, sessionId: currentSession.id, termId: currentTerm.id, date: { gte: startOfToday, lt: startOfTomorrow } },
        }),
        prisma.attendance.count({
          where: {
            classId,
            sessionId: currentSession.id,
            termId: currentTerm.id,
            status: "PRESENT",
            date: { gte: startOfToday, lt: startOfTomorrow },
          },
        }),
      ])
    : [0, 0];

  const attendanceRate = attendanceTotal
    ? (attendancePresent / attendanceTotal) * 100
    : 0;

  return (
    <div className="space-y-6">
      <BackButton />

      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Class Overview
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {classInfo.name}
                  </h1>
                  <p className="text-sm text-white/70">
                    {classInfo.teacher
                      ? `Form teacher: ${classInfo.teacher.user.firstName} ${classInfo.teacher.user.lastName}`
                      : "Form teacher not assigned"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-white/70">
                <span>Session: {currentSession?.name ?? "—"}</span>
                <span>Term: {currentTerm?.name ?? "—"}</span>
                <span>Weekly periods: {timetableEntries.length}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <ClassDetailActions classId={classId} classOptions={classOptions} />
              <FormButton action="edit" type="class" data={classFormData} meta={classMeta} />
            </div>
          </div>
        </div>
        <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Total Students
            </p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {students.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Enrolled this term
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Subjects
            </p>
            <BookOpen className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {subjects.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">Active subjects</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Average Score
            </p>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {averageScore !== null ? `${averageScore.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Based on recorded results
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-white/70">
              Attendance Rate
            </p>
            <UserCheck className="h-4 w-4 text-white/70" />
          </div>
          <p className="mt-3 text-3xl font-bold">
            {attendanceRate ? `${attendanceRate.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-2 text-xs text-white/70">
            {attendanceTotal
              ? `${attendancePresent}/${attendanceTotal} present today`
              : "No attendance logged today"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Performance Snapshot
              </h3>
              <p className="text-xs text-slate-500">
                Updated with current term data
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {recentExamsCount} results in last 30 days
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Top Student
                </p>
                <Award className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={topStudent?.user.image ?? undefined}
                  alt={topStudentName}
                  size={44}
                  className="w-11 h-11 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {topStudentName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {topStudentAverage !== null
                      ? `${topStudentAverage.toFixed(1)}% average`
                      : "No results yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Recent Exams
                </p>
                <ClipboardList className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {recentExamsCount}
              </p>
              <p className="text-xs text-slate-500">
                Results logged in the last 30 days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Term Details
            </h3>
            <p className="text-xs text-slate-500">
              Academic session snapshot
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Current session</span>
              <span className="font-semibold text-slate-900">
                {currentSession?.name ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Current term</span>
              <span className="font-semibold text-slate-900">
                {currentTerm?.name ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Weekly periods</span>
              <span className="font-semibold text-slate-900">
                {timetableEntries.length}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Students</span>
              <span className="font-semibold text-slate-900">
                {students.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subjects</span>
              <span className="font-semibold text-slate-900">
                {subjects.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ClassStudent students={students} />
      <ClassSubjects subjects={subjects} />
      <WeeklyTimetable entries={timetable} />
    </div>
  );
}
