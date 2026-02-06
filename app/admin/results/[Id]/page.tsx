import AffectiveDomain from "@/components/AffectiveDomain";
import BackButton from "@/components/BackButton";
import PsychomoDomain from "@/components/PsychomotorDomain";
import ResultCardSummary from "@/components/ResultSummaryCard";
import TeacherResultRemark from "@/components/TeacherResultRemark";
import { subjectBreakdown } from "@/utils/students";
import { Calendar, Download, Hash, Printer, School, Subscript } from "lucide-react";
import Image from "next/image";
import Link from "next/link";



const Page = () => {
    return (

        <div className="space-y-6 max-w-400 mx-auto w-full">
            <BackButton />
            <div className="px-6 bg-[#7E2CEE] py-6 rounded-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* Student Passport Photo */}
                        <Image src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Student" className="w-20 h-20 rounded-xl border-4 border-white/30 shadow-lg" width={15} height={15} />
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
            <div className="grid grid-cols-1 gap-6">
                {/* Subject Breakdown Table (2 columns) */}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AffectiveDomain />
                <PsychomoDomain />
            </div>
            <TeacherResultRemark />
        </div>

    )
}
export default Page;