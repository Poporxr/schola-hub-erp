import BackButton from "@/components/BackButton";
import Image from "next/image";

const Page = () => {
    return (
        <div>
            <BackButton />
            <div className="pb-8 pt-5">
                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
                    <div className="md:flex md:items-start gap-6">
                        <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Teacher" className="w-32 h-32 rounded-full object-cover border-4 border-purple-100" width={50} height={50} />
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Dr. Sarah Williams</h3>
                                        <p className="text-gray-500 mb-2">Teacher ID: TCH-001</p>
                                        <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Active Teacher</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Subject</p>
                                        <p className="text-sm font-semibold text-gray-900">Mathematics</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Experience</p>
                                        <p className="text-sm font-semibold text-gray-900">12 Years</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                                        <p className="text-sm font-semibold text-gray-900">+1 234 567 9001</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Email</p>
                                        <p className="text-sm font-semibold text-gray-900">sarah.w@school.edu</p>
                                    </div>
                                </div>
                            </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Assigned Subjects</h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="font-semibold text-gray-900">Mathematics - Grade 5</p>
                                <p className="text-xs text-gray-500 mt-1">28 Students</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="font-semibold text-gray-900">Mathematics - Grade 6</p>
                                <p className="text-xs text-gray-500 mt-1">30 Students</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <p className="font-semibold text-gray-900">Advanced Mathematics - Grade 7</p>
                                <p className="text-xs text-gray-500 mt-1">25 Students</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Assigned Classes</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900">Grade 5-A</p>
                                    <p className="text-xs text-gray-500">Mon, Wed, Fri • 9:00 AM</p>
                                </div>
                                <span className="text-sm font-medium text-gray-700">28 Students</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900">Grade 6-B</p>
                                    <p className="text-xs text-gray-500">Tue, Thu • 10:30 AM</p>
                                </div>
                                <span className="text-sm font-medium text-gray-700">30 Students</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900">Grade 7-A</p>
                                    <p className="text-xs text-gray-500">Mon, Wed, Fri • 1:00 PM</p>
                                </div>
                                <span className="text-sm font-medium text-gray-700">25 Students</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;