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
import { useEffect, useState } from "react";

export type AttendanceChartPoint = {
  day: string;
  present: number;
  absent: number;
};

export default function AttendanceChart({ data }: { data: AttendanceChartPoint[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4">
      {/* IMPORTANT: parent MUST have height */}
      <div className="w-full" style={{ height: 320 }}>
        {!mounted ? (
          <div className="h-full w-full rounded-lg bg-slate-50" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend verticalAlign="bottom" />
              <Bar dataKey="present" name="Present" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
