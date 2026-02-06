"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", present: 20, absent: 1 },
  { month: "Feb", present: 18, absent: 2 },
  { month: "Mar", present: 22, absent: 0 },
  { month: "Apr", present: 21, absent: 1 },
  { month: "May", present: 20, absent: 2 },
  { month: "Jun", present: 15, absent: 0 },
  { month: "Jul", present: 0, absent: 0 },
  { month: "Aug", present: 18, absent: 1 },
  { month: "Sep", present: 16, absent: 1 },
];

export default function AttendanceChart() {
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4">
      {/* IMPORTANT: parent MUST have height */}
      <div className="w-full" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend verticalAlign="bottom" />
            <Bar dataKey="present" name="Present Days" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            <Bar dataKey="absent" name="Absent Days" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
