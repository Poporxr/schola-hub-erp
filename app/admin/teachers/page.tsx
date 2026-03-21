import Pagination from "@/components/Pagination";
import FormButton from "@/components/buttons/FormButton";
import TeachersTable from "@/components/teachersTable";
import type { TeacherFormData } from "@/components/modals/forms/TeacherForm";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/utils";
import { GraduationCap, Sparkles, UserCheck, Users } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";

type SearchParams = {
  page?: string | string[];
};

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  noStore();

  const resolvedSearchParams = await searchParams;
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams?.page;
  const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

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

  const assignmentWhere =
    currentSession && currentTerm
      ? { sessionId: currentSession.id, termId: currentTerm.id }
      : undefined;

  const teacherSelect = {
    id: true,
    teacherId: true,
    department: true,
    user: {
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        image: true,
        status: true,
      },
    },
    classTeachers: {
      where: assignmentWhere,
      select: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    subjectTeachers: {
      where: assignmentWhere,
      select: {
        subjectId: true,
      },
    },
  } satisfies Prisma.TeacherSelect;

  const [teachers, totalTeachers, activeTeachers, departments] = await Promise.all([
    prisma.teacher.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
      select: teacherSelect,
    }),
    prisma.teacher.count(),
    prisma.teacher.count({ where: { user: { status: "ACTIVE" } } }),
    prisma.teacher.findMany({
      where: { department: { not: null } },
      distinct: ["department"],
      select: { department: true },
    }),
  ]);

  const totalAssignments = teachers.reduce((sum, teacher) => {
    const classIds = new Set(teacher.classTeachers.map((row) => row.class.id));
    return sum + classIds.size + teacher.subjectTeachers.length;
  }, 0);

  const toTeacherFormData = (teacher: (typeof teachers)[number]): TeacherFormData => ({
    id: teacher.id,
    firstName: teacher.user.firstName,
    lastName: teacher.user.lastName,
    email: teacher.user.email,
    phone: teacher.user.phone ?? undefined,
    department: teacher.department ?? undefined,
    status:
      teacher.user.status === "ACTIVE"
        ? "active"
        : teacher.user.status === "SUSPENDED"
          ? "suspended"
          : "on_leave",
  });

  const teacherRows = teachers.map((teacher) => ({
    id: teacher.id,
    fullName: `${teacher.user.firstName} ${teacher.user.lastName}`.trim() || "Teacher",
    phone: teacher.user.phone,
    department: teacher.department,
    className:
      teacher.classTeachers.length > 0
        ? teacher.classTeachers.map((row) => row.class.name).join(", ")
        : "Unassigned",
    status: teacher.user.status,
    image: teacher.user.image,
    formData: toTeacherFormData(teacher),
  }));

  return (
    <div className="space-y-6">
      <KpiGrid>
        <KpiCard
          label="Total Teachers"
          value={totalTeachers}
          icon={<Users className="h-4 w-4 text-slate-400" />}
          subtext="All teaching staff"
        />
        <KpiCard
          label="Active Teachers"
          value={activeTeachers}
          icon={<UserCheck className="h-4 w-4 text-emerald-500" />}
          subtext="Currently active accounts"
          className="bg-linear-to-br from-emerald-50 via-white to-white"
        />
        <KpiCard
          label="Departments"
          value={departments.length}
          icon={<GraduationCap className="h-4 w-4 text-slate-400" />}
          subtext="Distinct academic groups"
        />
        <KpiCard
          label="Assignments"
          value={totalAssignments}
          icon={<Sparkles className="h-4 w-4 text-white/70" />}
          subtext="Visible subject and class links"
          tone="dark"
        />
      </KpiGrid>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">All Teachers</h3>
              <p className="text-xs text-slate-500">Manage teacher profiles and assignments</p>
            </div>
            <FormButton type="teacher" action="create" />
          </div>
        </div>

        <TeachersTable teachers={teacherRows} />
        <Pagination page={page} count={totalTeachers} />
      </div>
    </div>
  );
}
