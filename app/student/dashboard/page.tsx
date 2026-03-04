import ScheduleAndNotices from "@/components/student/ScheduleAndNotices";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  Award,
  Bell,
  BookOpen,
  CalendarCheck,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { AttendanceStatus } from "@/generated/prisma/client";
import AttendanceRateCards from "@/components/AttendanceRateCards";
import { greetingForHour, relativeDaysLabel } from "@/lib/settings";

const formatPosition = (position: number | null) => {
  if (!position) return "-";
  const suffix =
    position % 10 === 1 && position % 100 !== 11
      ? "st"
      : position % 10 === 2 && position % 100 !== 12
        ? "nd"
        : position % 10 === 3 && position % 100 !== 13
          ? "rd"
          : "th";
  return `${position}${suffix}`;
};

const Page = async () => {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6 text-sm text-slate-600">Sign in to view your dashboard.</div>;
  }

  const currentTerm = await prisma.term.findFirst({
    where: { isCurrent: true, session: { isCurrent: true } },
    select: { id: true, sessionId: true, name: true, session: { select: { name: true } } },
  });
  if (!currentTerm) {
    return <div className="p-6 text-sm text-slate-600">No current term is configured.</div>;
  }

  const studentData = await prisma.student.findFirst({
    where: { OR: [{ id: userId }, { userId }] },
    select: {
      id: true,
      admissionNumber: true,
      user: { select: { firstName: true, lastName: true } },
      classHistories: {
        where: { sessionId: currentTerm.sessionId, termId: currentTerm.id },
        take: 1,
        select: {
          classId: true,
          id: true,
          class: {
            select: {
              id: true,
              name: true,
              _count: {
                select: {
                  subjects: true,
                },
              },
              subjects: {
                select: {
                  subject: { select: { id: true, name: true, code: true } },
                },
              },
              timetableEntries: {
                where: {
                  sessionId: currentTerm.sessionId,
                  termId: currentTerm.id,
                  status: "ACTIVE",
                },
                orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
                select: {
                  id: true,
                  weekday: true,
                  startTime: true,
                  endTime: true,
                  subject: { select: { id: true, name: true } },
                  teacher: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
                  venue: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!studentData) {
    return <div className="p-6 text-sm text-slate-600">No student profile is linked to this account.</div>;
  }

  const currentClassHistory = studentData.classHistories[0];
  const classId = currentClassHistory?.classId ?? null;

  const [present, absent, late, excused, notices, results, classHistories] = await Promise.all([
    prisma.attendance.count({
      where: {
        studentId: studentData.id,
        status: AttendanceStatus.PRESENT,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
    }),
    prisma.attendance.count({
      where: {
        studentId: studentData.id,
        status: AttendanceStatus.ABSENT,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
    }),
    prisma.attendance.count({
      where: {
        studentId: studentData.id,
        status: AttendanceStatus.LATE,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
    }),
    prisma.attendance.count({
      where: {
        studentId: studentData.id,
        status: AttendanceStatus.EXCUSED,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
    }),
    prisma.notice.findMany({
      where: {
        isPublished: true,
        OR: [
          { targetAudience: "ALL" },
          { targetAudience: "STUDENT" },
          { targetAudience: "STUDENTS" },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        from: true,
        message: true,
        priority: true,
        publishedAt: true,
        createdAt: true,
      },
      take: 8,
    }),
    currentClassHistory
      ? prisma.result.findMany({
          where: { studentId: studentData.id, classHistoryId: currentClassHistory.id },
          orderBy: [{ updatedAt: "desc" }],
          select: {
            id: true,
            totalScore: true,
            createdAt: true,
            subject: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
    classId
      ? prisma.studentClassHistory.findMany({
          where: { classId, sessionId: currentTerm.sessionId, termId: currentTerm.id },
          select: { id: true, studentId: true },
        })
      : Promise.resolve([]),
  ]);

  const totalAttendance = present + absent + late + excused;
  const attendanceRate = totalAttendance
    ? Number((((present + late) / totalAttendance) * 100).toFixed(1))
    : 0;

  const subjectCount = currentClassHistory?.class._count.subjects ?? 0;
  const schedule = currentClassHistory?.class.timetableEntries ?? [];

  const totalScore = results.reduce((sum, row) => sum + (row.totalScore ?? 0), 0);
  const averageScore = results.length ? Number((totalScore / results.length).toFixed(1)) : 0;

  const totalsByStudent = classHistories.length
    ? await prisma.result.findMany({
        where: { classHistoryId: { in: classHistories.map((row) => row.id) } },
        select: { studentId: true, totalScore: true },
      })
    : [];

  const totalsMap = totalsByStudent.reduce((map, row) => {
    map.set(row.studentId, (map.get(row.studentId) ?? 0) + row.totalScore);
    return map;
  }, new Map<string, number>());

  const sortedTotals = Array.from(totalsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([studentId]) => studentId);
  const classPosition = sortedTotals.length ? sortedTotals.indexOf(studentData.id) + 1 : null;
  const classSize = classHistories.length || null;

  const weekdayByIndex = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
  const todayWeekday = weekdayByIndex[new Date().getDay()];
  const todaySchedule = schedule.filter((item) => item.weekday === todayWeekday);

  const activityItems = [
    ...notices.map((notice) => ({
      id: notice.id,
      icon: Bell,
      color: "amber" as const,
      title: notice.from ?? "School notice",
      detail: notice.message,
      time: relativeDaysLabel(notice.publishedAt ?? notice.createdAt),
      createdAt: notice.publishedAt ?? notice.createdAt,
    })),
    ...results.slice(0, 4).map((result) => ({
      id: result.id,
      icon: Award,
      color: "indigo" as const,
      title: "Result updated",
      detail: `${result.subject.name} · ${Math.round(result.totalScore ?? 0)}%`,
      time: relativeDaysLabel(result.createdAt),
      createdAt: result.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  const now = new Date();

  return (
    <div id="dashboard" className="space-y-6">
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Student Overview</p>
          <h1 className="text-2xl font-bold mt-2 text-white/80">{`${greetingForHour(now.getHours())}, ${studentData.user.firstName}.`}</h1>
          <p className="text-white/70 max-w-2xl mt-2">
            Current term: <span className="text-white font-semibold">{currentTerm.name ?? "N/A"}</span> - Session
            <span className="text-white font-semibold"> {currentTerm.session?.name ?? "N/A"}</span>
          </p>
        </div>
        <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Attendance Rate</p>
            <CalendarCheck className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{attendanceRate.toFixed(1)}%</p>
          <p className="mt-2 text-xs text-slate-500">This term</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Average Score</p>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{averageScore.toFixed(1)}%</p>
          <p className="mt-2 text-xs text-slate-500">Across results</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Class Position</p>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{formatPosition(classPosition)}</p>
          <p className="mt-2 text-xs text-slate-500">{classSize ? `Out of ${classSize} students` : "Class not set"}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Subjects</p>
            <BookOpen className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{subjectCount}</p>
          <p className="mt-2 text-xs text-slate-500">Active subjects</p>
        </div>
      </div>


      <ScheduleAndNotices schedule={schedule} notices={notices} />
    </div>
  );
};
export default Page;
