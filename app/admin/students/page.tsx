import Pagination from "@/components/Pagination";
import { Eye, User2, UserCheck, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FormButton from "@/components/buttons/FormButton";
import { prisma } from "@/lib/prisma";
import FilterSelect from "@/components/SelectFilter";
import { Prisma } from "@prisma/client";
import StudentSearchInput from "@/components/StudentSearchInput";
import { unstable_noStore as noStore } from "next/cache";
import type { StudentFormClasses, StudentFormData } from "@/components/modals/forms/StudentForm";
import { ITEM_PER_PAGE } from "@/lib/utils";



type SearchParams = {
    classId?: string | string[];
    search?: string | string[];
    page?: string | string[];
};

export default async function page({
    searchParams,
}: {
    searchParams?: SearchParams | Promise<SearchParams>;
}) {
    // Always render this page dynamically (no caching)
    noStore();

    const resolvedSearchParams = await searchParams;
    const classId = Array.isArray(resolvedSearchParams?.classId) ? resolvedSearchParams?.classId[0] : resolvedSearchParams?.classId;
    const search = Array.isArray(resolvedSearchParams?.search) ? resolvedSearchParams?.search[0] : resolvedSearchParams?.search;
    const pageParam = Array.isArray(resolvedSearchParams?.page) ? resolvedSearchParams?.page[0] : resolvedSearchParams?.page;
    const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

    const classes = await prisma.class.findMany({
        orderBy: [{ name: "asc" }],
        select: { id: true, name: true },
    });
    const classOptions = classes satisfies StudentFormClasses;


    const currentSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
        select: { id: true },
    });
    const currentTerm = currentSession
        ? await prisma.term.findFirst({
            where: { sessionId: currentSession.id, isCurrent: true },
            select: { id: true },
        })
        : null;

    const query: Prisma.StudentWhereInput = {};

    const paramEntries: [string, string | undefined][] = [
        ["classId", classId],
        ["search", search],
    ];

    for (const [key, value] of paramEntries) {
        if (!value) continue;
        switch (key) {
            case "classId":
                if (currentSession && currentTerm) {
                    query.classHistories = {
                        some: {
                            sessionId: currentSession.id,
                            termId: currentTerm.id,
                            ...(classId ? { classId } : {}),
                        },
                    };
                } else if (classId) {
                    query.classHistories = {
                        some: { classId },
                    };
                }
                break;
            case "search":
                query.user = {
                    OR: [
                        { firstName: { contains: value, mode: "insensitive" } },
                        { lastName: { contains: value, mode: "insensitive" } },
                        { email: { contains: value, mode: "insensitive" } },
                    ],
                };
                break;
            default:
                break;
        }
    }

    const studentSelect = {
        id: true,
        admissionNumber: true,
        gender: true,
        dateOfBirth: true,
        user: { select: { firstName: true, lastName: true, email: true, status: true } },
        classHistories: currentSession && currentTerm
            ? {
                where: { sessionId: currentSession.id, termId: currentTerm.id },
                take: 1,
                select: { class: { select: { id: true, name: true } } },
            }
            : {
                take: 1,
                orderBy: { createdAt: "desc" },
                select: { class: { select: { id: true, name: true } } },
            },
    } satisfies Prisma.StudentSelect;

    type StudentRow = Prisma.StudentGetPayload<{ select: typeof studentSelect }>;

    const toStudentFormData = (student: StudentRow): StudentFormData => ({
        id: student.id,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        gender: student.gender,
        admissionNumber: student.admissionNumber,
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().slice(0, 10) : undefined,
        classId: student.classHistories[0]?.class?.id,
    });

    const [students, total] = await Promise.all([
        prisma.student.findMany({
            where: query,
            orderBy: [{ createdAt: "desc" }],
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (page - 1),
            select: studentSelect,
        }),
        prisma.student.count({ where: query }),
    ]);

    const male = await prisma.student.count({
        where: { gender: "MALE" },
    });

    const female = await prisma.student.count({
        where: { gender: "FEMALE" },
    });

    const active = await prisma.student.count({
        where: { user: { status: 'ACTIVE' } }
    })


    return (
        <div className="">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{total}</h3>
                    <p className="text-sm text-gray-500">Total Students</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{active}</h3>
                    <p className="text-sm text-gray-500">Active Students</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <User2 className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{female}</h3>
                    <p className="text-sm text-gray-500">Girls</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <User2 className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{male}</h3>
                    <p className="text-sm text-gray-500">Boys</p>
                </div>
            </div>

            {/* <!-- Students Table -->*/}
            <div className="bg-white  rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">All Students</h3>
                        <FormButton type={"student"} action="create" classes={classOptions} />
                    </div>
                    <div className="flex items-center gap-4">
                        <StudentSearchInput initialValue={search} />
                        <FilterSelect classes={classes} classId={classId} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Name
                                </th>

                                {/* GENDER — hidden on small screens */}
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">
                                    Gender
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {students.map((student: StudentRow) => (
                                <tr className="hover:bg-gray-50" key={student.id}>
                                    <td className="px-6 py-4">

                                        {/* IMAGE hidden on small screens; NAME always visible */}
                                        <div className="flex items-center gap-3">
                                            <div className="hidden md:block">
                                                <Image
                                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                                                    alt="Student"
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    width={40}
                                                    height={40}
                                                />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {`${student.user.firstName} ${student.user.lastName}`}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {student.admissionNumber}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* GENDER column hidden on mobile */}
                                    <td className="px-6 py-4 text-sm text-gray-700 hidden md:table-cell">
                                        {student.gender}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold ${student.user.status === "ACTIVE"
                                                    ? "text-green-700 bg-green-100"
                                                    : "text-red-700 bg-red-100"
                                                } rounded-full`}
                                        >
                                            {student.user.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-6 grid grid-cols-2">
                                        <Link
                                            href={`/admin/students/${student.id}`}
                                            className="text-slate-400 hover:text-indigo-600"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <FormButton type="student" action="edit" classes={classOptions} data={toStudentFormData(student)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} count={total} />
            </div>
        </div>
    )
}

