"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

type AttendancePoint = {
  month: string;
  rate: number;
  present?: number;
  total?: number;
};

type PerformancePoint = {
  subject: string;
  average: number;
};

type AdminChartsProps = {
  attendanceData: AttendancePoint[];
  performanceData: PerformancePoint[];
};

const AdminCharts = ({ attendanceData, performanceData }: AdminChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Attendance Trends</h3>
        <div className="h-64 w-full">
          {attendanceData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-slate-500">
              No attendance data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip
                  formatter={(value: number | undefined) => [
                    `${(value ?? 0).toFixed(1)}%`,
                    "Attendance",
                  ]}
                />
                <Line type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Overview</h3>
        <div className="h-64 w-full">
          {performanceData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-slate-500">
              No results data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip
                  formatter={(value: number | undefined) => [
                    `${(value ?? 0).toFixed(1)}%`,
                    "Average",
                  ]}
                />
                <Bar dataKey="average" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCharts;
