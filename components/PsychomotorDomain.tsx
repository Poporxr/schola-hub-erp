import { Zap } from "lucide-react";

const PsychomoDomain = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-900">Psychomotor Domain (Skills)</h3>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Handwriting</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Excellent</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Sports & Games</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Excellent</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Drawing & Painting</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Very Good</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Musical Skills</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Very Good</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Verbal Fluency</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Excellent</span>
                </div>
            </div>
        </div>
    )
};

export default PsychomoDomain;