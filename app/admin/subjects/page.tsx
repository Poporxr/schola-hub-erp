import FormButton from "@/components/buttons/FormButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import Pagination from "@/components/Pagination";
import { BookOpen, CheckCircle, Clock, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { ITEM_PER_PAGE } from "@/lib/utils";
import type { SubjectFormData } from "@/components/modals/forms/SubjectForm";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";
import Link from "next/link";

type SearchParams = {
  page?: string | string[];
};

const Page = async ({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) => {
    noStore();
    const resolvedSearchParams = await searchParams;
    const pageParam = Array.isArray(resolvedSearchParams?.page) ? resolvedSearchParams?.page[0] : resolvedSearchParams?.page;
    const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

    const [subjects, totalSubjects, subjectTeachers, timetableEntries] = await Promise.all([
        prisma.subject.findMany({
            orderBy: [{ createdAt: "desc" }],
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (page - 1),
            select: {
                id: true,
                name: true,
                code: true,
                classSubjects: {
                    select: {
                        class: {
                            select: {
                                name: true,
                                level: { select: { name: true, type: true } },
                            },
                        },
                    },
                },
                subjectTeachers: {
                    select: {
                        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
                    },
                },
            },
        }),
        prisma.subject.count(),
        prisma.subjectTeacher.findMany({ select: { teacherId: true } }),
        prisma.timetableEntry.findMany({ select: { startTime: true, endTime: true } }),
    ]);

    const uniqueTeacherCount = new Set(subjectTeachers.map((t) => t.teacherId)).size;

    const totalMinutes = timetableEntries.reduce((sum, entry) => {
        const [sh, sm] = entry.startTime.split(":").map(Number);
        const [eh, em] = entry.endTime.split(":").map(Number);
        if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) return sum;
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        return sum + Math.max(0, end - start);
    }, 0);
    const totalHours = Math.round(totalMinutes / 60);

    const subjectRows = subjects.map((subject) => {
        const levels = new Set(
            subject.classSubjects.map((row) => row.class.level.name)
        );
        const teacherSet = new Set(
            subject.subjectTeachers.map(
                (row) => `${row.teacher.user.firstName} ${row.teacher.user.lastName}`
            )
        );
        const teachers = Array.from(teacherSet);
        return {
            id: subject.id,
            name: subject.name,
            code: subject.code ?? undefined,
            classLevels: Array.from(levels),
            teachers,
        };
    });

    const toSubjectFormData = (subject: (typeof subjectRows)[number]): SubjectFormData => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        level: subject.classLevels[0],
    });

    return (
        <div className="space-y-6">
            <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">Subjects Overview</p>
                    <h1 className="text-2xl font-bold mt-2 text-white/80">Curriculum Subjects</h1>
                    <p className="text-white/70 max-w-2xl mt-2">
                        Manage subject catalogs, class coverage, and teacher allocations.
                    </p>
                </div>
                <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            <KpiGrid>
                <KpiCard
                    label="Total Subjects"
                    value={totalSubjects}
                    icon={<BookOpen className="h-4 w-4 text-slate-400" />}
                    subtext="Across all grade levels"
                />
                <KpiCard
                    label="Active Subjects"
                    value={totalSubjects}
                    icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
                    subtext="Currently scheduled"
                />
                <KpiCard
                    label="Assigned Teachers"
                    value={uniqueTeacherCount}
                    icon={<Users className="h-4 w-4 text-indigo-400" />}
                    subtext="Distinct instructors"
                />
                <KpiCard
                    label="Weekly Hours"
                    value={totalHours}
                    icon={<Clock className="h-4 w-4 text-white/70" />}
                    subtext="Total hours/week"
                    tone="dark"
                />
            </KpiGrid>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">All Subjects</h3>
                        <p className="text-xs text-slate-500">Assignments, classes, and instructors</p>
                    </div>
                    <FormButton type={"subject"} action="create" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10">
                            <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-semibold">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Class Level</th>
                                <th className="px-6 py-4">Assigned Teacher</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {subjectRows.map((subject) => (
                                <tr className="hover:bg-slate-50 transition-colors" key={subject.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{subject.name}</p>
                                                <p className="text-xs text-slate-500">{subject.code ?? "No code"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {subject.classLevels.length ? subject.classLevels.join(", ") : "�"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {subject.teachers.length ? subject.teachers.join(", ") : "�"}
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <Link
                                          href={`/admin/subjects/${subject.id}/teacher-assignment`}
                                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                          Teachers
                                        </Link>
                                        <FormButton type="subject" action="edit" data={toSubjectFormData(subject)} />
                                        <DeleteButton id={subject.id} label={subject.name} type="subject" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination page={page} count={totalSubjects} />
            </div>
        </div>
    )
}
export default Page;
