const Page = () => {
    return (

        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-linear-to-r from-purple-500 to-indigo-600"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
                        </div>
                        <span className="px-4 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg border border-purple-200">Parent Account</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Full Name</label>
                                    <p className="text-gray-900 font-medium">Mr. Okafor Emmanuel Chukwuma</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Relationship</label>
                                    <p className="text-gray-900 font-medium">Father</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Email Address</label>
                                    <p className="text-gray-900 font-medium">emmanuel.okafor@email.com</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                                    <p className="text-gray-900 font-medium">+234 802 345 6789</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Alternative Phone</label>
                                    <p className="text-gray-900 font-medium">+234 803 456 7890</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Home Address</label>
                                    <p className="text-gray-900 font-medium">23 Independence Layout, Enugu, Enugu State</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Linked Students</h3>
                            <div className="space-y-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-100">
                                            <img src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Okafor Chidinma</h4>
                                            <p className="text-xs text-gray-500">JSS 2A • Admission No: JSS2A/2024/015</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-500">Class:</span>
                                            <span className="font-medium text-gray-900"> JSS 2A</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Status:</span>
                                            <span className="font-medium text-green-600"> Active</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-100">
                                            <img src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Okafor Chukwuemeka</h4>
                                            <p className="text-xs text-gray-500">SS 1B • Admission No: SS1B/2024/022</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-500">Class:</span>
                                            <span className="font-medium text-gray-900"> SS 1B</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Status:</span>
                                            <span className="font-medium text-green-600"> Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Contact</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase">Contact Name</label>
                                        <p className="text-gray-900 font-medium">Mrs. Okafor Ngozi</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase">Relationship</label>
                                        <p className="text-gray-900 font-medium">Mother</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                                        <p className="text-gray-900 font-medium">+234 805 678 9012</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Page