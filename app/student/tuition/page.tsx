import { Check, CreditCard } from "lucide-react";

const Page = () => {
    return (
        <div className=" space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Invoice Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Term 2 Tuition Fee</h3>
                            <p className="text-sm text-gray-500">Invoice #INV-2024-001</p>
                        </div>
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Unpaid</span>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tuition Fee</span>
                            <span className="font-medium text-gray-900">$400.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Library Fee</span>
                            <span className="font-medium text-gray-900">$30.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Lab Charges</span>
                            <span className="font-medium text-gray-900">$20.00</span>
                        </div>
                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total Due</span>
                            <span className="font-bold text-2xl text-indigo-600">$450.00</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <p className="text-xs text-gray-500 mb-1">Due Date</p>
                        <p className="font-medium text-gray-900">October 01, 2024</p>
                    </div>

                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Pay Now
                    </button>
                </div>

                {/*Payment History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6">Payment History</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Term 1 Tuition</p>
                                    <p className="text-xs text-gray-500">Paid on Aug 15, 2024</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900">$450.00</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <Check className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Sports Kit Fee</p>
                                    <p className="text-xs text-gray-500">Paid on Jul 10, 2024</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900">$85.00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page;