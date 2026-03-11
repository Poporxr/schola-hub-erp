import Pagination from "@/components/Pagination";
import FormButton from "@/components/buttons/FormButton";
import TeachersTable from "@/components/teachersTable";
import type { TeacherFormData } from "@/components/modals/forms/TeacherForm";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/utils";
import { GraduationCap, Sparkles, UserCheck, Users } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";

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
    class: {
      select: {
        id: true,
        name: true,
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
    const classIds = new Set<string>();

    if (teacher.class?.id) {
      classIds.add(teacher.class.id);
    }

    for (const row of teacher.classTeachers) {
      classIds.add(row.class.id);
    }

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
    className: teacher.class?.name ?? teacher.classTeachers[0]?.class.name ?? "Unassigned",
    status: teacher.user.status,
    image: teacher.user.image,
    formData: toTeacherFormData(teacher),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Teachers</p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalTeachers}</p>
          <p className="mt-2 text-xs text-slate-500">All teaching staff</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-emerald-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Active Teachers</p>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{activeTeachers}</p>
          <p className="mt-2 text-xs text-slate-500">Currently active accounts</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Departments</p>
            <GraduationCap className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{departments.length}</p>
          <p className="mt-2 text-xs text-slate-500">Distinct academic groups</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-white/70">Assignments</p>
            <Sparkles className="h-4 w-4 text-white/70" />
          </div>
          <p className="mt-3 text-3xl font-bold">{totalAssignments}</p>
          <p className="mt-2 text-xs text-white/70">Visible subject and class links</p>
        </div>
      </div>

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
