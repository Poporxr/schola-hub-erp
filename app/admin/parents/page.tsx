import Image from "next/image";
import {
    Mail,
    Download,
    Plus,
    Search,
    Phone,
    MoreHorizontal,
    Users,
    AlertCircle,
    Wallet,
    TrendingUp,
    ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { classes, parentsMock } from "@/utils/students";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


const Page = () => {
    return (
        <div className="flex-1 overflow-y-auto space-y-3">
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Main List Area */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Parents</h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Manage parent records and communications
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Message
                            </button>

                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-indigo-50 flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>

                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                                <Plus className="w-4 h-4" />
                                Add Parent
                            </button>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900 mb-5">
                            Overview
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Total Parents */}
                            <div className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-slate-500">
                                        Total Parents
                                    </p>
                                    <Users className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                </div>

                                <p className="mt-3 text-3xl font-bold text-slate-900">
                                    452
                                </p>
                            </div>

                            {/* Parents Owing */}
                            <div className="group cursor-pointer rounded-xl border border-red-200 bg-red-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-red-600">
                                        Parents Owing
                                    </p>
                                    <AlertCircle className="h-4 w-4 text-red-400 group-hover:text-red-600" />
                                </div>

                                <div className="mt-3 flex items-end justify-between">
                                    <p className="text-3xl font-bold text-red-700">
                                        87
                                    </p>

                                    <span className="rounded-full border border-red-200 bg-white px-2 py-0.5 text-xs font-semibold text-red-600">
                                        19%
                                    </span>
                                </div>
                            </div>

                            {/* Total Outstanding */}
                            <div className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-slate-500">
                                        Total Outstanding
                                    </p>
                                    <Wallet className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                                </div>

                                <p className="mt-3 text-2xl font-bold text-slate-900">
                                    ₦4.2M
                                </p>
                            </div>

                            {/* Collected */}
                            <div className="group cursor-pointer rounded-xl border border-green-200 bg-green-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-green-600">
                                        Collected This Term
                                    </p>
                                    <TrendingUp className="h-4 w-4 text-green-400 group-hover:text-green-600" />
                                </div>

                                <p className="mt-3 text-2xl font-bold text-green-700">
                                    ₦18.5M
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search name, phone, email..."
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <Select >
                                <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                    <SelectValue placeholder="Select a Class" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                    <SelectGroup >
                                        {classes.map((classItem) => {
                                            return (
                                                <SelectItem key={classItem.id} className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value={classItem.id}>{`Class ${classItem.name}`}</SelectItem>
                                            )
                                        })}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            
                            <Select>
                                <SelectTrigger className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                    <SelectValue placeholder="Payment Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                    <SelectGroup>
                                        <SelectItem className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value="First Term">Paid</SelectItem>
                                        <SelectItem className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value="Second Term">Owing</SelectItem>
                                        <SelectItem className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black" value="Third Term">Partial</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <div className="flex gap-2">
                                <button className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100">
                                    Apply
                                </button>
                                <button className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50">
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Parent Name
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Students
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                                            Balance
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                                            Last Payment
                                        </th>
                                        <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {parentsMock.map((parent) => (
                                        <tr key={parent.id} className="hover:bg-slate-50 group cursor-pointer">

                                            {/* Parent Name */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Image
                                                        src={parent.avatar || "/default-avatar.png"}
                                                        alt={parent.name}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{parent.name}</p>
                                                        <p className="text-xs text-slate-500">{parent.location}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <Phone className="w-3 h-3" />
                                                        {parent.phone}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <Mail className="w-3 h-3" />
                                                        {parent.email}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Students */}
                                            <td className="p-4">
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    {parent.students.avatars.map((img, index) => (
                                                        <Image
                                                            key={index}
                                                            width={24}
                                                            height={24}
                                                            src={img}
                                                            alt=""
                                                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-500 mt-1 block">
                                                    {parent.students.summary}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="p-4">
                                                {parent.status === "Owing" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Owing
                                                    </span>
                                                )}

                                                {parent.status === "Paid" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Paid
                                                    </span>
                                                )}

                                                {parent.status === "Partial" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Partial
                                                    </span>
                                                )}
                                            </td>

                                            {/* Balance */}
                                            <td className="p-4 text-right">
                                                <p className="text-sm font-medium text-slate-900">{parent.balance.amount}</p>
                                                {parent.balance.label && (
                                                    <p className="text-xs text-red-600">{parent.balance.label}</p>
                                                )}
                                            </td>

                                            {/* Last Payment */}
                                            <td className="p-4 text-right">
                                                <p className="text-sm text-slate-600">{parent.lastPayment}</p>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">

                                                    {/* Inline Link Button */}
                                                    <Link
                                                        href={`/admin/parents/${parent.id}`}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                                        title="Open parent profile"
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </Link>

                                                    {/* Three-dot menu */}
                                                    <button className="text-slate-400 hover:text-indigo-600 p-1">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>

                        {/* Pagination */}
                        <Pagination />
                    </div>
                </div>
            </div>
            {/* Right Summary Panel */}
            <div className="w-full grid gap-4 shrink-0">

                <div className="bg-indigo-900 p-5 rounded-xl shadow-sm text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-indigo-800 rounded-full opacity-50" />
                    <h3 className="font-semibold mb-2 relative z-10">
                        Need to send reminders?
                    </h3>
                    <p className="text-indigo-200 text-sm mb-4 relative z-10">
                        87 parents have outstanding payments due this week.
                    </p>
                    <button className="w-full py-2 bg-white text-indigo-900 text-sm font-medium rounded-md hover:bg-indigo-50 transition-colors relative z-10">
                        Send Bulk Reminder
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Page;
