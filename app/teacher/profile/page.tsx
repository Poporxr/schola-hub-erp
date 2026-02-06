const Page = () => {
    return(
        
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="h-32 bg-linear-to-r from-teal-500 to-emerald-600"></div>
                        <div className="px-6 pb-6">
                            <div className="relative flex justify-between items-end -mt-12 mb-6">
                                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover"/>
                                </div>
                                <span className="px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200">Active Staff</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Full Name</label>
                                            <p className="text-gray-900 font-medium">Mrs. Adebayo Funke Oluwaseun</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Staff ID</label>
                                            <p className="text-gray-900 font-medium">TCH-2024-089</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                                            <p className="text-gray-900 font-medium">June 12, 1988</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Email Address</label>
                                            <p className="text-gray-900 font-medium">funke.adebayo@school.edu.ng</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                                            <p className="text-gray-900 font-medium">+234 803 456 7890</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Address</label>
                                            <p className="text-gray-900 font-medium">15 Ogunlana Drive, Surulere, Lagos</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Employment Details</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Position</label>
                                            <p className="text-gray-900 font-medium">Senior Mathematics Teacher</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Department</label>
                                            <p className="text-gray-900 font-medium">Mathematics & Sciences</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Employment Date</label>
                                            <p className="text-gray-900 font-medium">September 15, 2018</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Years of Service</label>
                                            <p className="text-gray-900 font-medium">6 Years</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Qualification</label>
                                            <p className="text-gray-900 font-medium">B.Ed Mathematics, M.Sc Mathematics Education</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Subjects Taught</label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">Mathematics</span>
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">Further Mathematics</span>
                                                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">Basic Science</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Class Teacher</label>
                                            <p className="text-gray-900 font-medium">JSS 2A</p>
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