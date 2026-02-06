import { AlertCircle, AlertTriangle, BookOpen, CalendarDays, Clock, Info, Megaphone, UserCheck, Users } from "lucide-react";
import Link from "next/link";

const Page = ( ) => {
    return (
                      <div id="dashboard" className="tab-content active space-y-6">
                    <div className="bg-linear-to-r from-teal-600 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
                        <h1 className="text-2xl font-bold mb-2">Good Morning, Mrs. Funke! 👋</h1>
                        <p className="text-teal-100">You have <span className="font-semibold text-white">3 classes</span> today and <span className="font-semibold text-white">2 pending attendance</span> records to mark.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">Total Classes</h3>
                                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Users className="w-4 h-4"/>
                                </span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">5</span>
                                <span className="text-sm text-gray-500 mb-1">Classes</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
                                <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <UserCheck className="w-4 h-4"/>
                                </span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">187</span>
                                <span className="text-sm text-gray-500 mb-1">Students</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">Subjects Taught</h3>
                                <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                                    <BookOpen className="w-4 h-4"/>
                                </span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">3</span>
                                <span className="text-sm text-gray-500 mb-1">Subjects</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">Pending Tasks</h3>
                                <span className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <AlertCircle className="w-4 h-4"/>
                                </span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">4</span>
                                <span className="text-sm text-orange-600 mb-1">Action Needed</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900">Today's Timetable</h3>
                                <span className="text-sm text-gray-500">Monday, Nov 25, 2024</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start pb-4 border-b border-gray-50">
                                    <div className="w-20 text-sm font-semibold text-gray-500 pt-1">08:00 AM</div>
                                    <div className="flex-1 bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
                                        <h4 className="font-bold text-teal-900">Mathematics</h4>
                                        <p className="text-sm text-teal-700 mt-1">JSS 2A • 42 Students • Room 204</p>
                                        <Link href={'/teacher/attendance'} className="mt-2 text-xs text-teal-600 font-medium hover:underline">Mark Attendance →</Link>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start pb-4 border-b border-gray-50">
                                    <div className="w-20 text-sm font-semibold text-gray-500 pt-1">10:30 AM</div>
                                    <div className="flex-1 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                        <h4 className="font-bold text-blue-900">Further Mathematics</h4>
                                        <p className="text-sm text-blue-700 mt-1">SS 2B • 38 Students • Room 301</p>
                                      <Link href={'/teacher/attendance'} className="mt-2 text-xs text-blue-600 font-medium hover:underline">Mark Attendance →</Link>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-20 text-sm font-semibold text-gray-500 pt-1">02:00 PM</div>
                                    <div className="flex-1 bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                                        <h4 className="font-bold text-purple-900">Mathematics</h4>
                                        <p className="text-sm text-purple-700 mt-1">JSS 3C • 40 Students • Room 205</p>
                                        <Link href={'/teacher/attendance'} className="mt-2 text-xs text-purple-600 font-medium hover:underline">Mark Attendance →</Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-6">Pending Tasks</h3>
                            <div className="space-y-4">
                                <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                                    <div className="flex items-start justify-between mb-1">
                                        <span className="text-xs font-semibold text-orange-600 uppercase">Urgent</span>
                                        <AlertTriangle className="w-4 h-4 text-orange-500"/>
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium">Mark attendance for JSS 2A (Nov 24)</p>
                                    <Link href={'/teacher/attendance'} className="mt-2 text-xs text-orange-600 font-medium hover:underline">Complete Now →</Link>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                    <div className="flex items-start justify-between mb-1">
                                        <span className="text-xs font-semibold text-blue-600 uppercase">Due Soon</span>
                                        <Clock className="w-4 h-4 text-blue-500"/>
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium">Upload SS 2B Mid-Term Results</p>
                                    <button className="mt-2 text-xs text-blue-600 font-medium hover:underline">Enter Results →</button>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                                    <div className="flex items-start justify-between mb-1">
                                        <span className="text-xs font-semibold text-gray-600 uppercase">Reminder</span>
                                        <Info className="w-4 h-4 text-gray-500"/>
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium">Staff meeting on Friday 3PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-6">Recent Announcements</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4 pb-4 border-b border-gray-100">
                                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg h-fit">
                                    <Megaphone className="w-5 h-5"/>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-1">
                                        <h4 className="font-semibold text-gray-900">Mid-Term Examination Schedule Released</h4>
                                        <span className="text-xs text-gray-500">2 days ago</span>
                                    </div>
                                    <p className="text-sm text-gray-600">The mid-term examination timetable for Term 2 has been published. Please check the staff portal for details.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                                    <CalendarDays className="w-5 h-5"/>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-1">
                                        <h4 className="font-semibold text-gray-900">Professional Development Workshop</h4>
                                        <span className="text-xs text-gray-500">5 days ago</span>
                                    </div>
                                    <p className="text-sm text-gray-600">All teaching staff are invited to attend the ICT integration workshop on December 5th. Registration is mandatory.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    )
}

export default Page;