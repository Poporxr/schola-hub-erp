import { ArrowUp, BookOpen, CheckCircle2, Target, TrendingUp, Trophy } from "lucide-react";

const ResultCardSummary = () => {
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
                <p className="text-4xl font-bold mb-1">87.5%</p>
                <div className="flex items-center gap-1 text-xs text-white/80">
                    <ArrowUp className="w-3 h-3" />
                    <span>+3.2% from last term</span>
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
                <p className="text-4xl font-bold mb-1">875</p>
                <p className="text-xs text-white/80">Out of 1000 marks</p>
            </div>

            {/* Class Position Card */}
            <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/90">Class Position</span>
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Trophy className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-4xl font-bold mb-1">1st</p>
                <p className="text-xs text-white/80">Out of 28 students</p>
            </div>

            {/* Number of Subjects Card */}
            <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/90">Subjects</span>
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-4xl font-bold mb-1">10</p>
                <p className="text-xs text-white/80">All subjects passed</p>
            </div>

            {/* Pass/Fail Status Card */}
            <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white/90">Status</span>
                    <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
                <p className="text-2xl font-bold mb-1">PASSED</p>
                <p className="text-xs text-white/80">Excellent performance</p>
            </div>
        </div>
    )
}

export default ResultCardSummary;