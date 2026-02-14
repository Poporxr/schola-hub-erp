import { SubjectResultRow } from "@/components/student/results/types";
import { Subscript } from "lucide-react";

type ScoreLabel = "Excellent" | "Very Good" | "Good" | "Fair" | "Poor";

function performanceLabel(score: number): ScoreLabel {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

function labelTone(label: ScoreLabel) {
  if (label === "Excellent") return "text-emerald-600";
  if (label === "Very Good") return "text-blue-600";
  if (label === "Good") return "text-purple-600";
  if (label === "Fair") return "text-amber-600";
  return "text-red-600";
}

const SubjectBreakdownTable = ({ rows }: { rows: SubjectResultRow[] }) => {
  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-purple-50 to-indigo-50">
          <h3 className="font-bold text-slate-900 text-lg">Subject Performance Breakdown</h3>
          <p className="text-sm text-slate-600 mt-1">Detailed scores across all subjects</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10">
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-semibold">
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4 text-center">Tests</th>
                <th className="px-6 py-4 text-center">Assignments</th>
                <th className="px-6 py-4 text-center">Exam</th>
                <th className="px-6 py-4 text-center">Total</th>
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4 text-center">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {rows.length ? (
                rows.map((row) => {
                  const perf = performanceLabel(row.totalScore);
                  return (
                    <tr className="hover:bg-purple-50/50 transition-colors" key={row.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Subscript className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-slate-900">{row.subjectName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-900">{row.tests.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-900">{row.assignments.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-900">{row.exam.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-bold text-purple-600">{row.totalScore.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-md">
                          {row.grade ?? "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs font-medium ${labelTone(perf)}`}>{perf}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No results found for the selected filters.
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
