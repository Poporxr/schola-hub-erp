import { Filter, MoreHorizontal, Search } from "lucide-react"
import Pagination from "../Pagination"
import Image from "next/image"
import { students } from "@/utils/students"
import Link from "next/link";
import { role } from "@/lib/utils";
import { DeleteButton } from "../buttons/DeleteButton";

const ClassStudent = () => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col gap-4">
                <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Students List</h2>
                    <p className="text-sm text-gray-500">28 students enrolled</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-gray-200">
                {students.map((student) => (
                    <div className="p-4 hover:bg-gray-50" key={student.studentId}>
                        <div className="flex items-start gap-3 mb-3">
                            <Image src={student.image} alt={student.name} className="w-12 h-12 rounded-full object-cover shrink-0" width={10} height={10} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="text-sm font-semibold text-gray-900">{student.name}</h3>
                                    <span className="text-xs font-mono text-gray-500">{student.studentId}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{student.email}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span>{student.gender}</span>
                                    <span>{student.phone}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                                    <div className="bg-green-500 h-2 rounded-full" ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">96%</span>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/admin/students/${student.studentId}`} className="text-indigo-600 hover:text-indigo-900 text-xs font-medium">View</Link>
                                {role === 'admin' &&<DeleteButton teacher={student} type="student"/>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                        <tr className="hover:bg-gray-50" key={student.studentId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Noah Martinez" className="w-10 h-10 rounded-full object-cover " width={10} height={10} />
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                        <div className="text-xs text-gray-500">{student.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900 font-mono">{student.studentId}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{student.gender}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                                        <div className="bg-yellow-500 h-2 rounded-full" ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">82%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link href={`/teacher/students/${student.studentId}`} className="text-indigo-600 hover:text-indigo-900 mr-3">View</Link>
                                {role === 'admin' && <DeleteButton teacher={student} type="student"/>}
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination />
        </div>
    )
};

export default ClassStudent;