"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";

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

type ClassOption = {
  id: string;
  name: string;
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

  switch (status) {
    case "present":
      return base + " bg-emerald-50 text-emerald-700";
    case "absent":
      return base + " bg-rose-50 text-rose-700";
    case "late":
      return base + " bg-amber-50 text-amber-700";
  }
}

export default function AttendanceClient({
  initialStudents,
  classOptions,
  initialClassId,
  initialDate,
  termLabel,
}: {
  initialStudents: StudentRow[];
  classOptions: ClassOption[];
  initialClassId: string;
  initialDate: string;
  termLabel: string;
}) {
  const [students, setStudents] = useState<StudentRow[]>(initialStudents);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [selectedClass, setSelectedClass] = useState(initialClassId);
  const [date, setDate] = useState(initialDate);

  useEffect(() => {
    async function loadStudents() {
      setIsLoading(true);
      setMessage(null);
      setStudents([]);
      try {
        const params = new URLSearchParams({
          classId: selectedClass,
          date,
        });
        const res = await fetch(`/api/teacher/attendance?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load attendance data");
        setStudents(data.students ?? []);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to load attendance data");
      } finally {
        setIsLoading(false);
      }
    }

    loadStudents();
  }, [selectedClass, date]);

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
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          date,
          students: students.map((s) => ({ id: s.id, status: s.status })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save attendance");
      setMessage("Attendance saved successfully.");
      toast.success("Attendance saved");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to save attendance";
      setMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Attendance
          </p>
          <h1 className="text-2xl font-bold">Mark Daily Attendance</h1>
          <p className="text-sm text-white/70">
            Track attendance for your assigned classes with live updates.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-white/70">
            <span>Current term: {termLabel}</span>
            <span>
              Class: {classOptions.find((c) => c.id === selectedClass)?.name ?? "-"}
            </span>
          </div>
        </div>
        <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Students
            </p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {students.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">Loaded for the class</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Present
            </p>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {counts.present}
          </p>
          <p className="mt-2 text-xs text-slate-500">Marked today</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Absent
            </p>
            <CheckCircle2 className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {counts.absent}
          </p>
          <p className="mt-2 text-xs text-slate-500">Needs follow-up</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-white/70">Late</p>
            <Clock className="h-4 w-4 text-white/70" />
          </div>
          <p className="mt-3 text-3xl font-bold">{counts.late}</p>
          <p className="mt-2 text-xs text-white/70">Tardy arrivals</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">
              Attendance Filters
            </h3>
            <p className="text-sm text-slate-500">
              Select class and date to update records
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <span className="font-medium">{termLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Class
            </label>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full px-3 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectGroup>
                  {classOptions.map((item) => (
                    <SelectItem key={item.id} className="cursor-pointer" value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
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
              className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900/30 block p-3"
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-6 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span>
                Present: <span className="font-semibold text-slate-900">{counts.present}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded"></div>
              <span>
                Absent: <span className="font-semibold text-slate-900">{counts.absent}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span>
                Late: <span className="font-semibold text-slate-900">{counts.late}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={saveAttendance}
            disabled={isSaving || isLoading || !students.length}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium text-sm transition-colors shadow-sm"
          >
            {isSaving ? "Saving..." : "Save Attendance"}
          </button>
        </div>

        {message ? <p className="mb-4 text-sm text-slate-600">{message}</p> : null}

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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                    Loading students...
                  </td>
                </tr>
              ) : null}
              {!isLoading && !students.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                    No students found for this class/date.
                  </td>
                </tr>
              ) : null}
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
                        className={attendanceBtnClass(s.status === "present", "present")}
                      >
                        Present
                      </button>

                      <button
                        type="button"
                        onClick={() => markAttendance(s.id, "absent")}
                        className={attendanceBtnClass(s.status === "absent", "absent")}
                      >
                        Absent
                      </button>

                      <button
                        type="button"
                        onClick={() => markAttendance(s.id, "late")}
                        className={attendanceBtnClass(s.status === "late", "late")}
                      >
                        Late
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              <tr className="hidden last:table-row" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
