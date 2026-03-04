import FormButton from "@/components/buttons/FormButton";
import { prisma } from "@/lib/prisma";
import { Users, GraduationCap, UserCheck, Layers, Sparkles } from "lucide-react";
import Link from "next/link";

const Page = async () => {
    const classSelect = {
        id: true,
        capacity: true,
        name: true,
        level: { select: { type: true, name: true } },
        teacher: {
            select: {
                id: true,
                user: { select: { lastName: true, firstName: true } },
            },
        },
        _count: { select: { classHistories: true } },
    } as const;

    const classes = await prisma.class.findMany({
        orderBy: [{ createdAt: "asc" }],
        select: classSelect,
    });

    const totalClasses = classes.length;
    const totalStudents = classes.reduce((sum, item) => sum + item._count.classHistories, 0);
    const avgClassSize = totalClasses ? totalStudents / totalClasses : 0;
    const classesWithoutTeacher = classes.filter((item) => !item.teacher).length;
    const capacityTotal = classes.reduce((sum, item) => sum + (item.capacity ?? 0), 0);
    const capacityUtil = capacityTotal ? Math.min(100, (totalStudents / capacityTotal) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Classes</p>
                        <h1 className="text-2xl font-bold mt-2">Class Directory</h1>
                        <p className="text-white/70 mt-2">Track class composition, homeroom coverage, and capacity.</p>
                    </div>
                   
                </div>
                <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Total Classes</p>
                        <Layers className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{totalClasses}</p>
                    <p className="mt-2 text-xs text-slate-500">Across all levels</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50 via-white to-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Total Students</p>
                        <Users className="h-4 w-4 text-indigo-500" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{totalStudents}</p>
                    <p className="mt-2 text-xs text-slate-500">Linked class histories</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Avg Class Size</p>
                        <GraduationCap className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{avgClassSize.toFixed(1)}</p>
                    <p className="mt-2 text-xs text-slate-500">Students per class</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-white/70">Capacity Utilization</p>
                        <Sparkles className="h-4 w-4 text-white/70" />
                    </div>
                    <p className="mt-3 text-3xl font-bold">{capacityUtil.toFixed(1)}%</p>
                    <p className="mt-2 text-xs text-white/70">{classesWithoutTeacher} classes without teacher</p>
                </div>
            </div>
            <div className="uppercase tracking-[0.2em] font-bold flex justify-between items-center ">
                <p className="text-lg text-black/60">All Classes</p>
                 <FormButton type={"class"} action="create" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow" key={classItem.id}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{classItem.name}</h3>
                                <p className="text-sm text-slate-500">{classItem.level.name}</p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg text-slate-900">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Class Teacher</span>
                                <span className="font-medium text-slate-900">
                                    {classItem.teacher
                                        ? `${classItem.teacher.user.firstName} ${classItem.teacher.user.lastName}`
                                        : "Unassigned"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Students</span>
                                <span className="font-medium text-slate-900">{classItem._count.classHistories}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Capacity</span>
                                <span className="font-medium text-slate-900">{classItem.capacity ?? "—"}</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                            <Link href={`/admin/classes/${classItem.id}`} className="flex-1 py-2 text-center text-sm font-medium text-slate-900 bg-indigo-50 rounded-lg hover:bg-indigo-100">View Details</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Page;
