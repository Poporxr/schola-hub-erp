import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AlertCircle, AlertTriangle, CheckCircle, CreditCard, FileText } from "lucide-react"

const wards = [
    { id: '1', name: 'Benita Emmanuel', class: "jss3B" },
    { id: '2', name: 'David Emmanuel', class: 'ss3 F' }
]


const Page = () => {
    return (
        <>
            <div className="space-y-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Fees & Payments</h3>
                            <p className="text-sm text-gray-500">Manage school fees and payment history</p>
                        </div>
                        <Select >
                            <SelectTrigger className="w-[40%] px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                <SelectValue placeholder="Select Ward" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                <SelectGroup >
                                    {wards.map((ward) => {
                                        return (
                                            <SelectItem key={ward.id} className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value={ward.id}>{`${ward.name}  (${ward.class})`}</SelectItem>
                                        )
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <p className="text-sm text-gray-600 font-medium">Total Fee</p>
                            </div>
                            <p className="text-3xl font-bold text-blue-600">₦150,000</p>
                            <p className="text-xs text-gray-500 mt-1">Term 2, 2024</p>
                        </div>
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="text-sm text-gray-600 font-medium">Amount Paid</p>
                            </div>
                            <p className="text-3xl font-bold text-green-600">₦105,000</p>
                            <p className="text-xs text-gray-500 mt-1">70% paid</p>
                        </div>
                        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <p className="text-sm text-gray-600 font-medium">Balance</p>
                            </div>
                            <p className="text-3xl font-bold text-red-600">₦45,000</p>
                            <p className="text-xs text-gray-500 mt-1">Due: Dec 20, 2024</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-amber-900 mb-1">Payment Reminder</h4>
                            <p className="text-sm text-amber-700">Outstanding balance of ₦45,000 is due by December 20, 2024. Please make payment to avoid late fees.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                {/* ===== Fee Breakdown Card ===== */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="text-base font-semibold text-slate-900">Fee Breakdown</h4>
                                <p className="text-sm text-slate-500">All fee items for this term and their payment status</p>
                            </div>

                            {/* optional: summary badge */}
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Outstanding</p>
                                <p className="text-sm font-semibold text-red-600">₦45,000</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600 border-collapse">
                            <thead className="text-xs uppercase tracking-wider text-slate-500 bg-white">
                                <tr className="border-b border-slate-100">
                                    <th scope="col" className="px-6 py-3">Fee Item</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>

                            {/* ✅ soft separators (no harsh black border) */}
                            <tbody className="divide-y divide-slate-100">
                                <tr className="bg-white hover:bg-slate-50/60">
                                    <td className="px-6 py-4 font-medium text-slate-900">Tuition Fee</td>
                                    <td className="px-6 py-4 text-right font-semibold text-slate-900">₦80,000</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                            Paid
                                        </span>
                                    </td>
                                </tr>

                                <tr className="bg-white hover:bg-slate-50/60">
                                    <td className="px-6 py-4 font-medium text-slate-900">Development Levy</td>
                                    <td className="px-6 py-4 text-right font-semibold text-slate-900">₦25,000</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                            Paid
                                        </span>
                                    </td>
                                </tr>

                                <tr className="bg-white hover:bg-slate-50/60">
                                    <td className="px-6 py-4 font-medium text-slate-900">Sports & Activities</td>
                                    <td className="px-6 py-4 text-right font-semibold text-slate-900">₦15,000</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                                            Pending
                                        </span>
                                    </td>
                                </tr>

                                <tr className="bg-white hover:bg-slate-50/60">
                                    <td className="px-6 py-4 font-medium text-slate-900">Textbooks & Materials</td>
                                    <td className="px-6 py-4 text-right font-semibold text-slate-900">₦20,000</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                                            Pending
                                        </span>
                                    </td>
                                </tr>

                                <tr className="bg-white hover:bg-slate-50/60">
                                    <td className="px-6 py-4 font-medium text-slate-900">Uniform</td>
                                    <td className="px-6 py-4 text-right font-semibold text-slate-900">₦10,000</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                                            Pending
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer CTA */}
                    <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm text-slate-600">
                            Pay outstanding balance to avoid late penalties.
                        </p>

                        <button className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors inline-flex items-center gap-2 shadow-sm">
                            <CreditCard className="w-5 h-5" />
                            Pay ₦45,000 Now
                        </button>
                    </div>
                </section>

                {/* ===== Payment History Card ===== */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                        <h4 className="text-base font-semibold text-slate-900">Payment History</h4>
                        <p className="text-sm text-slate-500">Recent payments made for this student/term</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600 border-collapse">
                            <thead className="text-xs uppercase tracking-wider text-slate-500 bg-white">
                                <tr className="border-b border-slate-100">
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Reference</th>
                                    <th scope="col" className="px-6 py-3">Description</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-right">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Receipt</th>
                                </tr>
                            </thead>

                            {/* ✅ soft row separators */}
                            <tbody className="divide-y divide-slate-100">
                                <tr className="bg-white hover:bg-slate-50/60">
                                    <td className="px-6 py-4">Nov 15, 2024</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">PAY-2024-1115-089</td>
                                    <td className="px-6 py-4">Tuition Fee Payment</td>
                                    <td className="px-6 py-4 text-right font-semibold text-slate-900">₦80,000</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                            Confirmed
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-purple-600 hover:text-purple-700 text-xs font-semibold">
                                            Download
                                        </button>
                                    </td>
                                </tr>

                                <tr className="bg-white hover:bg-slate-50/60">
                                    <td className="px-6 py-4">Nov 10, 2024</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">PAY-2024-1110-067</td>
                                    <td className="px-6 py-4">Development Levy</td>
                                    <td className="px-6 py-4 text-right font-semibold text-slate-900">₦25,000</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                            Confirmed
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-purple-600 hover:text-purple-700 text-xs font-semibold">
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>

    )
}

export default Page;