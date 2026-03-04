import { PieChart } from "lucide-react";

type GradeCounts = Record<string, number>;

const gradeMeta = [
    { key: "A_PLUS", label: "A+", range: "90-100", color: "from-emerald-500 to-emerald-600", text: "text-emerald-700", bg: "bg-emerald-100" },
    { key: "A", label: "A", range: "80-89", color: "from-blue-500 to-blue-600", text: "text-blue-700", bg: "bg-blue-100" },
    { key: "B", label: "B", range: "70-79", color: "from-indigo-500 to-indigo-600", text: "text-indigo-700", bg: "bg-indigo-100" },
    { key: "C", label: "C", range: "60-69", color: "from-amber-500 to-amber-600", text: "text-amber-700", bg: "bg-amber-100" },
    { key: "D", label: "D", range: "50-59", color: "from-orange-500 to-orange-600", text: "text-orange-700", bg: "bg-orange-100" },
    { key: "E", label: "E", range: "40-49", color: "from-rose-500 to-rose-600", text: "text-rose-700", bg: "bg-rose-100" },
    { key: "F", label: "F", range: "0-39", color: "from-slate-500 to-slate-600", text: "text-slate-700", bg: "bg-slate-100" },
];

const GradeBreakdown = ({ counts, total }: { counts: GradeCounts; total: number }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Grade Breakdown</h3>
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <PieChart className="w-4 h-4 text-slate-900" />
                </div>
            </div>
            <div className="space-y-4">
                {gradeMeta.map((g) => {
                    const count = counts[g.key] ?? 0;
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                        <div key={g.key}>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${g.bg} ${g.text}`}>{g.label}</span>
                                    <span className="text-slate-600">{g.range}</span>
                                </div>
                                <span className="font-bold text-slate-900">{count} students</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className={`bg-linear-to-r ${g.color} h-2.5 rounded-full shadow-sm`} style={{ width: `${pct}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GradeBreakdown;
