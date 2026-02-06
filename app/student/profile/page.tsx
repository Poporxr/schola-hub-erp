import Image from "next/image"

const Page = () => {
    return (
        <div className=" space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-600"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                            <Image width={50} height={50} alt="" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Full Name</label>
                                    <p className="text-gray-900 font-medium">Alex Johnson</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Student ID</label>
                                    <p className="text-gray-900 font-medium">2024056</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                                    <p className="text-gray-900 font-medium">March 15, 2006</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
                                    <p className="text-gray-900 font-medium">alex.j@student.edu</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Academic Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Class / Grade</label>
                                    <p className="text-gray-900 font-medium">Grade 12 - Section B</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Enrollment Date</label>
                                    <p className="text-gray-900 font-medium">September 01, 2022</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Guardian Name</label>
                                    <p className="text-gray-900 font-medium">Robert Johnson</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Guardian Contact</label>
                                    <p className="text-gray-900 font-medium">+1 (555) 123-4567</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Page;