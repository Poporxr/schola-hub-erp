import FormButton from "@/components/buttons/FormButton";
import { prisma } from "@/lib/prisma";
import { Users, GraduationCap, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";

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

    const [classes, levels, currentSession] = await Promise.all([
        prisma.class.findMany({
            orderBy: [{ createdAt: "asc" }],
            select: classSelect,
        }),
        prisma.level.findMany({
            orderBy: [{ name: "asc" }],
            select: { id: true, name: true, type: true },
        }),
        prisma.academicSession.findFirst({
            where: { isCurrent: true },
            select: { id: true },
        }),
    ]);

    const currentTerm = currentSession
        ? await prisma.term.findFirst({
            where: { sessionId: currentSession.id, isCurrent: true },
            select: { id: true },
        })
        : null;

    const currentCounts = currentSession && currentTerm
        ? await prisma.studentClassHistory.groupBy({
            by: ["classId"],
            where: { sessionId: currentSession.id, termId: currentTerm.id },
            _count: { _all: true },
        })
        : [];

    const countByClassId = new Map(currentCounts.map((row) => [row.classId, row._count._all]));

    const classesWithCounts = classes.map((classItem) => ({
        ...classItem,
        studentCount: countByClassId.get(classItem.id) ?? 0,
    }));

    const classMeta = {
        levels,
    };

    const totalClasses = classes.length;
    const totalStudents = classesWithCounts.reduce((sum, item) => sum + item.studentCount, 0);
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
                        <h1 className="text-2xl font-bold mt-2 text-white/90">Class Directory</h1>
                        <p className="text-white/70 mt-2">Track class composition, homeroom coverage, and capacity.</p>
                    </div>
                   
                </div>
                <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            <KpiGrid>
                <KpiCard
                    label="Total Classes"
                    value={totalClasses}
                    icon={<Layers className="h-4 w-4 text-slate-400" />}
                    subtext="Across all levels"
                />
                <KpiCard
                    label="Total Students"
                    value={totalStudents}
                    icon={<Users className="h-4 w-4 text-indigo-500" />}
                    subtext="Linked class histories"
                    tone="soft"
                />
                <KpiCard
                    label="Avg Class Size"
                    value={avgClassSize.toFixed(1)}
                    icon={<GraduationCap className="h-4 w-4 text-slate-400" />}
                    subtext="Students per class"
                />
                <KpiCard
                    label="Capacity Utilization"
                    value={`${capacityUtil.toFixed(1)}%`}
                    icon={<Sparkles className="h-4 w-4 text-white/70" />}
                    subtext={`${classesWithoutTeacher} classes without teacher`}
                    tone="dark"
                />
            </KpiGrid>
            <div className="uppercase tracking-[0.2em] font-bold flex justify-between items-center ">
                <p className="text-lg text-black/60">All Classes</p>
                 <FormButton type={"class"} action="create" meta={classMeta} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classesWithCounts.map((classItem) => (
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
                                <span className="font-medium text-slate-900">{classItem.studentCount}</span>
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
