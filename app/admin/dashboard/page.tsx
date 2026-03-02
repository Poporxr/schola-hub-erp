import AdminCharts from "@/components/AdminCharts";
import { prisma } from "@/lib/prisma";
import { greetingForHour, relativeDaysLabel } from "@/lib/settings";
import {
  Users,
  Presentation,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  UserPlus,
  FileText,
  Award,
  Building,
  GraduationCap,
  NotebookText,
  Bell,
} from "lucide-react";

export const revalidate = 60;
type NoticePriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

const percentChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const formatDelta = (value: number) => {
  const rounded = Math.abs(value).toFixed(1);
  return `${value >= 0 ? "+" : "-"}${rounded}%`;
};

export default async function Home() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const start30Days = new Date(now);
  start30Days.setDate(start30Days.getDate() - 30);
  const start60Days = new Date(now);
  start60Days.setDate(start60Days.getDate() - 60);
  const startOfSixMonths = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const currentTerm = await prisma.term.findFirst({
    where: { isCurrent: true, session: { isCurrent: true } },
    select: { id: true, sessionId: true, name: true, session: { select: { name: true } } },
  });

  const attendanceBaseWhere = currentTerm
    ? { sessionId: currentTerm.sessionId, termId: currentTerm.id }
    : {};

  const [
    totalStudents,
    studentsLast30,
    studentsPrev30,
    totalTeachers,
    teachersLast30,
    teachersPrev30,
    totalParents,
    totalClasses,
    totalSubjects,
    totalNotices,
    attendanceTodayTotal,
    attendanceTodayPresent,
    attendanceYesterdayTotal,
    attendanceYesterdayPresent,
    totalResultsCurrentTerm,
    notices,
    latestStudent,
    attendanceRows,
    resultRows,
    recentResults,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { createdAt: { gte: start30Days } } }),
    prisma.student.count({ where: { createdAt: { gte: start60Days, lt: start30Days } } }),
    prisma.teacher.count(),
    prisma.teacher.count({ where: { createdAt: { gte: start30Days } } }),
    prisma.teacher.count({ where: { createdAt: { gte: start60Days, lt: start30Days } } }),
    prisma.parent.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.notice.count({ where: { isPublished: true } }),
    prisma.attendance.count({
      where: { ...attendanceBaseWhere, date: { gte: startOfToday, lt: startOfTomorrow } },
    }),
    prisma.attendance.count({
      where: {
        ...attendanceBaseWhere,
        status: "PRESENT",
        date: { gte: startOfToday, lt: startOfTomorrow },
      },
    }),
    prisma.attendance.count({
      where: { ...attendanceBaseWhere, date: { gte: startOfYesterday, lt: startOfToday } },
    }),
    prisma.attendance.count({
      where: {
        ...attendanceBaseWhere,
        status: "PRESENT",
        date: { gte: startOfYesterday, lt: startOfToday },
      },
    }),
    currentTerm
      ? prisma.result.count({
        where: { classHistory: { termId: currentTerm.id, sessionId: currentTerm.sessionId } },
      })
      : Promise.resolve(0),
    prisma.notice.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { id: true, title: true, from: true, priority: true, publishedAt: true, createdAt: true },
      take: 6,
    }),
    prisma.student.findFirst({
      orderBy: [{ createdAt: "desc" }],
      select: { id: true, createdAt: true, user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.attendance.findMany({
      where: { ...attendanceBaseWhere, date: { gte: startOfSixMonths } },
      select: { date: true, status: true },
    }),
    currentTerm
      ? prisma.result.findMany({
        where: { classHistory: { termId: currentTerm.id, sessionId: currentTerm.sessionId } },
        select: { subjectId: true, totalScore: true },
      })
      : Promise.resolve([]),
    currentTerm
      ? prisma.result.findMany({
        where: { classHistory: { termId: currentTerm.id, sessionId: currentTerm.sessionId } },
        orderBy: [{ createdAt: "desc" }],
        take: 4,
        select: {
          id: true,
          totalScore: true,
          createdAt: true,
          student: { select: { user: { select: { firstName: true, lastName: true } } } },
          subject: { select: { name: true } },
        },
      })
      : Promise.resolve([]),
  ]);

  const attendanceRateToday = attendanceTodayTotal
    ? (attendanceTodayPresent / attendanceTodayTotal) * 100
    : 0;
  const attendanceRateYesterday = attendanceYesterdayTotal
    ? (attendanceYesterdayPresent / attendanceYesterdayTotal) * 100
    : 0;
  const attendanceDelta = percentChange(attendanceRateToday, attendanceRateYesterday);

  const studentDelta = percentChange(studentsLast30, studentsPrev30);
  const teacherDelta = percentChange(teachersLast30, teachersPrev30);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: date.toLocaleString("en-US", { month: "short" }),
    };
  });

  const attendanceMap = new Map<string, { total: number; present: number }>();
  for (const row of attendanceRows) {
    const key = `${row.date.getFullYear()}-${String(row.date.getMonth() + 1).padStart(2, "0")}`;
    const entry = attendanceMap.get(key) ?? { total: 0, present: 0 };
    entry.total += 1;
    if (row.status === "PRESENT") entry.present += 1;
    attendanceMap.set(key, entry);
  }

  const attendanceData = months.map((month) => {
    const entry = attendanceMap.get(month.key);
    const rate = entry && entry.total ? (entry.present / entry.total) * 100 : 0;
    return {
      month: month.label,
      rate: Number(rate.toFixed(1)),
      present: entry?.present ?? 0,
      total: entry?.total ?? 0,
    };
  });

  const subjectStats = new Map<string, { sum: number; count: number }>();
  for (const row of resultRows) {
    const entry = subjectStats.get(row.subjectId) ?? { sum: 0, count: 0 };
    entry.sum += row.totalScore;
    entry.count += 1;
    subjectStats.set(row.subjectId, entry);
  }

  const subjectIds = Array.from(subjectStats.keys());
  const subjects = subjectIds.length
    ? await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true },
    })
    : [];
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const performanceData = subjectIds
    .map((id) => {
      const entry = subjectStats.get(id)!;
      const avg = entry.count ? entry.sum / entry.count : 0;
      return { subject: subjectMap.get(id) ?? "Subject", average: Number(avg.toFixed(1)) };
    })
    .sort((a, b) => b.average - a.average)
    .slice(0, 6);

  const priorityTone: Record<NoticePriority, "red" | "amber" | "slate"> = {
    URGENT: "red",
    HIGH: "amber",
    MEDIUM: "slate",
    LOW: "slate",
  };
  const priorityWeight: Record<NoticePriority, number> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const activities = [
    ...notices.map((notice) => ({
      id: notice.id,
      icon: FileText,
      color: "blue" as const,
      title: notice.title ?? "New notice published",
      detail: notice.from,
      time: relativeDaysLabel(notice.publishedAt ?? notice.createdAt),
      createdAt: notice.publishedAt ?? notice.createdAt,
      badge: { label: notice.priority, tone: priorityTone[notice.priority] },
      weight: priorityWeight[notice.priority],
    })),
    latestStudent
      ? {
        id: latestStudent.id,
        icon: UserPlus,
        color: "purple",
        title: "New student admission",
        detail: `${latestStudent.user.firstName} ${latestStudent.user.lastName}`,
        time: relativeDaysLabel(latestStudent.createdAt),
        createdAt: latestStudent.createdAt,
        weight: 0,
      }
      : null,
    ...recentResults.map((result) => ({
      id: result.id,
      icon: Award,
      color: "purple" as const,
      title: "Result updated",
      detail: `${result.student.user.firstName} ${result.student.user.lastName} - ${result.subject.name} (${Math.round(
        result.totalScore
      )}%)`,
      time: relativeDaysLabel(result.createdAt),
      createdAt: result.createdAt,
      weight: 0,
    })),
  ]
    .filter(Boolean)
    .sort((a, b) => {
      if (b!.weight !== a!.weight) return b!.weight - a!.weight;
      return b!.createdAt.getTime() - a!.createdAt.getTime();
    })
    .slice(0, 6) as Array<{
      id: string;
      icon: typeof FileText;
      color: "blue" | "green" | "purple";
      title: string;
      detail: string;
      time: string;
      badge?: { label: string; tone: "red" | "amber" | "slate" };
      weight: number;
    }>;

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Admin Overview</p>
          <h1 className="text-2xl font-bold mt-2">{`${greetingForHour(now.getHours())}, Admin.`}</h1>
          <p className="text-white/70 max-w-2xl mt-2">
            Current term: <span className="text-white font-semibold">{currentTerm?.name ?? "N/A"}</span> � Session
            <span className="text-white font-semibold"> {currentTerm?.session?.name ?? "N/A"}</span>
          </p>
        </div>
        <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Students</p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalStudents}</p>
          <div className="mt-3 flex items-center text-xs">
            <span className={`font-semibold flex items-center gap-1 ${studentDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {studentDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {formatDelta(studentDelta)}
            </span>
            <span className="text-slate-400 ml-2">last 30 days</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Teachers</p>
            <Presentation className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalTeachers}</p>
          <div className="mt-3 flex items-center text-xs">
            <span className={`font-semibold flex items-center gap-1 ${teacherDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {teacherDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {formatDelta(teacherDelta)}
            </span>
            <span className="text-slate-400 ml-2">last 30 days</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Attendance Today</p>
            <CalendarCheck className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{attendanceRateToday.toFixed(1)}%</p>
          <div className="mt-2 text-xs text-slate-500">
            {attendanceTodayPresent} present � {attendanceTodayTotal} total
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span className={`font-semibold flex items-center gap-1 ${attendanceDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {attendanceDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {formatDelta(attendanceDelta)}
            </span>
            <span className="text-slate-400 ml-2">vs yesterday</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Parents</p>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalParents}</p>
          <div className="mt-2 text-xs text-slate-500">Registered parent accounts</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Classes</p>
            <Building className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{totalClasses}</p>
          <p className="mt-2 text-xs text-slate-500">Active class groups</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Subjects</p>
            <GraduationCap className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{totalSubjects}</p>
          <p className="mt-2 text-xs text-slate-500">Curriculum coverage</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-white/70">Results This Term</p>
            <NotebookText className="h-4 w-4 text-white/70" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{totalResultsCurrentTerm}</p>
          <p className="mt-2 text-xs text-white/70">Assessments captured</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Notices Published</p>
            <Bell className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{totalNotices}</p>
          <p className="mt-2 text-xs text-slate-500">Public announcements</p>
        </div>
      </div>
      
      <AdminCharts attendanceData={attendanceData} performanceData={performanceData} />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
            <p className="text-xs text-slate-500">Latest notices, admissions, and result updates</p>
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {activities.length === 0 ? (
            <div className="px-6 py-6 text-sm text-slate-500">No recent activity yet.</div>
          ) : (
            activities.map((activity) => {
              const Icon = activity.icon;
              const colorClass =
                activity.color === "blue"
                  ? "bg-blue-100 text-blue-600"
                  : activity.color === "green"
                    ? "bg-green-100 text-green-600"
                    : "bg-purple-100 text-purple-600";
              return (
                <div className="px-6 py-4 flex items-start gap-4" key={activity.id}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                      {activity.badge ? (
                        <span
                          className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${activity.badge.tone === "red"
                              ? "bg-red-100 text-red-700"
                              : activity.badge.tone === "amber"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {activity.badge.label}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{activity.detail}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


