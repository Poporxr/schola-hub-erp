import Pagination from "@/components/Pagination";
import { CalendarCheck, Eye, UserCheck, Users, Sparkles, BookOpen, User2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import FormButton from "@/components/buttons/FormButton";
import { prisma } from "@/lib/prisma";
import StudentSearchInput from "@/components/StudentSearchInput";
import FilterSelect from "@/components/SelectFilter";
import { ITEM_PER_PAGE } from "@/lib/utils";
import { TeacherFormData } from "@/components/modals/forms/TeacherForm";
import { Prisma } from "@/generated/prisma/client";

type SearchParams = {
    classId?: string | string[];
    search?: string | string[];
    page?: string | string[];
};

type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

type TeacherRow = {
    id: string;
    class: { id: string; name: string } | null;
    department: string | null;
    teacherId: string;
    user: { status: UserStatus; firstName: string; lastName: string; phone: string | null; email: string; image: string | null };
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
        user: { select: { status: true, firstName: true, lastName: true, phone: true, email: true, image: true } },
    } as const;

    const [teachers, total, active, allTeachers, unassigned, deptRows, newHires] = await Promise.all([
        prisma.teacher.findMany({
            where: query,
            orderBy: [{ createdAt: "desc" }],
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (page - 1),
            select: teacherSelect,
        }),
        prisma.teacher.count({ where: query }),
        prisma.teacher.count({ where: { user: { status: "ACTIVE" } } }),
        prisma.teacher.count(),
        prisma.teacher.count({ where: { classId: null } }),
        prisma.teacher.findMany({ select: { department: true } }),
        prisma.teacher.count({ where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } }),
    ]);

    const departments = new Set(deptRows.map((row) => row.department).filter(Boolean));

    const toTeacherStatus = (status: UserStatus): TeacherFormData["status"] => {
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
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Total Teachers</p>
                        <Users className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{allTeachers}</p>
                    <p className="mt-2 text-xs text-slate-500">Full staff roster</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-emerald-50 via-white to-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Active Teachers</p>
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{active}</p>
                    <p className="mt-2 text-xs text-slate-500">Currently active</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50 via-white to-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-slate-500">New Hires</p>
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{newHires}</p>
                    <p className="mt-2 text-xs text-slate-500">Last 30 days</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-white/70">Unassigned</p>
                        <User2 className="h-4 w-4 text-white/70" />
                    </div>
                    <p className="mt-3 text-3xl font-bold">{unassigned}</p>
                    <p className="mt-2 text-xs text-white/70">Without class</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">All Teachers</h3>
                            <p className="text-xs text-slate-500">Search, filter, and manage staff profiles</p>
                        </div>
                        <FormButton type={"teacher"} action="create" />
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <StudentSearchInput initialValue={search} />
                        <FilterSelect classes={classes} classId={classId} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Teacher</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {teachers.map((teacher: TeacherRow) => (
                                <tr className="hover:bg-slate-50" key={teacher.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar
                                                src={teacher.user.image}
                                                alt={`${teacher.user.firstName} ${teacher.user.lastName}`}
                                                size={40}
                                                className="w-10 h-10 border border-border"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{`${teacher.user.firstName} ${teacher.user.lastName}`}</p>
                                                <p className="text-[11px] text-slate-500">{teacher.user.phone ?? "—"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{teacher.department ?? "—"}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{teacher.class?.name ?? "Unassigned"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold ${teacher.user.status === "ACTIVE" ? 'text-emerald-700 bg-emerald-100' : teacher.user.status === "SUSPENDED" ? "text-rose-700 bg-rose-100" : "text-amber-700 bg-amber-100"} rounded-full`} >{teacher.user.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/admin/teachers/${teacher.id}`} className="text-slate-400 hover:text-indigo-600"><Eye className="w-4 h-4" /></Link>
                                            <FormButton type="teacher" action="edit" data={toTeacherFormData(teacher)} />
                                        </div>
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
