import { SubjectResultRow } from "@/components/student/results/types";
import { Subscript } from "lucide-react";

const STANDARD_GRADE_SCALE = [
  { grade: "A", range: "80-100", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { grade: "B", range: "70-79", className: "bg-lime-100 text-lime-700 border-lime-200" },
  { grade: "C", range: "60-69", className: "bg-amber-100 text-amber-700 border-amber-200" },
  { grade: "D", range: "50-59", className: "bg-orange-100 text-orange-700 border-orange-200" },
  { grade: "E", range: "40-49", className: "bg-rose-100 text-rose-700 border-rose-200" },
  { grade: "F", range: "0-39", className: "bg-red-100 text-red-700 border-red-200" },
] as const;

const gradeFromScore = (score?: number | null) => {
  if (score === null || score === undefined) return "-";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";
  return "F";
};

const gradeBadgeClass = (grade: string) => {
  switch (grade) {
    case "A+":
    case "A":
      return "bg-emerald-100 text-emerald-700";
    case "B":
      return "bg-lime-100 text-lime-700";
    case "C":
      return "bg-amber-100 text-amber-700";
    case "D":
      return "bg-orange-100 text-orange-700";
    case "E":
      return "bg-rose-100 text-rose-700";
    case "F":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const performanceForScore = (score?: number | null) => {
  if (score === null || score === undefined) {
    return { label: "N/A", status: "perf-unknown" };
  }
  if (score >= 70) return { label: "Excellent", status: "perf-excellent" };
  if (score >= 60) return { label: "Very Good", status: "perf-good" };
  if (score >= 50) return { label: "Good", status: "perf-average" };
  if (score >= 45) return { label: "Fair", status: "perf-average" };
  return { label: "Poor", status: "perf-poor" };
}

const SubjectBreakdownTable = ({
  rows,
  emptyMessage = "No results found for the selected filters.",
}: {
  rows: SubjectResultRow[];
  emptyMessage?: string;
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Subject Performance Breakdown</h3>
              <p className="text-xs text-slate-500 mt-1">Detailed scores across all subjects</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {STANDARD_GRADE_SCALE.map((item) => (
                <span
                  key={item.grade}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.className}`}
                >
                  <span>{item.grade}</span>
                  <span className="text-current/80">{item.range}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10">
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-semibold">
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4 text-center">Tests</th>
                <th className="px-6 py-4 text-center">Exam</th>
                <th className="px-6 py-4 text-center">Total</th>
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4 text-center">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {rows.length ? (
                rows.map((row) => {
                  const grade = gradeFromScore(row.totalScore);
                  const performance = performanceForScore(row.totalScore);
                  return (
                    <tr className="hover:bg-slate-50 transition-colors" key={row.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                            <Subscript className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-slate-900">{row.subjectName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-900">{row.tests}</td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-900">{row.exam}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-bold text-slate-900">{row.totalScore}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${gradeBadgeClass(grade)}`}
                        >
                          {grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <i data-lucide="trending-up" className={`w-4 h-4 ${performance.status}`}></i>
                          <span className={`text-xs font-medium ${performance.status}`}>{performance.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubjectBreakdownTable;
