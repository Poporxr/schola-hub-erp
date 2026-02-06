"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const AdminCharts = () => {
  const attendanceRef = useRef<HTMLCanvasElement>(null);
  const performanceRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!attendanceRef.current || !performanceRef.current) return;

    // Attendance Line Chart
    const attendanceChart = new Chart(attendanceRef.current, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Attendance %", 
            data: [95, 90, 92, 88, 94, 97],
            borderColor: "rgba(59, 130, 246, 1)", // Tailwind blue-500
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: "Attendance Trends" },
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true, max: 100 },
        },
      },
    });

    // Performance Bar Chart
    const performanceChart = new Chart(performanceRef.current, {
      type: "bar",
      data: {
        labels: ["Math", "English", "Science", "History", "Art"],
        datasets: [
          {
            label: "Average Score",
            data: [85, 78, 92, 74, 88],
            backgroundColor: "rgba(16, 185, 129, 0.7)", // Tailwind green-500
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: "Performance Overview" },
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true, max: 100 },
        },
      },
    });

    return () => {
      attendanceChart.destroy();
      performanceChart.destroy();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Attendance Trends</h3>
        <div className="h-64 w-full">
          <canvas ref={attendanceRef}></canvas>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Overview</h3>
        <div className="h-64 w-full">
          <canvas ref={performanceRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default AdminCharts;
