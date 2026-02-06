import { CheckCircle, Lightbulb, TrendingUp, Users } from "lucide-react";

const ClassInsights = () => {
    return (
        <div className="bg-linear-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-slate-900">Class Insights</h3>
            </div>
            <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">Class performance improved by <span className="font-bold text-purple-700">2.3%</span> this term</p>
                </div>
                <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">Mathematics shows strongest improvement</p>
                </div>
                <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700"><span className="font-bold text-purple-700">2 students</span> need additional support</p>
                </div>
            </div>
        </div>
    );
}

export default ClassInsights;