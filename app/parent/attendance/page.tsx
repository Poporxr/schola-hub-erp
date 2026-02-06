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
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Attendance Records</h3>
                        <p className="text-sm text-gray-500">View your children's attendance history</p>
                    </div>
                    <Select>
                        <SelectTrigger className="w-[40%] px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                            <SelectValue placeholder="Select Ward" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                            <SelectGroup>
                                <SelectItem className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value="First Term">David Emmanuel</SelectItem>
                                <SelectItem className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value="Second Term">Benita Emmanuel</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <p className="text-xs text-gray-600 font-medium">Present</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">47 Days</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <p className="text-xs text-gray-600 font-medium">Absent</p>
                        </div>
                        <p className="text-2xl font-bold text-red-600">2 Days</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <p className="text-xs text-gray-600 font-medium">Late</p>
                        </div>
                        <p className="text-2xl font-bold text-amber-600">1 Day</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <p className="text-xs text-gray-600 font-medium">Percentage</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">94%</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 border-collapse">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Day</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Time In</th>
                                <th scope="col" className="px-6 py-3">Remarks</th>
                            </tr>
                        </thead>

                        {/* ✅ soft row separators instead of harsh border-b */}
                        <tbody className="divide-y divide-gray-100">
                            <tr className="bg-white hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">Nov 25, 2024</td>
                                <td className="px-6 py-4">Monday</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        Present
                                    </span>
                                </td>
                                <td className="px-6 py-4">07:45 AM</td>
                                <td className="px-6 py-4 text-xs text-gray-500">On time</td>
                            </tr>

                            <tr className="bg-white hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">Nov 22, 2024</td>
                                <td className="px-6 py-4">Friday</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        Present
                                    </span>
                                </td>
                                <td className="px-6 py-4">07:50 AM</td>
                                <td className="px-6 py-4 text-xs text-gray-500">On time</td>
                            </tr>

                            <tr className="bg-white hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">Nov 21, 2024</td>
                                <td className="px-6 py-4">Thursday</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                                        Late
                                    </span>
                                </td>
                                <td className="px-6 py-4">08:15 AM</td>
                                <td className="px-6 py-4 text-xs text-amber-600">Arrived 15 mins late</td>
                            </tr>

                            <tr className="bg-white hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">Nov 20, 2024</td>
                                <td className="px-6 py-4">Wednesday</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        Present
                                    </span>
                                </td>
                                <td className="px-6 py-4">07:40 AM</td>
                                <td className="px-6 py-4 text-xs text-gray-500">On time</td>
                            </tr>

                            <tr className="bg-white hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">Nov 19, 2024</td>
                                <td className="px-6 py-4">Tuesday</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                        Absent
                                    </span>
                                </td>
                                <td className="px-6 py-4">-</td>
                                <td className="px-6 py-4 text-xs text-red-600">Medical appointment</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}

export default Page;