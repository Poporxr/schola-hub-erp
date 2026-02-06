import ScheduleAndNotices from "@/components/student/ScheduleAndNotices";
import { AlertCircle, BookOpen, CheckCircle, Library, TrendingUp } from "lucide-react";
import Link from "next/link";

const Page = () => {
    return (
        <div id="dashboard" className=" active space-y-6">
            {/*Welcome Banner */}
            <div className="bg-linear-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-2">Welcome back, Alex! 👋</h1>
                    <p className="text-indigo-100 max-w-xl">You have <span className="font-semibold text-white">2 assignments</span> due this week and an upcoming <span className="font-semibold text-white">Physics Test</span> on Friday.</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                    <BookOpen className="w-64 h-64" />
                </div>
            </div>

            {/*Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Attendance</h3>
                        <span className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900">92%</span>
                        <span className="text-sm text-green-600 mb-1">Good</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-3">
                        <div className="bg-green-500 h-2 rounded-full" ></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Term Fees</h3>
                        <span className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900">$450</span>
                        <span className="text-sm text-orange-600 mb-1">Due Now</span>
                    </div>
                    <Link href={"/student/tuition"} className="text-sm text-indigo-600 font-medium mt-3 hover:underline">Pay Fees &rarr;</Link>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Current GPA</h3>
                        <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <TrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900">3.8</span>
                        <span className="text-sm text-gray-500 mb-1">/ 4.0</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Last updated: Yesterday</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Total Subjects</h3>
                        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Library className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900">6</span>
                        <span className="text-sm text-gray-500 mb-1">Active</span>
                    </div>
                    <Link href={"/student/subjects"} className="text-sm text-indigo-600 font-medium mt-3 hover:underline">View All &rarr;</Link>
                </div>
            </div>
            <ScheduleAndNotices />
        </div>
    );
}
export default Page;