import AffectiveDomain from "@/components/AffectiveDomain";
import PsychomoDomain from "@/components/PsychomotorDomain";
import ResultCardSummary from "@/components/ResultSummaryCard";
import TeacherResultRemark from "@/components/TeacherResultRemark";
import { classes, subjectBreakdown } from "@/utils/students";
import { Calendar, Download, Hash, Printer, School, Sliders, Subscript } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const Page = () => {
    return (
        <div className="">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-purple-600" />
                    Filter Results
                </h3>
                <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    {/*  <!-- Apply filters button --> */}
                    <div className="flex items-end">
                        <button type="submit" className="w-full px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md">
                            Apply Filters
                        </button>
                    </div>
                </form>
            </div>
            <div className="px-6 bg-[#7E2CEE] py-6 rounded-xl mt-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* Student Passport Photo */}
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-50 mb-3">
                            <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Student Profile" className="w-full h-full object-cover" width={50} height={50} />
                        </div>
                        <div>
                            <h1 className="text-3xl text-white/90 font-bold mb-1">Liam Anderson</h1>
                            <div className="lg:flex items-center gap-4 text-white/90 text-sm">
                                <span className="flex items-center gap-1">
                                    <Hash className="w-4 h-4" />
                                    STU-006
                                </span>
                                <span className="flex items-center gap-1">
                                    <School className="w-4 h-4" />
                                    Grade 3A
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Second Term 2023/2024
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <Link href={`/print/${3394}`} className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-2">
                            <Printer className="w-4 h-4" />
                            Print Result
                        </Link>
                        <button className="px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
            <ResultCardSummary />
            <div className="grid grid-cols-1 gap-6 mt-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-100 bg-linear-to-r from-purple-50 to-indigo-50">
                        <h3 className="font-bold text-slate-900 text-lg">Subject Performance Breakdown</h3>
                        <p className="text-sm text-slate-600 mt-1">Detailed scores across all subjects</p>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10">
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-semibold">
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4 text-center">Tests</th>
                                    <th className="px-6 py-4 text-center">Assignments</th>
                                    <th className="px-6 py-4 text-center">Exam</th>
                                    <th className="px-6 py-4 text-center">Total</th>
                                    <th className="px-6 py-4 text-center">Grade</th>
                                    <th className="px-6 py-4">Teacher</th>
                                    <th className="px-6 py-4 text-center">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">

                                {subjectBreakdown.map((subject) => (
                                    <tr className="hover:bg-purple-50/50 transition-colors" key={subject.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                                    <Subscript className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold text-slate-900">{subject.subject} </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{subject.tests} </td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{subject.assignments}</td>
                                        <td className="px-6 py-4 text-center font-semibold text-slate-900">{subject.exam}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-bold text-purple-600">{subject.total}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="grade-badge inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-md">{subject.grade}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-xs">{subject.teacher}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <i data-lucide="trending-up" className="w-4 h-4 perf-excellent"></i>
                                                <span className="text-xs font-medium perf-excellent">{subject.performance.label}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-6">
                <AffectiveDomain />
                <PsychomoDomain />
            </div>
            <TeacherResultRemark />
        </div>
    )
}
export default Page;