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
            <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/90">Overall Average</span>
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-4xl font-bold mb-1">{overallAverage === null ? "-" : `${overallAverage}%`}</p>
                <div className="flex items-center gap-1 text-xs text-white/80">
                    <ArrowUp className="w-3 h-3" />
                    <span>Current term average</span>
                </div>
            </div>

            {/* Total Score Card */}
            <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/90">Total Score</span>
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Target className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-4xl font-bold mb-1">{totalScore === null ? "-" : totalScore}</p>
                <p className="text-xs text-white/80">{maxScore === null ? "Out of - marks" : `Out of ${maxScore} marks`}</p>
            </div>

            {/* Class Position Card */}
            <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/90">Class Position</span>
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Trophy className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-4xl font-bold mb-1">{formatPosition(classPosition)}</p>
                <p className="text-xs text-white/80">{classSize ? `Out of ${classSize} students` : "Out of - students"}</p>
            </div>

            {/* Number of Subjects Card */}
            <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/90">Subjects</span>
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-4xl font-bold mb-1">{subjectCount ?? "-"}</p>
                <p className="text-xs text-white/80">{subjectStatus}</p>
            </div>

            {/* Pass/Fail Status Card */}
            <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/90">Status</span>
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold mb-1">{statusLabel}</p>
                <p className="text-xs text-white/80">{statusDetail}</p>
            </div>
        </div>
    )
}

export default ResultCardSummary;
