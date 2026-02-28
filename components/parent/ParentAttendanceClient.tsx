"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AttendanceStudentSelect from "@/components/parent/AttendanceStudentSelect";

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Attendance Records</h3>
            <p className="text-sm text-gray-500">
              View your children&apos;s attendance history
              {dataScopeLabel ? <span className="text-xs text-gray-400 block mt-1">{dataScopeLabel}</span> : null}
            </p>
          </div>
          <AttendanceStudentSelect
            selectedId={selectedId}
            students={students}
            onChange={onStudentChange}
          />
        </div>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-xs text-gray-600 font-medium">Present</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{summary.present} Days</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <p className="text-xs text-gray-600 font-medium">Absent</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{summary.absent} Days</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <p className="text-xs text-gray-600 font-medium">Late</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{summary.late} Days</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <p className="text-xs text-gray-600 font-medium">Percentage</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 border-collapse">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Day</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Class</th>
                <th scope="col" className="px-6 py-3">Remarks</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
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
                    <tr key={row.id} className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{dateLabel}</td>
                      <td className="px-6 py-4">{dayLabel}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">{row.className ?? classNameFallback ?? "-"}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{row.notes ?? meta.note}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                    No attendance records for this student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
