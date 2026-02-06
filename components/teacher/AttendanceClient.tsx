"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

// Use your shadcn Select where necessary
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AttendanceStatus = "present" | "absent" | "late";

type StudentRow = {
  id: string;
  sn: number;
  name: string;
  admissionNo: string;
  gender: "Male" | "Female";
  status: AttendanceStatus;
};


function attendanceBtnClass(active: boolean, status: AttendanceStatus) {
  const base =
    "attendance-btn px-3 py-1 rounded-lg text-xs font-medium transition-colors";

  if (!active) {
    return (
      base +
      " border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
    );
  }

  // ✅ screenshot-like soft pills
  switch (status) {
    case "present":
      return base + " bg-[#E7F7EF] text-[#0FA958]";
    case "absent":
      return base + " bg-[#FCEAEA] text-[#E54848]";
    case "late":
      return base + " bg-[#FFF4DF] text-[#FFB020]";
  }
}

export default function AttendanceClient({initialStudents}: {initialStudents: StudentRow[]}) {
  const [students, setStudents] = useState<StudentRow[]>(initialStudents);

  // These can be derived/passed from class card
  const [selectedClass, setSelectedClass] = useState("JSS 2A - Mathematics");
const [selectedPeriod, setSelectedPeriod] = useState("Period 1 (08:00 AM)");

  const [date, setDate] = useState(() => {
    // yyyy-mm-dd
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const counts = useMemo(() => {
    const present = students.filter((s) => s.status === "present").length;
    const absent = students.filter((s) => s.status === "absent").length;
    const late = students.filter((s) => s.status === "late").length;
    return { present, absent, late };
  }, [students]);

  function markAttendance(studentId: string, status: AttendanceStatus) {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  }

  async function saveAttendance() {
    // TODO: replace with server action or API call
    // await fetch("/api/attendance", { method: "POST", body: JSON.stringify(...) })
    console.log("Saving attendance:", { selectedClass, date, selectedPeriod, students });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Mark Daily Attendance</h3>
            <p className="text-sm text-slate-500">
              Select class and date to mark attendance
            </p>
          </div>

          {/* Optional top-right chip (like screenshot header) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <span className="font-medium">Term 2, 2024</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Class
            </label>

            {/* ✅ shadcn Select */}
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectGroup>
                  <SelectItem
                    className="cursor-pointer"
                    value="JSS 2A - Mathematics"
                  >
                    JSS 2A - Mathematics
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer"
                    value="JSS 3C - Mathematics"
                  >
                    JSS 3C - Mathematics
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer"
                    value="SS 1B - Mathematics"
                  >
                    SS 1B - Mathematics
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer"
                    value="SS 2B - Further Mathematics"
                  >
                    SS 2B - Further Mathematics
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer"
                    value="SS 3A - Further Mathematics"
                  >
                    SS 3A - Further Mathematics
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Period
            </label>

            {/* ✅ shadcn Select */}
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectGroup>
                  <SelectItem
                    className="cursor-pointer"
                    value="Period 1 (08:00 AM)"
                  >
                    Period 1 (08:00 AM)
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer"
                    value="Period 2 (09:00 AM)"
                  >
                    Period 2 (09:00 AM)
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer"
                    value="Period 3 (10:00 AM)"
                  >
                    Period 3 (10:00 AM)
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer"
                    value="Period 4 (11:00 AM)"
                  >
                    Period 4 (11:00 AM)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary + Save */}
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-6 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#0FA958] rounded"></div>
              <span>
                Present:{" "}
                <span className="font-semibold text-slate-900">
                  {counts.present}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#E54848] rounded"></div>
              <span>
                Absent:{" "}
                <span className="font-semibold text-slate-900">
                  {counts.absent}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#FFB020] rounded"></div>
              <span>
                Late:{" "}
                <span className="font-semibold text-slate-900">{counts.late}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={saveAttendance}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium text-sm transition-colors shadow-sm"
          >
            Save Attendance
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-left w-18">S/N</th>
                <th className="px-6 py-3 text-left">STUDENT NAME</th>
                <th className="px-6 py-3 text-left">ADMISSION NO.</th>
                <th className="px-6 py-3 text-left">GENDER</th>
                <th className="px-6 py-3 text-left">MARK ATTENDANCE</th>
              </tr>
            </thead>

            <tbody className="text-sm text-slate-700">
              {students.map((s) => (
                <tr
                  key={s.id}
                  className="bg-white border-b border-slate-200 hover:bg-slate-50"
                >
                  <td className="px-6 py-4">{s.sn}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{s.admissionNo}</td>
                  <td className="px-6 py-4 text-slate-600">{s.gender}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => markAttendance(s.id, "present")}
                        className={attendanceBtnClass(
                          s.status === "present",
                          "present"
                        )}
                      >
                        Present
                      </button>

                      <button
                        type="button"
                        onClick={() => markAttendance(s.id, "absent")}
                        className={attendanceBtnClass(
                          s.status === "absent",
                          "absent"
                        )}
                      >
                        Absent
                      </button>

                      <button
                        type="button"
                        onClick={() => markAttendance(s.id, "late")}
                        className={attendanceBtnClass(
                          s.status === "late",
                          "late"
                        )}
                      >
                        Late
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* last row border cleanup */}
              <tr className="hidden last:table-row" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
