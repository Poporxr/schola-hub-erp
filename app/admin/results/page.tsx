import ClassInsights from "@/components/ClassInsights";
import GradeBreakdown from "@/components/GradeBreakdown";
import { classes, resultsMock } from "@/utils/students";
import { ArrowUp, ArrowUpDown, Award, BarChart3, CheckCircle, CheckCircle2, Download, Lightbulb, PieChart, Printer, Search, Send, Sliders, Star, TrendingUp, Trophy, Upload, Users } from "lucide-react";
import Image from "next/image"
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Page = () => {
    return (
        <>
            <div className=" space-y-6 max-w-400 mx-auto w-full">
                <div className="px-6 py-6 bg-[#7e2cee] rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Academic Results Management</h1>
                                    <p className="text-white/90 text-sm mt-1">Second Term 2023/2024 • Grade 3A</p>
                                </div>
                            </div>
                        </div>
                        <div className="md:flex md:items-center grid gap-1.5 md:gap-3">
                            {/*<!-- Action buttons with white theme --> */}
                            <button className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center  gap-2">
                                <Upload className="w-4 h-4" />
                                Import
                            </button>
                            <button className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button className="px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                Publish Results
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter panel with school-themed styling */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-purple-600" />
                        Filter Results
                    </h3>
                    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/*<!-- Class filter dropdown --> */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
                        <Select >
                            <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                <SelectValue placeholder="Select a Class" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                <SelectGroup >
                                    {classes.map((classItem) => {
                                        return (
                                            <SelectItem key={classItem.id} className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value={classItem.id}>{`Class ${classItem.name}`}</SelectItem>
                                        )
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        </div>
                        {/* Term/Semester filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Term / Semester</label>
                        <Select>
                            <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                <SelectValue placeholder="Select a Term" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                <SelectGroup>
                                    <SelectItem className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value="First Term">First Term</SelectItem>
                                    <SelectItem className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value="Second Term">Second Term</SelectItem>
                                    <SelectItem className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value="Third Term">Third Term</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        </div>
                        {/*<!-- Student search input --> */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Search Student</label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Name or ID..." className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                            </div>
                        </div>
                        {/*  <!-- Apply filters button --> */}
                        <div className="flex items-end">
                            <button type="submit" className="w-full px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md">
                                Apply Filters
                            </button>
                        </div>
                    </form>
                </div>

                {/* Academic performance summary cards */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* <!-- Class average card --> */}
                    <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white report-card-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white/90">Class Average</span>
                            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold mb-1">87.4%</p>
                        <div className="flex items-center gap-1 text-xs text-white/80">
                            <ArrowUp className="w-3 h-3" />
                            <span>+2.3% from last term</span>
                        </div>
                    </div>

                    {/* <!-- Top performer card --> */}
                    <div className="bg-linear-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white report-card-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white/90">Top Performer</span>
                            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Trophy className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold mb-1">98.5%</p>
                        <p className="text-xs text-white/80">Liam Anderson</p>
                    </div>

                    {/*<!-- Pass rate card --> */}
                    <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white report-card-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white/90">Pass Rate</span>
                            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold mb-1">96.4%</p>
                        <p className="text-xs text-white/80">27 of 28 students</p>
                    </div>

                    {/* <!-- Students evaluated card --> */}
                    <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white report-card-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white/90">Students Evaluated</span>
                            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-4xl font-bold mb-1">28</p>
                        <p className="text-xs text-white/80">All results recorded</p>
                    </div>
                </div>


                {/* <!-- Student results table (takes 2 columns) --> */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-purple-50 to-indigo-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Student Report Cards</h3>
                                <p className="text-sm text-slate-600 mt-1">Grade 3A • Second Term 2023/2024</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/*<!-- Sorting options */}
                                <button className="px-3 py-1.5 text-xs text-slate-600 hover:bg-white rounded-lg transition-colors border border-slate-200">
                                    <ArrowUpDown className="w-3 h-3 inline mr-1" />
                                    Sort by Name
                                </button>
                                <button className="px-3 py-1.5 text-xs text-slate-600 hover:bg-white rounded-lg transition-colors border border-slate-200">
                                    <BarChart3 className="w-3 h-3 inline mr-1" />
                                    Sort by Score
                                </button>
                            </div>
                        </div>
                    </div>

                    {/*- Scrollable table container --> */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            {/*<!-- Table header --> */}
                            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10">
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-semibold">
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4 text-center">Test</th>
                                    <th className="px-6 py-4 text-center">Exam</th>
                                    <th className="px-6 py-4 text-center">Assignment</th>
                                    <th className="px-6 py-4 text-center">Project</th>
                                    <th className="px-6 py-4 text-center">Total</th>
                                    <th className="px-6 py-4 text-center">Grade</th>
                                    <th className="px-6 py-4 text-center">Rank</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            {/*<!-- Table body with student records --> */}
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {resultsMock.map((resultItem) => (
                                    <tr className="hover:bg-purple-50/50 transition-colors" key={resultItem.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Student" className="w-10 h-10 rounded-full border-2 border-slate-200" width={10} height={10} />
                                                <span className="font-semibold text-slate-900">{resultItem.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{resultItem.studentId}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.ca1}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.ca2}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.project}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{resultItem.exam}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-bold text-purple-600">{resultItem.average}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`grade-badge inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-md`}>
                                                {resultItem.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-slate-300 to-slate-400 text-slate-700 font-bold text-sm shadow-md">
                                                {resultItem.position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/results/${resultItem.studentId}`} className="text-purple-600 hover:text-purple-700 font-medium text-sm">View</Link>
                                                <button className="text-slate-400 hover:text-slate-600">
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Score distribution chart card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">Score Distribution</h3>
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                        </div>
                    </div>
                    {/* Chart container with fixed height */}
                    <div className="h-64 overflow-hidden">
                        <canvas id="scoreDistributionChart"></canvas>
                    </div>
                </div>

                {  /* Main results table and analytics section --*/}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Grade breakdown card */}
                    <GradeBreakdown />

                    {/*<!-- Class insights card --> */}
                    <ClassInsights />
                </div>

            </div>
        </>
    )
}


export default Page;