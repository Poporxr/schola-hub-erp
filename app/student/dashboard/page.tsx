import ScheduleAndNotices from "@/components/student/ScheduleAndNotices";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  Award,  BookOpen,
  CalendarCheck,  TrendingUp,
} from "lucide-react";
import { AttendanceStatus } from "@/generated/prisma/client";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";
import { greetingForHour } from "@/lib/settings";

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

      <KpiGrid>
        <KpiCard
          label="Attendance Rate"
          value={`${attendanceRate.toFixed(1)}%`}
          icon={<CalendarCheck className="h-3.5 w-3.5 text-blue-500 sm:h-4 sm:w-4" />}
          subtext="This term"
        />
        <KpiCard
          label="Average Score"
          value={`${averageScore.toFixed(1)}%`}
          icon={<Award className="h-3.5 w-3.5 text-emerald-500 sm:h-4 sm:w-4" />}
          subtext="Across results"
        />
        <KpiCard
          label="Class Position"
          value={formatPosition(classPosition)}
          icon={<TrendingUp className="h-3.5 w-3.5 text-amber-500 sm:h-4 sm:w-4" />}
          subtext={classSize ? `Out of ${classSize} students` : "Class not set"}
        />
        <KpiCard
          label="Total Subjects"
          value={subjectCount}
          tone="soft"
          icon={<BookOpen className="h-3.5 w-3.5 text-indigo-400 sm:h-4 sm:w-4" />}
          subtext="Active subjects"
        />
      </KpiGrid>


      <ScheduleAndNotices schedule={schedule} notices={notices} />
    </div>
  );
};
export default Page;





