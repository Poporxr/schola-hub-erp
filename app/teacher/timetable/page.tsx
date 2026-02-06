import { classesMock, subjectMock, timetableEntriesMock, venuesMock } from "@/utils/students";
import { Weekday } from "@/utils/types";
import { Download } from "lucide-react";

const subjectColorUI = {
    TEAL: { bg: "bg-teal-50", border: "border-teal-500", title: "text-teal-900", sub: "text-teal-700" },
    BLUE: { bg: "bg-blue-50", border: "border-blue-500", title: "text-blue-900", sub: "text-blue-700" },
    PURPLE: { bg: "bg-purple-50", border: "border-purple-500", title: "text-purple-900", sub: "text-purple-700" },
} as const;

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

function buildCellKey(day: Weekday, start: string, end: string) {
    return `${day}|${start}|${end}`;
}

const entryLookup = new Map(
    timetableEntriesMock.map((e) => [buildCellKey(e.time.day, e.time.start, e.time.end), e] as const)
);

const subjectById = new Map(subjectMock.map((s) => [s.id, s] as const));
const classById = new Map(classesMock.map((c) => [c.id, c] as const));
const venueById = new Map(venuesMock.map((v) => [v.id, v] as const));

const TeacherWeeklyTimetable = () => {
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

    {/* ✅ this draws the clean full-width row separators */}
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
              const entry = entryLookup.get(buildCellKey(day.key, row.start, row.end));

              if (!entry) {
                return (
                  <td key={day.key} className="px-6 py-4">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500 text-center">Free Period</p>
                    </div>
                  </td>
                );
              }

              const subject = subjectById.get(entry.subjectId);
              const venue = venueById.get(entry.venueId);
              const className = classById.get(entry.classIds[0])?.name ?? "—";
              const meta = `${className} • ${venue?.name ?? "—"}`;

              const colorKey = subject?.color ?? "TEAL";
              const ui = subjectColorUI[colorKey];

              return (
                <td key={day.key} className="px-6 py-4">
                  <div className={`p-2 ${ui.bg} rounded border-l-4 ${ui.border}`}>
                    <p className={`font-semibold ${ui.title} text-xs`}>
                      {subject?.name ?? "—"}
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
