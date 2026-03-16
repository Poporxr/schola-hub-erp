import BackButton from "@/components/BackButton";
import FormButton from "@/components/buttons/FormButton";
import ClassDetailActions from "@/components/buttons/ClassDetailActions";
import ClassSubjects from "@/components/ClassSubjects";
import ClassStudent from "@/components/List/ClassStudent";
import WeeklyTimetable from "@/components/WeeklyTimetable";
import { ArrowUp, Award, BookOpen, Calendar, CalendarCheck, ClipboardList, School, TrendingUp, Trophy, UserCheck, Users } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params?: { classId?: string } | Promise<{ classId?: string }>;
}) {
  const resolvedParams = await params;
  const classId = resolvedParams?.classId;
  if (!classId) {
    notFound();
  }

  const classInfo = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      level: { select: { name: true } },
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
  });
  if (!classInfo) {
    notFound();
  }

  const classOptions = [{ id: classInfo.id, name: classInfo.name }];

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

  const [students, classSubjects, timetableEntries, classHistories] = await Promise.all([
    prisma.student.findMany({
      where: currentSession && currentTerm
        ? { classHistories: { some: { classId, sessionId: currentSession.id, termId: currentTerm.id } } }
        : { classHistories: { some: { classId } } },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        admissionNumber: true,
        gender: true,
        address: true,
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
    currentSession && currentTerm
      ? prisma.studentClassHistory.findMany({
          where: { classId, sessionId: currentSession.id, termId: currentTerm.id },
          select: {
            id: true,
            studentId: true,
            student: { select: { user: { select: { firstName: true, lastName: true } } } },
          },
        })
      : Promise.resolve([]),
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

  const classHistoryIds = classHistories.map((history) => history.id);
  const studentNameById = new Map(classHistories.map((history) => [
    history.studentId,
    `${history.student.user.firstName} ${history.student.user.lastName}`.trim(),
  ]));

  const [results, attendanceTotals, attendancePresent] = await Promise.all([
    classHistoryIds.length
      ? prisma.result.findMany({
          where: { classHistoryId: { in: classHistoryIds } },
          select: { studentId: true, totalScore: true, createdAt: true },
        })
      : Promise.resolve([]),
    currentSession && currentTerm
      ? prisma.attendance.count({
          where: { classId, sessionId: currentSession.id, termId: currentTerm.id },
        })
      : Promise.resolve(0),
    currentSession && currentTerm
      ? prisma.attendance.count({
          where: { classId, sessionId: currentSession.id, termId: currentTerm.id, status: "PRESENT" },
        })
      : Promise.resolve(0),
  ]);

  const avgScore = results.length
    ? results.reduce((sum, row) => sum + row.totalScore, 0) / results.length
    : 0;

  const recentExamCount = results.filter((row) => {
    const limit = new Date();
    limit.setDate(limit.getDate() - 30);
    return row.createdAt >= limit;
  }).length;

  const studentScores = new Map<string, { sum: number; count: number }>();
  results.forEach((row) => {
    const entry = studentScores.get(row.studentId) ?? { sum: 0, count: 0 };
    entry.sum += row.totalScore;
    entry.count += 1;
    studentScores.set(row.studentId, entry);
  });

  const topStudentEntry = Array.from(studentScores.entries())
    .map(([studentId, entry]) => ({
      studentId,
      avg: entry.count ? entry.sum / entry.count : 0,
    }))
    .sort((a, b) => b.avg - a.avg)[0];

  const topStudentName = topStudentEntry ? studentNameById.get(topStudentEntry.studentId) : "—";
  const topStudentScore = topStudentEntry ? `${topStudentEntry.avg.toFixed(1)}%` : "—";

  const attendanceRate = attendanceTotals ? (attendancePresent / attendanceTotals) * 100 : 0;

  return (
    <>
      <BackButton />
      <main className="space-y-8 mt-5">
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white/50">{classInfo.name}</h1>
                <p className="text-white/70 text-sm">{classInfo.level.name}</p>
                <p className="text-white/60 text-xs mt-1">Academic Year {currentSession?.name ?? "—"}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <ClassDetailActions classId={classId} classOptions={classOptions} />
              <FormButton action="edit" type="class" />
            </div>
          </div>
          <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Students</p>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{students.length}</p>
            <p className="mt-2 text-xs text-slate-500">Linked to this class</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Subjects</p>
              <BookOpen className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{subjects.length}</p>
            <p className="mt-2 text-xs text-slate-500">Assigned this term</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50 via-white to-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Attendance Rate</p>
              <UserCheck className="w-4 h-4 text-indigo-500" />
            </div>
                  <p className="mt-3 text-3xl font-bold">{attendanceRate.toFixed(1)}%</p>
            <p className="mt-2 text-xs text-slate-500">{attendancePresent}/{attendanceTotals} present</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-white/70">Current Term</p>
              <CalendarCheck className="h-4 w-4 text-white/70" />
            </div>
            <p className="mt-3 text-3xl font-bold">{currentTerm?.name ?? "—"}</p>
            <p className="mt-2 text-xs text-white/70">{currentSession?.name ?? "No session"}</p>
          </div>
        </div>

        <ClassStudent students={students} />
        <ClassSubjects subjects={subjects} />
        <WeeklyTimetable entries={timetable} />
      </main>
    </>
  )
}
