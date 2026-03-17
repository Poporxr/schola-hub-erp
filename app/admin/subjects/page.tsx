import FormButton from "@/components/buttons/FormButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import Pagination from "@/components/Pagination";
import { ArrowUpRight, BookOpen, CheckCircle, Clock, Layers, Users } from "lucide-react";
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
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams?.page[0]
    : resolvedSearchParams?.page;
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
        description: true,
        assessmentMax: true,
        examMax: true,
        projectMax: true,
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
    if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) {
      return sum;
    }
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    return sum + Math.max(0, end - start);
  }, 0);
  const totalHours = Math.round(totalMinutes / 60);

  const subjectRows = subjects.map((subject) => {
    const levels = new Set(subject.classSubjects.map((row) => row.class.level.name));
    const teacherSet = new Set(
      subject.subjectTeachers.map(
        (row) => `${row.teacher.user.firstName} ${row.teacher.user.lastName}`
      )
    );

    return {
      id: subject.id,
      name: subject.name,
      code: subject.code ?? undefined,
      description: subject.description ?? undefined,
      assessmentMax: subject.assessmentMax,
      examMax: subject.examMax,
      projectMax: subject.projectMax,
      classLevels: Array.from(levels),
      teachers: Array.from(teacherSet),
      classesCount: subject.classSubjects.length,
    };
  });

  const toSubjectFormData = (subject: (typeof subjectRows)[number]): SubjectFormData => ({
    id: subject.id,
    name: subject.name,
    code: subject.code,
    description: subject.description,
    ca: subject.assessmentMax,
    exam: subject.examMax,
    project: subject.projectMax,
  });

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Subjects Overview</p>
            <h1 className="mt-2 text-2xl font-bold text-white/90">Curriculum Subjects</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Manage subject catalogs, class coverage, and teacher allocations.
            </p>
          </div>
        </div>
        <div className="absolute right-4 top-4 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
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

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">All Subjects</h3>
            <p className="text-xs text-slate-500">Assignments, class levels, and teacher coverage</p>
          </div>
          <div className="w-full sm:w-auto">
            <FormButton type={"subject"} action="create" />
          </div>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {subjectRows.map((subject) => (
            <div key={`${subject.id}-mobile`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{subject.name}</p>
                  <p className="text-xs text-slate-500">{subject.code ?? "No code"}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  <Layers className="h-3.5 w-3.5 text-slate-500" />
                  {subject.classesCount}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Class Levels</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {subject.classLevels.length ? (
                      subject.classLevels.map((level) => (
                        <span
                          key={`${subject.id}-mobile-${level}`}
                          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                        >
                          {level}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Teachers</p>
                  <p className="mt-1 text-xs text-slate-700">
                    {subject.teachers.length ? subject.teachers.join(", ") : "No teacher assigned"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/admin/subjects/${subject.id}/teacher-assignment`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Teachers
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <FormButton type="subject" action="edit" data={toSubjectFormData(subject)} />
                <DeleteButton id={subject.id} label={subject.name} type="subject" iconOnly />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Class Levels</th>
                <th className="px-6 py-4">Assigned Teachers</th>
                <th className="px-6 py-4">Coverage</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {subjectRows.map((subject) => (
                <tr key={subject.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <BookOpen className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{subject.name}</p>
                        <p className="text-xs text-slate-500">{subject.code ?? "No code"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {subject.classLevels.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {subject.classLevels.map((level) => (
                          <span
                            key={`${subject.id}-${level}`}
                            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                          >
                            {level}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {subject.teachers.length ? (
                      <div className="space-y-1">
                        {subject.teachers.slice(0, 2).map((teacher) => (
                          <p key={`${subject.id}-${teacher}`} className="text-sm text-slate-700">
                            {teacher}
                          </p>
                        ))}
                        {subject.teachers.length > 2 ? (
                          <p className="text-xs font-medium text-slate-500">
                            +{subject.teachers.length - 2} more
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-slate-500">No teacher assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      <Layers className="h-3.5 w-3.5 text-slate-500" />
                      {subject.classesCount} class{subject.classesCount === 1 ? "" : "es"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/subjects/${subject.id}/teacher-assignment`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Teachers
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      <FormButton type="subject" action="edit" data={toSubjectFormData(subject)} />
                      <DeleteButton id={subject.id} label={subject.name} type="subject" iconOnly />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} count={totalSubjects} />
      </div>
    </div>
  );
};

export default Page;
