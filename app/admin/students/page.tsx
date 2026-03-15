import Pagination from "@/components/Pagination";
import { User2, UserCheck, Users, Sparkles, Calendar, GraduationCap } from "lucide-react";
import FormButton from "@/components/buttons/FormButton";
import StudentsTable from "@/components/StudentsTable";
import { prisma } from "@/lib/prisma";
import FilterSelect from "@/components/SelectFilter";
import StudentSearchInput from "@/components/StudentSearchInput";
import { unstable_noStore as noStore } from "next/cache";
import type { StudentFormClasses, StudentFormData } from "@/components/modals/forms/StudentForm";
import { ITEM_PER_PAGE } from "@/lib/utils";
import { Prisma } from "@/generated/prisma/client";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";

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
  noStore();

  const resolvedSearchParams = await searchParams;
  const classId = Array.isArray(resolvedSearchParams?.classId)
    ? resolvedSearchParams?.classId[0]
    : resolvedSearchParams?.classId;
  const search = Array.isArray(resolvedSearchParams?.search)
    ? resolvedSearchParams?.search[0]
    : resolvedSearchParams?.search;
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams?.page[0]
    : resolvedSearchParams?.page;
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
    address: true,
    user: {
      select: {
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        image: true,
      },
    },
    classHistories:
      currentSession && currentTerm
        ? {
            where: { sessionId: currentSession.id, termId: currentTerm.id },
            take: 1,
            select: { class: { select: { id: true, name: true } } },
          }
        : {
            take: 1,
            orderBy: { createdAt: Prisma.SortOrder.desc },
            select: { class: { select: { id: true, name: true } } },
          },
  } satisfies Prisma.StudentSelect;

  const [students, total, totalAll, male, female, active, recentAdmissions] =
    await Promise.all([
      prisma.student.findMany({
        where: query,
        orderBy: [{ createdAt: "desc" }],
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (page - 1),
        select: studentSelect,
      }),
      prisma.student.count({ where: query }),
      prisma.student.count(),
      prisma.student.count({ where: { gender: "MALE" } }),
      prisma.student.count({ where: { gender: "FEMALE" } }),
      prisma.student.count({ where: { user: { status: "ACTIVE" } } }),
      prisma.student.count({
        where: {
          createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
        },
      }),
    ]);

  const classSizeAvg = classes.length ? totalAll / classes.length : 0;

  const toStudentFormData = (student: (typeof students)[number]): StudentFormData => {
    return {
      id: student.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      gender: student.gender,
      admissionNumber: student.admissionNumber,
      dateOfBirth: student.dateOfBirth
        ? student.dateOfBirth.toISOString().slice(0, 10)
        : undefined,
      classId: student.classHistories[0]?.class?.id,
    };
  };

  const studentRows = students.map((student) => ({
    id: student.id,
    admissionNumber: student.admissionNumber,
    gender: student.gender,
    status: student.user.status,
    className: student.classHistories[0]?.class?.name ?? "Unassigned",
    image: student.user.image,
    firstName: student.user.firstName,
    lastName: student.user.lastName,
    email: student.user.email,
    formData: toStudentFormData(student),
  }));

  return (
    <div className="space-y-6">
      <KpiGrid>
        <KpiCard
          label="Total Students"
          value={totalAll}
          icon={<Users className="h-4 w-4 text-slate-400" />}
          subtext="All registered students"
        />
        <KpiCard
          label="Active Students"
          value={active}
          icon={<UserCheck className="h-4 w-4 text-emerald-500" />}
          subtext="Currently active accounts"
          className="bg-linear-to-br from-emerald-50 via-white to-white"
        />
        <KpiCard
          label="New Admissions"
          value={recentAdmissions}
          icon={<Sparkles className="h-4 w-4 text-indigo-500" />}
          subtext="Last 30 days"
          tone="soft"
        />
        <KpiCard
          label="Avg Class Size"
          value={classSizeAvg.toFixed(1)}
          icon={<GraduationCap className="h-4 w-4 text-slate-400" />}
          subtext={`Across ${classes.length} classes`}
        />
      </KpiGrid>

      <KpiGrid className="lg:grid-cols-3">
        <KpiCard
          label="Boys"
          value={male}
          icon={<User2 className="h-4 w-4 text-blue-500" />}
          valueClassName="text-2xl font-semibold sm:text-2xl"
        />
        <KpiCard
          label="Girls"
          value={female}
          icon={<User2 className="h-4 w-4 text-pink-500" />}
          valueClassName="text-2xl font-semibold sm:text-2xl"
        />
        <KpiCard
          label="Visible Results"
          value={total}
          icon={<Calendar className="h-4 w-4 text-white/70" />}
          subtext="Filtered records"
          tone="dark"
          valueClassName="text-2xl font-semibold sm:text-2xl"
        />
      </KpiGrid>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">All Students</h3>
              <p className="text-xs text-slate-500">Search, filter, and manage student profiles</p>
            </div>
            <FormButton type={"student"} action="create" classes={classOptions} />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <StudentSearchInput initialValue={search} />
            <FilterSelect classes={classes} classId={classId} />
          </div>
        </div>

        <StudentsTable students={studentRows} classOptions={classOptions} />
        <Pagination page={page} count={total} />
      </div>
    </div>
  );
}
