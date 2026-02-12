import FormButton from "@/components/buttons/FormButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import Pagination from "@/components/Pagination";
import { BookOpen, CheckCircle, Clock, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { ITEM_PER_PAGE } from "@/lib/utils";
import type { SubjectFormData } from "@/components/modals/forms/SubjectForm";

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
        <div>
            <div className="">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{totalSubjects}</h3>
                        <p className="text-sm text-gray-500">Total Subjects</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{totalSubjects}</h3>
                        <p className="text-sm text-gray-500">Active Subjects</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{uniqueTeacherCount}</h3>
                        <p className="text-sm text-gray-500">Assigned Teachers</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{totalHours}</h3>
                        <p className="text-sm text-gray-500">Total Hours/Week</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">All Subjects</h3>
                        <FormButton type={"subject"} action="create"/>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Class Level</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Assigned Teacher</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subjectRows.map((subject) => (
                                    <tr className="hover:bg-gray-50" key={subject.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900">{subject.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {subject.classLevels.length ? subject.classLevels.join(", ") : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {subject.teachers.length ? subject.teachers.join(", ") : "—"}
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-2">
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
        </div>
    )
}

export default Page;
