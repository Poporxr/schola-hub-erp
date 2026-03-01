"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import { role } from "@/lib/utils";
import { DeleteButton } from "../buttons/DeleteButton";
import type { ClassStudentItem } from "./ClassStudent";

type Props = {
    students: ClassStudentItem[];
};

const ClassStudentClient = ({ students }: Props) => {
    const [query, setQuery] = useState("");
    const filteredStudents = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return students;
        return students.filter((student) => {
            const fullName = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
            return (
                fullName.includes(q) ||
                student.admissionNumber.toLowerCase().includes(q) ||
                student.user.email.toLowerCase().includes(q) ||
                (student.user.phone ?? "").toLowerCase().includes(q) ||
                student.gender.toLowerCase().includes(q)
            );
        });
    }, [query, students]);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col gap-4">
                <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Students List</h2>
                    <p className="text-sm text-gray-500">{filteredStudents.length} students enrolled</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search students..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div className="block md:hidden divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                    <div className="p-4 hover:bg-gray-50" key={student.id}>
                        <div className="flex items-start gap-3 mb-3">
                            <UserAvatar
                                src={student.user.image ?? undefined}
                                alt="Student"
                                size={48}
                                className="w-12 h-12 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="text-sm font-semibold text-gray-900">{`${student.user.firstName} ${student.user.lastName}`}</h3>
                                    <span className="text-xs font-mono text-gray-500">{student.admissionNumber}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{student.user.email}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span>{student.gender}</span>
                                    <span>{student.user.phone ?? "-"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/students/${student.id}`}
                                    className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                                >
                                    View
                                </Link>
                                {role === "admin" && (
                                    <DeleteButton
                                        id={student.id}
                                        label={`${student.user.firstName} ${student.user.lastName}`}
                                        type="student"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                            <tr className="hover:bg-gray-50" key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <UserAvatar
                                            src={student.user.image ?? undefined}
                                            alt="Student"
                                            size={40}
                                            className="w-10 h-10"
                                        />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{`${student.user.firstName} ${student.user.lastName}`}</div>
                                            <div className="text-xs text-gray-500">{student.user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900 font-mono">{student.admissionNumber}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900">{student.gender}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{student.user.phone ?? "-"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/teacher/students/${student.id}`}
                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                    >
                                        View
                                    </Link>
                                    {role === "admin" && (
                                        <DeleteButton
                                            id={student.id}
                                            label={`${student.user.firstName} ${student.user.lastName}`}
                                            type="student"
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClassStudentClient;
