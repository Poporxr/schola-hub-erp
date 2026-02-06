import { Calculator, FlaskConical, FunctionSquare } from "lucide-react";

const Page = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">My Teaching Subjects</h3>
                        <p className="text-sm text-gray-500">Subjects assigned to you this term</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
                                <Calculator className="w-6 h-6"/>
                            </div>
                            <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">Core Subject</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-2">Mathematics</h4>
                        <p className="text-sm text-gray-500 mb-4">General Mathematics for Junior & Senior Secondary</p>
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Classes Assigned</span>
                                <span className="font-semibold text-gray-900">3 Classes</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Total Students</span>
                                <span className="font-semibold text-gray-900">117 Students</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Weekly Periods</span>
                                <span className="font-semibold text-gray-900">14 Periods</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Classes:</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">JSS 2A</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">JSS 3C</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">SS 1B</span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <FunctionSquare className="w-6 h-6"/>
                            </div>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">Elective</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-2">Further Mathematics</h4>
                        <p className="text-sm text-gray-500 mb-4">Advanced Mathematics for Senior Secondary</p>
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Classes Assigned</span>
                                <span className="font-semibold text-gray-900">2 Classes</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Total Students</span>
                                <span className="font-semibold text-gray-900">70 Students</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Weekly Periods</span>
                                <span className="font-semibold text-gray-900">6 Periods</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Classes:</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">SS 2B</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">SS 3A</span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <FlaskConical className="w-6 h-6"/>
                            </div>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">Core Subject</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-2">Basic Science</h4>
                        <p className="text-sm text-gray-500 mb-4">Introductory Science for Junior Secondary</p>
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Classes Assigned</span>
                                <span className="font-semibold text-gray-900">1 Class</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Total Students</span>
                                <span className="font-semibold text-gray-900">42 Students</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Weekly Periods</span>
                                <span className="font-semibold text-gray-900">4 Periods</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Classes:</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">JSS 2A</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Page;