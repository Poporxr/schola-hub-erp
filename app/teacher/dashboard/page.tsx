import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Clock,
  Info,
  Megaphone,
  UserCheck,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  formatTime,
  greetingForHour,
  relativeDaysLabel,
  todayDateInputValue,
  weekdayKeyFromDate,
} from "@/lib/settings";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Sign in to view dashboard.
      </div>
    );
  }

  const [teacher, currentTerm] = await Promise.all([
    prisma.teacher.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      select: {
        id: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, sessionId: true, name: true },
    }),
  ]);

  if (!teacher) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Teacher profile not found.
      </div>
    );
  }
  if (!currentTerm) {
    return (
      <div className="p-6 text-sm text-slate-600">
        No current term configured.
      </div>
    );
  }

  const today = new Date();
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(today);

  const todayInput = todayDateInputValue();
  const todayDate = new Date(`${todayInput}T00:00:00.000Z`);
  const weekdayKey = weekdayKeyFromDate(today);

  const [
    subjectTeachers,
    classTeachers,
    attendanceRows,
    timetableEntriesToday,
    notices,
    totalTimetableEntries,
    noticeCount,
  ] = await Promise.all([
    prisma.subjectTeacher.findMany({
      where: {
        teacherId: teacher.id,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      select: {
        id: true,
        classId: true,
        subjectId: true,
        subject: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
      },
    }),
    prisma.classTeacher.findMany({
      where: {
        teacherId: teacher.id,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      select: {
        id: true,
        classId: true,
        class: { select: { id: true, name: true } },
      },
    }),
    prisma.attendance.findMany({
      where: {
        teacherId: teacher.id,
        date: todayDate,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      select: {
        classId: true,
        subjectId: true,
      },
    }),
    weekdayKey
      ? prisma.timetableEntry.findMany({
          where: {
            teacherId: teacher.id,
            sessionId: currentTerm.sessionId,
            termId: currentTerm.id,
            weekday: weekdayKey,
            status: "ACTIVE",
          },
          include: {
            class: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
            venue: { select: { id: true, name: true } },
          },
          orderBy: [{ startTime: "asc" }],
        })
      : Promise.resolve([]),
    prisma.notice.findMany({
      where: {
        isPublished: true,
        sessionId: currentTerm.sessionId,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 2,
      select: {
        id: true,
        title: true,
        message: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.timetableEntry.count({
      where: {
        teacherId: teacher.id,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
        status: "ACTIVE",
      },
    }),
    prisma.notice.count({
      where: {
        isPublished: true,
        sessionId: currentTerm.sessionId,
      },
    }),
  ]);

  const classIds = Array.from(
    new Set([
      ...classTeachers.map((row) => row.classId),
      ...subjectTeachers.map((row) => row.classId),
    ])
  );

  const subjectIds = Array.from(
    new Set(subjectTeachers.map((row) => row.subjectId))
  );

  const totalClasses = classIds.length;
  const totalSubjects = subjectIds.length;

  const totalStudents = classIds.length
    ? await prisma.studentClassHistory.count({
        where: {
          classId: { in: classIds },
          sessionId: currentTerm.sessionId,
          termId: currentTerm.id,
        },
      })
    : 0;

  const attendanceKeys = new Set(
    attendanceRows
      .filter((row) => row.subjectId)
      .map((row) => `${row.classId}-${row.subjectId}`)
  );

  const pendingAttendance = timetableEntriesToday.filter(
    (entry) => !attendanceKeys.has(`${entry.classId}-${entry.subjectId}`)
  );

  const pendingTasks = pendingAttendance.slice(0, 3).map((entry) => ({
    id: entry.id,
    label: "Attendance",
    tone: "orange",
    title: `Mark attendance for ${entry.class.name}`,
    meta: `${entry.subject.name} - ${entry.venue.name}`,
    href: "/teacher/attendance",
  }));

  const greeting = greetingForHour(today.getHours());
  const teacherName =
    `${teacher.user.firstName} ${teacher.user.lastName}`.trim() || "Teacher";
  const classesToday = timetableEntriesToday.length;
  const attendanceMarked = attendanceRows.length;

  const timetableCardStyles = [
    {
      container: "bg-slate-50 border-slate-400",
      title: "text-slate-900",
      meta: "text-slate-600",
    },
    {
      container: "bg-indigo-50 border-indigo-400",
      title: "text-indigo-900",
      meta: "text-indigo-700",
    },
    {
      container: "bg-emerald-50 border-emerald-400",
      title: "text-emerald-900",
      meta: "text-emerald-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero / overview card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Teacher Overview
          </p>
          <h1 className="text-2xl font-bold mt-2  text-white/80">
            {greeting}, {teacherName}!
          </h1>
          <p className="text-white/70 max-w-2xl mt-2">
            You have{" "}
            <span className="text-white font-semibold">{classesToday}</span>{" "}
            classes today and
            <span className="text-white font-semibold">
              {" "}
              {pendingAttendance.length}
            </span>{" "}
            attendance records pending.
          </p>
        </div>
        <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Stats grid */}
      <KpiGrid>
        <KpiCard
          label="Total Classes"
          value={totalClasses}
          icon={<Users className="h-3.5 w-3.5 text-slate-400 sm:h-4 sm:w-4" />}
          subtext="Assigned this term"
        />
        <KpiCard
          label="Subjects Taught"
          value={totalSubjects}
          icon={<BookOpen className="h-3.5 w-3.5 text-emerald-500 sm:h-4 sm:w-4" />}
          subtext="Active allocations"
        />
        <KpiCard
          label="Students Covered"
          value={totalStudents}
          icon={<Users className="h-3.5 w-3.5 text-indigo-400 sm:h-4 sm:w-4" />}
          subtext="Across assigned classes"
        />
        <KpiCard
          label="Classes Today"
          value={classesToday}
          tone="dark"
          icon={<CalendarDays className="h-3.5 w-3.5 text-white/70 sm:h-4 sm:w-4" />}
          subtext={todayLabel}
        />
        <KpiCard
          label="Attendance Marked"
          value={attendanceMarked}
          icon={<UserCheck className="h-3.5 w-3.5 text-emerald-500 sm:h-4 sm:w-4" />}
          subtext="Today&apos;s classes"
        />
        <KpiCard
          label="Pending Attendance"
          value={pendingAttendance.length}
          icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500 sm:h-4 sm:w-4" />}
          subtext="Needs submission"
        />
        <KpiCard
          label="Term Timetable"
          value={totalTimetableEntries}
          icon={<Clock className="h-3.5 w-3.5 text-slate-400 sm:h-4 sm:w-4" />}
          subtext="Scheduled periods"
        />
        <KpiCard
          label="Announcements"
          value={noticeCount}
          icon={<Megaphone className="h-3.5 w-3.5 text-indigo-400 sm:h-4 sm:w-4" />}
          subtext="This term"
        />
      </KpiGrid>

      {/* Timetable + tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Timetable */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Today&apos;s Timetable
              </h3>
              <p className="text-xs text-slate-500">{todayLabel}</p>
            </div>
            <span className="text-xs text-slate-500">
              {classesToday} periods
            </span>
          </div>

          {timetableEntriesToday.length ? (
            <div className="space-y-4">
              {timetableEntriesToday.map((entry, index) => {
                const styleIndex = index % timetableCardStyles.length;
                const styles = timetableCardStyles[styleIndex];

                return (
                  <div
                    key={entry.id}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-20 text-sm font-semibold text-slate-500 pt-1">
                      {formatTime(entry.startTime)}
                    </div>
                    <div
                      className={`flex-1 p-4 rounded-lg border-l-4 ${styles.container}`}
                    >
                      <h4 className={`font-bold ${styles.title}`}>
                        {entry.subject.name}
                      </h4>
                      <p className={`text-sm mt-1 ${styles.meta}`}>
                        {entry.class.name} · {entry.venue.name}
                      </p>
                      <Link
                        href="/teacher/attendance"
                        className="mt-2 inline-block text-xs font-medium text-slate-900 hover:underline"
                      >
                        Mark Attendance
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No scheduled classes for today.
            </p>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            Pending Tasks
          </h3>
          {pendingTasks.length ? (
            <div className="space-y-4">
              {pendingTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-semibold text-amber-700 uppercase">
                      {index === 0 ? "Urgent" : "Due Soon"}
                    </span>
                    {index === 0 ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-sm text-slate-800 font-medium">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500">{task.meta}</p>
                  <Link
                    href={task.href}
                    className="mt-2 inline-block text-xs text-amber-700 font-medium hover:underline"
                  >
                    Complete Now
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-slate-300">
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs font-semibold text-slate-600 uppercase">
                  All Clear
                </span>
                <Info className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-sm text-slate-800 font-medium">
                No pending tasks right now.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">
          Recent Announcements
        </h3>
        {notices.length ? (
          <div className="space-y-4">
            {notices.map((notice, index) => (
              <div key={notice.id} className="flex gap-4">
                <div
                  className={`p-2 rounded-lg h-fit ${
                    index % 2 === 0
                      ? "bg-indigo-50 text-slate-900"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  {index % 2 === 0 ? (
                    <Megaphone className="w-5 h-5" />
                  ) : (
                    <CalendarDays className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-slate-900">
                      {notice.title ?? "Announcement"}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {relativeDaysLabel(
                        notice.publishedAt ?? notice.createdAt
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{notice.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No announcements yet.</p>
        )}
      </div>
    </div>
  );
};

export default Page;
