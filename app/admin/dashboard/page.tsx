import AdminCharts from "@/components/AdminCharts";
import Image from "next/image";
import {
  Users,
  Presentation,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  UserPlus,
  DollarSign,
  FileText,
} from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Welcome back, Admin. 👋</h1>
          <p className="text-indigo-100 max-w-xl">The performance of  <span className="font-semibold text-white">Students</span> this session is<span className="font-semibold text-white"> Very Impressive </span>.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
          <i data-lucide="book-open" className="w-64 h-64"></i>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">2,450</h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +4.5%
            </span>
            <span className="text-slate-400 ml-2">vs last month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Teachers</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">145</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Presentation className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +2.1%
            </span>
            <span className="text-slate-400 ml-2">vs last month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Attendance Today</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">94.2%</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 font-medium flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> -0.8%
            </span>
            <span className="text-slate-400 ml-2">vs yesterday</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Fees Collected</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">$124k</h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
            <span className="text-slate-400 ml-2">vs last term</span>
          </div>
        </div>
      </div>
      <AdminCharts />
      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="px-6 py-4 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">New exam results published</p>
              <p className="text-xs text-slate-500 mt-1">Grade 10 - Mathematics Term 2</p>
              <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="px-6 py-4 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Fee payment received</p>
              <p className="text-xs text-slate-500 mt-1">John Doe (Class 5A) - $450.00</p>
              <p className="text-xs text-slate-400 mt-1">4 hours ago</p>
            </div>
          </div>
          <div className="px-6 py-4 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">New student admission</p>
              <p className="text-xs text-slate-500 mt-1">Sarah Smith admitted to Class 1B</p>
              <p className="text-xs text-slate-400 mt-1">Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}