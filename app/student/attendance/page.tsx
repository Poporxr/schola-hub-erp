import AttendanceChart from "@/components/student/AttendanceChart";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { AttendanceStatus } from "@prisma/client";


const Page = async () => {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6 text-sm text-slate-600">Sign in to view attendance.</div>;
  }

  const [student, currentTerm] = await Promise.all([
    prisma.student.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      select: { id: true },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, sessionId: true },
    }),
  ]);

  if (!student) {
    return <div className="p-6 text-sm text-slate-600">No student profile is linked to this account.</div>;
  }
  if (!currentTerm) {
    return <div className="p-6 text-sm text-slate-600">No current term is configured.</div>;
  }

  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // Sun=0 ... Sat=6
  const daysSinceMonday = (dayOfWeek + 6) % 7;

  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() - daysSinceMonday);
  weekStart.setUTCHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 4);
  weekEnd.setUTCHours(23, 59, 59, 999);

  const weeklyRows = await prisma.attendance.findMany({
    where: {
      studentId: student.id,
      sessionId: currentTerm.sessionId,
      termId: currentTerm.id,
      date: { gte: weekStart, lte: weekEnd },
    },
    select: { date: true, status: true, notes: true },
    orderBy: [{ date: "asc" }],
  });

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weeklyData = dayLabels.map((label, idx) => {
    const d = new Date(weekStart);
    d.setUTCDate(weekStart.getUTCDate() + idx);
    const key = d.toISOString().slice(0, 10);

    const rowsForDay = weeklyRows.filter((row) => row.date.toISOString().slice(0, 10) === key);
    const present = rowsForDay.filter((row) => row.status === AttendanceStatus.PRESENT).length;
    const absent = rowsForDay.filter((row) => row.status === AttendanceStatus.ABSENT).length;

    return { day: label, present, absent };
  });

  const totalPresent = weeklyData.reduce((sum, item) => sum + item.present, 0);
  const totalAbsent = weeklyData.reduce((sum, item) => sum + item.absent, 0);

  const recentAbsences = weeklyRows
    .filter((row) => row.status === AttendanceStatus.ABSENT)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3)
    .map((row) => ({
      date: row.date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      reason: row.notes || "Unexcused",
    }));

  return (
 <div className="space-y-6">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
      <h3 className="font-bold text-gray-900 mb-4">Weekly Attendance Overview (Mon - Fri)</h3>

      <AttendanceChart data={weeklyData} />
    </div>

    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4">Summary</h3>

      <div className="space-y-6">
        <div className="text-center p-4 bg-indigo-50 rounded-xl">
          <p className="text-sm text-indigo-600 font-medium mb-1">Total Present</p>
          <p className="text-3xl font-bold text-indigo-900">{totalPresent}</p>
          <p className="text-xs text-indigo-400">Entries This Week</p>
        </div>

        <div className="text-center p-4 bg-red-50 rounded-xl">
          <p className="text-sm text-red-600 font-medium mb-1">Total Absent</p>
          <p className="text-3xl font-bold text-red-900">{totalAbsent}</p>
          <p className="text-xs text-red-400">Entries This Week</p>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Recent Absences
          </h4>
          {recentAbsences.length ? (
            <ul className="space-y-2 text-sm text-gray-600">
              {recentAbsences.map((item, idx) => (
                <li key={`${item.date}-${idx}`} className="flex justify-between">
                  <span>{item.date}</span>
                  <span className="text-red-500">{item.reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No absences recorded this week.</p>
          )}
        </div>
      </div>
    </div>
  </div>
</div>

  );
}
export default Page
