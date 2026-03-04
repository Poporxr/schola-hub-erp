"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AttendanceStudentSelect from "@/components/parent/AttendanceStudentSelect";
import { CheckCircle2, Clock3, Percent, XCircle } from "lucide-react";

type StudentOption = {
  id: string;
  firstName: string | null;
  lastName: string | null;
};

type AttendanceRow = {
  id: string;
  date: string;
  status: string;
  period: string | null;
  notes: string | null;
  className: string | null;
};

type Summary = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
};

type AttendanceData = {
  rows: AttendanceRow[];
  summary: Summary;
  attendanceRate: number;
  dataScopeLabel: string;
  classNameFallback: string | null;
};

const statusStyles: Record<string, { badge: string; label: string; note: string }> = {
  PRESENT: { badge: "bg-green-100 text-green-800", label: "Present", note: "On time" },
  LATE: { badge: "bg-amber-100 text-amber-800", label: "Late", note: "Late arrival" },
  ABSENT: { badge: "bg-red-100 text-red-800", label: "Absent", note: "Absent" },
  EXCUSED: { badge: "bg-blue-100 text-blue-800", label: "Excused", note: "Excused" },
};

export default function ParentAttendanceClient({
  students,
  initialStudentId,
  initialData,
}: {
  students: StudentOption[];
  initialStudentId: string;
  initialData: AttendanceData | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState(initialStudentId);
  const [data, setData] = useState<AttendanceData | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlStudentId = useMemo(() => searchParams?.get("studentId") ?? "", [searchParams]);

  useEffect(() => {
    if (urlStudentId && urlStudentId !== selectedId) {
      setSelectedId(urlStudentId);
    }
  }, [urlStudentId, selectedId]);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      if (!selectedId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/parent/attendance?studentId=${selectedId}`, {
          cache: "no-store",
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Failed to load attendance");
        if (isActive) setData(payload);
      } catch (err) {
        if (isActive) setError(err instanceof Error ? err.message : "Failed to load attendance");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    if (!initialData || selectedId !== initialStudentId) {
      load();
    }

    return () => {
      isActive = false;
    };
  }, [selectedId, initialData, initialStudentId]);

  const onStudentChange = (value: string) => {
    setSelectedId(value);
    const params = new URLSearchParams(searchParams?.toString());
    params.set("studentId", value);
    router.push(`?${params.toString()}`);
  };

  const summary = data?.summary ?? { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
  const attendanceRate = data?.attendanceRate ?? 0;
  const rows = data?.rows ?? [];
  const dataScopeLabel = data?.dataScopeLabel ?? "";
  const classNameFallback = data?.classNameFallback ?? null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">Attendance Records</h3>
            <p className="text-sm text-slate-500">
              View your children&apos;s attendance history
              {dataScopeLabel ? <span className="text-xs text-slate-400 block mt-1">{dataScopeLabel}</span> : null}
            </p>
          </div>
          <AttendanceStudentSelect
            selectedId={selectedId}
            students={students}
            onChange={onStudentChange}
          />
        </div>

        {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Present</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.present} Days</p>
            <p className="mt-2 text-xs text-slate-500">On time</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Absent</p>
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.absent} Days</p>
            <p className="mt-2 text-xs text-slate-500">Missed days</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Late</p>
              <Clock3 className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{summary.late} Days</p>
            <p className="mt-2 text-xs text-slate-500">Late arrivals</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50 via-white to-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Attendance Rate</p>
              <Percent className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{attendanceRate}%</p>
            <p className="mt-2 text-xs text-slate-500">Overall</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-800">Attendance Details</h4>
          <p className="text-xs text-slate-500 mt-1">Per-day attendance and notes</p>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 border-collapse">
            <thead className="text-xs text-slate-600 uppercase bg-slate-50/95">
              <tr>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Day</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Class</th>
                <th scope="col" className="px-6 py-3">Remarks</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-slate-500">
                    Loading attendance...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((row) => {
                  const meta = statusStyles[row.status] ?? statusStyles.PRESENT;
                  const date = new Date(row.date);
                  const dayLabel = date.toLocaleDateString("en-US", { weekday: "long" });
                  const dateLabel = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={row.id} className="bg-white hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{dateLabel}</td>
                      <td className="px-6 py-4">{dayLabel}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">{row.className ?? classNameFallback ?? "-"}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{row.notes ?? meta.note}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-slate-500">
                    No attendance records for this student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="px-6 py-6 text-center text-sm text-slate-500">
              Loading attendance...
            </div>
          ) : rows.length ? (
            rows.map((row) => {
              const meta = statusStyles[row.status] ?? statusStyles.PRESENT;
              const date = new Date(row.date);
              const dayLabel = date.toLocaleDateString("en-US", { weekday: "long" });
              const dateLabel = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={row.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{dateLabel}</p>
                      <p className="text-xs text-slate-500 mt-1">{dayLabel}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-500">
                    <div>
                      <p className="uppercase tracking-wide text-slate-400">Class</p>
                      <p className="text-slate-700 mt-1">{row.className ?? classNameFallback ?? "-"}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wide text-slate-400">Remarks</p>
                      <p className="text-slate-700 mt-1">{row.notes ?? meta.note}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-6 text-center text-sm text-slate-500">
              No attendance records for this student.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
