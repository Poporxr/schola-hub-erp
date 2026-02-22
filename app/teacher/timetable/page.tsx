import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { buildCellKey, buildCellKeyByStart } from "@/lib/settings";
import type { Weekday } from "@prisma/client";

const subjectColorUI: Record<string, { bg: string; border: string; title: string; sub: string }> = {
  TEAL: { bg: "bg-teal-50", border: "border-teal-500", title: "text-teal-900", sub: "text-teal-700" },
  BLUE: { bg: "bg-blue-50", border: "border-blue-500", title: "text-blue-900", sub: "text-blue-700" },
  PURPLE: { bg: "bg-purple-50", border: "border-purple-500", title: "text-purple-900", sub: "text-purple-700" },
};

const days: { key: Weekday; label: string }[] = [
  { key: "MON", label: "Monday" },
  { key: "TUE", label: "Tuesday" },
  { key: "WED", label: "Wednesday" },
  { key: "THU", label: "Thursday" },
  { key: "FRI", label: "Friday" },
];

const timeRows = [
  { label: "08:00 - 09:00", start: "08:00", end: "09:00" },
  { label: "09:00 - 10:00", start: "09:00", end: "10:00" },
  { label: "10:30 - 11:30", start: "10:30", end: "11:30" },
  { label: "12:00 - 01:00", start: "12:00", end: "13:00", isLunch: true },
  { label: "02:00 - 03:00", start: "14:00", end: "15:00" },
];

const TeacherWeeklyTimetable = async () => {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6 text-sm text-slate-600">Sign in to view timetable.</div>;
  }

  const [teacher, currentTerm] = await Promise.all([
    prisma.teacher.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      select: { id: true },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, sessionId: true },
    }),
  ]);

  if (!teacher) {
    return <div className="p-6 text-sm text-slate-600">Teacher profile not found.</div>;
  }
  if (!currentTerm) {
    return <div className="p-6 text-sm text-slate-600">No current term configured.</div>;
  }

  const timetableEntries = await prisma.timetableEntry.findMany({
    where: {
      teacherId: teacher.id,
      sessionId: currentTerm.sessionId,
      termId: currentTerm.id,
      status: "ACTIVE",
    },
    include: {
      class: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
      venue: { select: { id: true, name: true } },
    },
  });

  const entryLookup = new Map(
    timetableEntries.map((entry) => [buildCellKey(entry.weekday, entry.startTime, entry.endTime), entry])
  );
  const entryLookupByStart = new Map(
    timetableEntries.map((entry) => [buildCellKeyByStart(entry.weekday, entry.startTime), entry])
  );

  const subjectIds = Array.from(new Set(timetableEntries.map((entry) => entry.subjectId)));
  const colorKeys = ["TEAL", "BLUE", "PURPLE"];
  const subjectColorMap = subjectIds.reduce((map, subjectId, index) => {
    map.set(subjectId, colorKeys[index % colorKeys.length]);
    return map;
  }, new Map<string, string>());

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 border-collapse">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">Time</th>
            {days.map((day) => (
              <th key={day.key} scope="col" className="px-6 py-3">
                {day.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {timeRows.map((row) => {
            if (row.isLunch) {
              return (
                <tr key={row.label} className="bg-white">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.label}</td>
                  <td className="px-6 py-4" colSpan={5}>
                    <div className="p-2 bg-amber-50 rounded text-center">
                      <p className="text-xs text-amber-700 font-semibold">LUNCH BREAK</p>
                    </div>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={row.label} className="bg-white">
                <td className="px-6 py-4 font-medium text-gray-900">{row.label}</td>

                {days.map((day) => {
                  const entry =
                    entryLookup.get(buildCellKey(day.key, row.start, row.end)) ??
                    entryLookupByStart.get(buildCellKeyByStart(day.key, row.start));

                  if (!entry) {
                    return (
                      <td key={day.key} className="px-6 py-4">
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500 text-center">Free Period</p>
                        </div>
                      </td>
                    );
                  }

                  const className = entry.class?.name ?? "-";
                  const meta = `${className} - ${entry.venue?.name ?? "-"}`;
                  const colorKey = subjectColorMap.get(entry.subjectId) ?? "TEAL";
                  const ui = subjectColorUI[colorKey];

                  return (
                    <td key={day.key} className="px-6 py-4">
                      <div className={`p-2 ${ui.bg} rounded border-l-4 ${ui.border}`}>
                        <p className={`font-semibold ${ui.title} text-xs`}>
                          {entry.subject?.name ?? "-"}
                        </p>
                        <p className={`text-xs ${ui.sub}`}>{meta}</p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

  );
};

export default TeacherWeeklyTimetable;
