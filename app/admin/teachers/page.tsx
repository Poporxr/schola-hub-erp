import Pagination from "@/components/Pagination";
import { CalendarCheck, Eye, UserCheck, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FormButton from "@/components/buttons/FormButton";
import { prisma } from "@/lib/prisma";
import { Prisma, Status } from "@/generated/prisma/client";
import StudentSearchInput from "@/components/StudentSearchInput";
import FilterSelect from "@/components/SelectFilter";
import { ITEM_PER_PAGE } from "@/lib/utils";
import { TeacherFormData } from "@/components/modals/forms/TeacherForm";

type SearchParams = {
    classId?: string | string[];
    search?: string | string[];
    page?: string | string[];
};

export default async function page({ searchParams,
}: {
    searchParams?: SearchParams | Promise<SearchParams>;
}) {


    const resolvedSearchParams = await searchParams;
    const classId = Array.isArray(resolvedSearchParams?.classId) ? resolvedSearchParams?.classId[0] : resolvedSearchParams?.classId;
    const search = Array.isArray(resolvedSearchParams?.search) ? resolvedSearchParams?.search[0] : resolvedSearchParams?.search;
    const pageParam = Array.isArray(resolvedSearchParams?.page) ? resolvedSearchParams?.page[0] : resolvedSearchParams?.page;
    const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

    const classes = await prisma.class.findMany({
        orderBy: [{ name: "asc" }],
        select: { id: true, name: true },
    });
    const query: Prisma.TeacherWhereInput = {};



    const paramEntries: [string, string | undefined][] = [
        ["classId", classId],
        ["search", search],
    ];

    for (const [key, value] of paramEntries) {
        if (!value) continue;
        switch (key) {
            case "classId":
                query.classId = classId;
                break;
            case "search":
                query.OR = [
                    { user: { firstName: { contains: value, mode: "insensitive" } } },
                    { user: { lastName: { contains: value, mode: "insensitive" } } },
                    { user: { email: { contains: value, mode: "insensitive" } } },
                    { teacherId: { contains: value, mode: "insensitive" } },
                    { department: { contains: value, mode: "insensitive" } },
                    { class: { name: { contains: value, mode: "insensitive" } } },
                ];
                break;
            default:
                break;
        }
    }

    const teacherSelect = {
        id: true,
        class: { select: { id: true, name: true } },
        department: true,
        teacherId: true,
        user: { select: { status: true, firstName: true, lastName: true, phone: true, email: true } },
    }

    const [teachers, total] = await Promise.all([
        prisma.teacher.findMany({
            where: query,
            orderBy: [{ createdAt: "desc" }],
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (page - 1),
            select: teacherSelect,
        }),
        prisma.teacher.count({ where: query }),
    ]);


    const active = await prisma.teacher.count({
        where: { user: { status: 'ACTIVE' } }
    })

    const allTeachers = await prisma.teacher.count()


    type TeacherRow = Prisma.TeacherGetPayload<{ select: typeof teacherSelect }>;

    const toTeacherStatus = (status: Status): TeacherFormData["status"] => {
        if (status === "ACTIVE") return "active";
        if (status === "SUSPENDED") return "suspended";
        return "on_leave";
    };

    const toTeacherFormData = (teacher: TeacherRow): TeacherFormData => ({
        id: teacher.id,
        firstName: teacher.user.firstName,
        lastName: teacher.user.lastName,
        email: teacher.user.email,
        phone: teacher.user.phone ?? undefined,
        classIds: teacher.class?.id ? [teacher.class.id] : undefined,
        status: toTeacherStatus(teacher.user.status),
    });

    return (
        <div className="">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{allTeachers}</h3>
                    <p className="text-sm text-gray-500">Total Teachers</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{active}</h3>
                    <p className="text-sm text-gray-500">Active Teachers</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <CalendarCheck className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">94%</h3>
                    <p className="text-sm text-gray-500">Attendance Rate</p>
                </div>
            </div>

            {/* <!-- Students Table -->*/}
            <div className="bg-white  rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">All Teacher</h3>
                        <FormButton type={"teacher"} action="create" />
                    </div>
                    <div className="flex items-center gap-4">
                        <StudentSearchInput initialValue={search} />
                        <FilterSelect classes={classes} classId={classId} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full ">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Class</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {teachers.map((teacher) => (
                                <tr className="hover:bg-gray-50" key={teacher.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Student" className="w-10 h-10 rounded-full object-cover" width={20} height={20} />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{`${teacher.user.firstName} ${teacher.user.lastName}`}</p>
                                                <p className="text-[10px] text-gray-500">{teacher.user.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{teacher.department}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{teacher.class?.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold ${teacher.user.status === "ACTIVE" ? 'text-green-700 bg-green-100 ' : "text-red-700 bg-red-100 "}rounded-full`} >{teacher.user.status}</span>
                                    </td>
                                    <td className="px-6 py-6 grid grid-cols-2">
                                        <Link href={`/admin/teachers/${teacher.id}`} className="text-slate-400 hover:text-indigo-600"><Eye className="w-4 h-4" /></Link>
                                        <FormButton type="teacher" action="edit" data={toTeacherFormData(teacher)} />
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

