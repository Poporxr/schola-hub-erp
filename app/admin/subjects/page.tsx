import FormButton from "@/components/buttons/FormButton";
import Pagination from "@/components/Pagination";
import { Book, BookOpen, Calculator, CheckCircle, Clock, Dumbbell, FlaskConical, Landmark, Palette, Plus, Users } from "lucide-react";

const Page = () => {
    return (
        <div>
            <div className="">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">32</h3>
                        <p className="text-sm text-gray-500">Total Subjects</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">28</h3>
                        <p className="text-sm text-gray-500">Active Subjects</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">86</h3>
                        <p className="text-sm text-gray-500">Assigned Teachers</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">240</h3>
                        <p className="text-sm text-gray-500">Total Hours/Week</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">All Subjects</h3>
                        <FormButton type={"subject"} action="create"/>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Class Level</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Assigned Teacher</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Calculator className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">Mathematics</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Grade 5</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Dr. Sarah Williams</td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <FlaskConical className="w-5 h-5 text-green-600" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">Science</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Grade 6</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Prof. John Anderson</td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Book className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">English</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Grade 4</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Ms. Emily Davis</td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <Landmark className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">History</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Grade 7</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Mr. Robert Taylor</td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                                <Palette className="w-5 h-5 text-pink-600" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">Art</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Grade 5</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Ms. Lisa Thompson</td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                <Dumbbell className="w-5 h-5 text-red-600" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">Physical Education</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">All Grades</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Coach Mike Brown</td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                  <Pagination />
                </div>
            </div>
        </div>
    )
}

export default Page;