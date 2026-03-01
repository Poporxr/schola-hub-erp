import { SummaryData } from "@/components/student/results/types";

const ResultSummaryCards = ({ summary }: { summary: SummaryData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Overall Average</p>
        <p className="mt-3 text-3xl font-bold text-slate-900">{summary.overallAverage.toFixed(1)}%</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Total Score</p>
        <p className="mt-3 text-3xl font-bold text-slate-900">{Math.round(summary.totalScore)}</p>
        <p className="mt-2 text-xs text-slate-500">Out of {summary.maxScore} marks</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Class Position</p>
        <p className="mt-3 text-3xl font-bold text-slate-900">{summary.classPosition ?? "-"}</p>
        <p className="mt-2 text-xs text-slate-500">Out of {summary.classSize || "-"} students</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Subjects</p>
        <p className="mt-3 text-3xl font-bold text-slate-900">{summary.totalSubjects}</p>
        <p className="mt-2 text-xs text-slate-500">{summary.passedCount} passed</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide text-white/70">Status</p>
        <p className="mt-3 text-2xl font-semibold">{summary.status}</p>
      </div>
    </div>
  );
};

export default ResultSummaryCards;
