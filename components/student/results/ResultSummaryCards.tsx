import { SummaryData } from "@/components/student/results/types";

const ResultSummaryCards = ({ summary }: { summary: SummaryData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <p className="text-sm font-medium text-white/90">Overall Average</p>
        <p className="text-4xl font-bold mt-2">{summary.overallAverage.toFixed(1)}%</p>
      </div>
      <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <p className="text-sm font-medium text-white/90">Total Score</p>
        <p className="text-4xl font-bold mt-2">{Math.round(summary.totalScore)}</p>
        <p className="text-xs text-white/80">Out of {summary.maxScore} marks</p>
      </div>
      <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
        <p className="text-sm font-medium text-white/90">Class Position</p>
        <p className="text-4xl font-bold mt-2">{summary.classPosition ?? "-"}</p>
        <p className="text-xs text-white/80">Out of {summary.classSize || "-"} students</p>
      </div>
      <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <p className="text-sm font-medium text-white/90">Subjects</p>
        <p className="text-4xl font-bold mt-2">{summary.totalSubjects}</p>
        <p className="text-xs text-white/80">{summary.passedCount} passed</p>
      </div>
      <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
        <p className="text-sm font-medium text-white/90">Status</p>
        <p className="text-2xl font-bold mt-2">{summary.status}</p>
      </div>
    </div>
  );
};

export default ResultSummaryCards;
