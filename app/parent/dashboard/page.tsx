import AttendanceDonut from "@/components/AttendanceDonut";
import { AlertCircle, CalendarCheck, CalendarDays, ChevronRight, CreditCard, Download, Megaphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Attendance = {
    name: string,
    present: number,
    absent: number,
    late: number
}

const attendance: Attendance[] = [{
    name: "David Emmanuel",
    present: 60,
    absent: 12,
    late: 3,
}, {
    name: "Benita Emmanuel",
    present: 66,
    absent: 8,
    late: 4,
}
]
const Page = () => {
    return (
        <div className=" active space-y-6">
            <div className="bg-linear-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold mb-2">Welcome Back, Mr. Okafor! 👋</h1>
                <p className="text-purple-100">Your children are doing great this term. Check their progress below.</p>
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Children</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="child-card bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-purple-50">
                                <Image width={50} height={50} src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Student" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg">David Emmanuel</h4>
                                <p className="text-sm text-gray-500">JSS 2A • Admission No: JSS2A/2024/015</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">Active Student</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Attendance</p>
                                <p className="text-lg font-bold text-green-600">94%</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Fee Balance</p>
                                <p className="text-lg font-bold text-orange-600">₦45,000</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Last Result</p>
                                <p className="text-lg font-bold text-purple-600">82.5%</p>
                            </div>
                        </div>
                    </div>

                    <div className="child-card bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-purple-50">
                                <Image width={50} height={50} src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Student" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg">Benita Emmanuel</h4>
                                <p className="text-sm text-gray-500">SS 1B • Admission No: SS1B/2024/022</p>
                                <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">Active Student</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Attendance</p>
                                <p className="text-lg font-bold text-green-600">96%</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Fee Balance</p>
                                <p className="text-lg font-bold text-red-600">₦78,500</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Last Result</p>
                                <p className="text-lg font-bold text-purple-600">88.2%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Recent Announcements</h3>
                        <button className="text-sm text-purple-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-4 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg h-fit">
                                <Megaphone className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900">Mid-Term Break Announcement</h4>
                                    <span className="text-xs text-gray-500">2 days ago</span>
                                </div>
                                <p className="text-sm text-gray-600">School will close for mid-term break on December 15th and resume on January 8th, 2025. Please ensure all outstanding fees are cleared before the break.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                                <CalendarDays className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900">Parent-Teacher Meeting</h4>
                                    <span className="text-xs text-gray-500">5 days ago</span>
                                </div>
                                <p className="text-sm text-gray-600">The next parent-teacher meeting is scheduled for December 10th at 10:00 AM. All parents are encouraged to attend to discuss their children's progress.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg h-fit">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900">Fee Payment Reminder</h4>
                                    <span className="text-xs text-gray-500">1 week ago</span>
                                </div>
                                <p className="text-sm text-gray-600">Reminder: Term 2 fees are due by December 20th. Please make payments through the parent portal or visit the bursary office.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                            <div className="p-2 bg-purple-600 text-white rounded-lg">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <Link href={'/parent/payments'} className="flex-1 text-left">
                                <p className="font-semibold text-gray-900 text-sm">Pay School Fees</p>
                                <p className="text-xs text-gray-500">Make payment online</p>
                            </Link>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            <div className="p-2 bg-blue-600 text-white rounded-lg">
                                <Download className="w-5 h-5" />
                            </div>
                            <Link href={"/parent/results"} className="flex-1 text-left">
                                <p className="font-semibold text-gray-900 text-sm">Download Results</p>
                                <p className="text-xs text-gray-500">View report cards</p>
                            </Link>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                            <div className="p-2 bg-green-600 text-white rounded-lg">
                                <CalendarCheck className="w-5 h-5" />
                            </div>
                            <Link href={'/parent/attendance'} className="flex-1 text-left">
                                <p className="font-semibold text-gray-900 text-sm">View Attendance</p>
                                <p className="text-xs text-gray-500">Check attendance records</p>
                            </Link>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {
                    attendance.map((att) => (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" key={att.late}>
                            <h3 className="font-bold text-gray-900 mb-4">{att.name} (This Month)</h3>
                            <div className="h-64 overflow-hidden">
                                <AttendanceDonut present={att.present} absent={att.absent} late={att.late} />
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
export default Page;