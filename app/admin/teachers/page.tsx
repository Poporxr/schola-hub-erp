import Pagination from "@/components/Pagination";
import { CalendarCheck, Edit2, Eye, Plus, Search, UserCheck, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import { StudentRow } from "@/utils/types";
import { classes, students, teachers } from "@/utils/students";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import FormButton from "@/components/buttons/FormButton";

export default function page() {
    return (
        <div className="">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">248</h3>
                    <p className="text-sm text-gray-500">Total Teachers</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">186</h3>
                    <p className="text-sm text-gray-500">Active Teachers</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">48</h3>
                    <p className="text-sm text-gray-500">New This Month</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <CalendarCheck className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">94%</h3>
                    <p className="text-sm text-gray-500">Attendance Rate</p>
                </div>
            </div>

            {/* <!-- Students Table -->*/}
            <div className="bg-white  rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">All Teacher</h3>
                        <FormButton type={"teacher"} action="create"/>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                        <Select>
                            <SelectTrigger className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="All Classes" />
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
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full ">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Class</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {teachers.map((teacher) => (
                                <tr className="hover:bg-gray-50" key={teacher.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Student" className="w-10 h-10 rounded-full object-cover" width={20} height={20} />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{teacher.name}</p>
                                                <p className="text-[10px] text-gray-500">{teacher.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{teacher.department}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{teacher.class}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{teacher.gender}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold ${teacher.status === "Active" ? 'text-green-700 bg-green-100 ' : "text-red-700 bg-red-100 " }rounded-full`} >{teacher.status}</span>
                                    </td>
                                    <td className="px-6 py-6 grid grid-cols-2">
                                        <Link href={`/admin/teachers/${24334}`} className="text-slate-400 hover:text-indigo-600"><Eye className="w-4 h-4"/></Link>
                                        <button className="text-slate-400 hover:text-blue-600 mx-1"><Edit2 className="w-4 h-4" /> </button>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>
                <Pagination />
            </div>
        </div>
    )
}

