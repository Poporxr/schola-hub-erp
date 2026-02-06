import { PieChart } from "lucide-react"

const GradeBreakdown = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Grade Breakdown</h3>
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <PieChart className="w-4 h-4 text-indigo-600" />
                </div>
            </div>
            {/* Grade distribution with progress bars */}
            <div className="space-y-4">
                {/* A+ grade --> */}
                <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700">A+</span>
                            <span className="text-slate-600">90-100</span>
                        </div>
                        <span className="font-bold text-slate-900">12 students</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-linear-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full shadow-sm"></div>
                    </div>
                </div>
                {/*<!-- A grade --> */}
                <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">A</span>
                            <span className="text-slate-600">80-89</span>
                        </div>
                        <span className="font-bold text-slate-900">9 students</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-linear-to-r from-blue-500 to-blue-600 h-2.5 rounded-full shadow-sm"></div>
                    </div>
                </div>
                {/* <!-- B grade -->*/}
                <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-700">B</span>
                            <span className="text-slate-600">70-79</span>
                        </div>
                        <span className="font-bold text-slate-900">5 students</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-linear-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full shadow-sm"></div>
                    </div>
                </div>
                {/* <!-- C grade --> */}
                <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700">C</span>
                            <span className="text-slate-600">60-69</span>
                        </div>
                        <span className="font-bold text-slate-900">2 students</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-linear-to-r from-amber-500 to-amber-600 h-2.5 rounded-full shadow-sm"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GradeBreakdown;