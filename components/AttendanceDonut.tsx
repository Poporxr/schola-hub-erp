"use client";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

interface AttendanceDonutProps {
  present: number;
  absent: number;
  late: number;
  colors?: string[];
}

export default function AttendanceDonut({
  present,
  absent,
  late,
  colors = ["#10b981", "#ef4444", "#f59e0b"],
}: AttendanceDonutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = [
    { name: "Present", value: present },
    { name: "Absent", value: absent },
    { name: "Late", value: late },
  ];

  return (
    <div className="w-full h-[250px] min-h-[250px]">
      {!mounted ? (
        <div className="h-full w-full rounded-lg bg-slate-50" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={colors[index]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
