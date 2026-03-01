import { ArrowUp, BookOpen, CheckCircle2, Target, TrendingUp, Trophy } from "lucide-react";

type ResultSummary = {
    overallAverage: number | null;
    totalScore: number | null;
    maxScore: number | null;
    classPosition: number | null;
    classSize: number | null;
    subjectCount: number | null;
    passedSubjects: number | null;
    statusLabel: string;
    statusDetail: string;
};

const formatPosition = (position: number | null) => {
    if (!position) return "-";
    const suffix = position % 10 === 1 && position % 100 !== 11 ? "st" : position % 10 === 2 && position % 100 !== 12 ? "nd" : position % 10 === 3 && position % 100 !== 13 ? "rd" : "th";
    return `${position}${suffix}`;
};

const ResultCardSummary = ({ summary }: { summary?: ResultSummary }) => {
    const overallAverage = summary?.overallAverage ?? null;
    const totalScore = summary?.totalScore ?? null;
    const maxScore = summary?.maxScore ?? null;
    const classPosition = summary?.classPosition ?? null;
    const classSize = summary?.classSize ?? null;
    const subjectCount = summary?.subjectCount ?? null;
    const passedSubjects = summary?.passedSubjects ?? null;
    const statusLabel = summary?.statusLabel ?? "N/A";
    const statusDetail = summary?.statusDetail ?? "No result data available";

    const subjectStatus =
        subjectCount && passedSubjects !== null
            ? passedSubjects === subjectCount
                ? "All subjects passed"
                : `${passedSubjects}/${subjectCount} subjects passed`
            : "No subject data";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/*Overall Average Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Overall Average</p>
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{overallAverage === null ? "-" : `${overallAverage}%`}</p>
                <div className="mt-3 flex items-center text-xs">
                    <span className="font-semibold flex items-center gap-1 text-emerald-600">
                        <ArrowUp className="w-3 h-3" /> Current term
                    </span>
                </div>
            </div>

            {/* Total Score Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total Score</p>
                    <Target className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{totalScore === null ? "-" : totalScore}</p>
                <p className="mt-2 text-xs text-slate-500">{maxScore === null ? "Out of - marks" : `Out of ${maxScore} marks`}</p>
            </div>

            {/* Class Position Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Class Position</p>
                    <Trophy className="h-4 w-4 text-amber-500" />
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{formatPosition(classPosition)}</p>
                <p className="mt-2 text-xs text-slate-500">{classSize ? `Out of ${classSize} students` : "Out of - students"}</p>
            </div>

            {/* Number of Subjects Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Subjects</p>
                    <BookOpen className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{subjectCount ?? "-"}</p>
                <p className="mt-2 text-xs text-slate-500">{subjectStatus}</p>
            </div>

            {/* Pass/Fail Status Card */}
            <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-white/70">Status</p>
                    <CheckCircle2 className="h-4 w-4 text-white/70" />
                </div>
                <p className="mt-3 text-2xl font-semibold">{statusLabel}</p>
                <p className="mt-2 text-xs text-white/70">{statusDetail}</p>
            </div>
        </div>
    )
}

export default ResultCardSummary;
