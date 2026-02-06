import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";



const Page = () => {
    return (
        <div className=" space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">My Assigned Classes</h3>
                        <p className="text-sm text-gray-500">Classes you teach this term</p>
                    </div>
                    <div className="flex gap-2">
                      <Select>
                            <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                <SelectValue placeholder="Select a Subject" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                <SelectGroup>
                                    <SelectItem className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value="First Term">Further Maths</SelectItem>
                                    <SelectItem className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value="Second Term">Literature</SelectItem>
                                    <SelectItem className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value="Third Term">Mathematics</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">JSS 2A</h4>
                                <p className="text-sm text-gray-500">Junior Secondary 2</p>
                            </div>
                            <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">Class Teacher</span>
                        </div>
                        <div className="space-y-3 mb-8">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Total Students</span>
                                <span className="font-semibold text-gray-900">42</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Subject</span>
                                <span className="font-semibold text-gray-900">Mathematics</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Weekly Periods</span>
                                <span className="font-semibold text-gray-900">5 Periods</span>
                            </div>
                        </div>
                        <Link href={`/teacher/classes/${243453}`} className="w-full py-2 px-[26%] border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 font-medium text-sm transition-colors">View Class Details</Link>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">JSS 3C</h4>
                                <p className="text-sm text-gray-500">Junior Secondary 3</p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-8">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Total Students</span>
                                <span className="font-semibold text-gray-900">40</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Subject</span>
                                <span className="font-semibold text-gray-900">Mathematics</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Weekly Periods</span>
                                <span className="font-semibold text-gray-900">5 Periods</span>
                            </div>
                        </div>
                        <Link href={`/teacher/classes/${243453}`} className="w-full py-2 px-[26%] text-center  border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 font-medium text-sm transition-colors">View Class Details</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Page