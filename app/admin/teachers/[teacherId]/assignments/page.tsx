import Link from "next/link";
import { Search, UserPlus, Users } from "lucide-react";
import { notFound } from "next/navigation";
import SmartBackButton from "@/components/SmartBackButton";
import LinkedClassesTable from "@/components/teacher/LinkedClassesTable";
import { linkTeacherClassAction, unlinkTeacherClassAction } from "@/components/actions/actions";
import { prisma } from "@/lib/prisma";

export default async function TeacherClassAssignmentsPage({
  params,
}: {
  params: { teacherId: string };
}) {
  const { teacherId } = await params;
  if (!teacherId) notFound();

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true, name: true },
  });

  const currentTerm = currentSession
    ? await prisma.term.findFirst({
        where: { sessionId: currentSession.id, isCurrent: true },
        select: { id: true, name: true },
      })
    : null;

  const assignmentWhere =
    currentSession && currentTerm
      ? { sessionId: currentSession.id, termId: currentTerm.id }
      : undefined;

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: {
      id: true,
      teacherId: true,
      department: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          status: true,
        },
      },
      classTeachers: {
        where: assignmentWhere,
        select: {
          classId: true,
          class: {
            select: {
              id: true,
              name: true,
              level: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!teacher) {
    notFound();
  }

  const allClasses = await prisma.class.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      level: { select: { name: true } },
      teacher: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  const allClassIds = allClasses.map((row) => row.id);
  const studentCounts = allClassIds.length
    ? await prisma.studentClassHistory.groupBy({
        by: ["classId"],
        where:
          currentSession && currentTerm
            ? {
                classId: { in: allClassIds },
                sessionId: currentSession.id,
                termId: currentTerm.id,
              }
            : { classId: { in: allClassIds } },
        _count: { _all: true },
      })
    : [];

  const studentCountByClassId = new Map(
    studentCounts.map((row) => [row.classId, row._count._all])
  );

  const linkedClassMap = new Map(
    teacher.classTeachers.map((row) => [
      row.class.id,
      {
        id: row.class.id,
        name: row.class.name,
        level: row.class.level.name ?? "-",
        studentCount: studentCountByClassId.get(row.class.id) ?? 0,
      },
    ])
  );

  const linkedClasses = Array.from(linkedClassMap.values());
  const linkableClasses = allClasses
    .filter((row) => !linkedClassMap.has(row.id))
    .map((row) => ({
      id: row.id,
      name: row.name,
      level: row.level.name ?? "-",
      studentCount: studentCountByClassId.get(row.id) ?? 0,
      assignedTeacherName: row.teacher
        ? `${row.teacher.user.firstName} ${row.teacher.user.lastName}`.trim()
        : null,
    }));

  const teacherName = `${teacher.user.firstName} ${teacher.user.lastName}`.trim() || "Teacher";
  const statusLabel =
    teacher.user.status === "ACTIVE"
      ? "Active"
      : teacher.user.status === "SUSPENDED"
        ? "Suspended"
        : "Inactive";

  const uniqueLevels = new Set(linkedClasses.map((item) => item.level)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-nowrap items-start justify-between gap-4 md:items-center md:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">Teacher - Linked Classes</h1>
          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            Manage class teacher assignments for this teacher profile.
          </p>
        </div>
        <SmartBackButton
          fallbackHref={`/admin/teachers/${teacherId}`}
          label="Back"
          sublabel="Return to teacher profile"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Linked Classes</p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{linkedClasses.length}</p>
          <p className="mt-2 text-xs text-slate-500">Classes currently attached</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Available To Link</p>
            <UserPlus className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{linkableClasses.length}</p>
          <p className="mt-2 text-xs text-slate-500">Matches current search</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Unique Levels</p>
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{uniqueLevels}</p>
          <p className="mt-2 text-xs text-slate-500">Distinct linked class levels</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Teacher Summary</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Info label="Name" value={teacherName} />
          <Info label="Teacher ID" value={teacher.teacherId} />
          <Info label="Department" value={teacher.department ?? "-"} />
          <Info label="Status" value={statusLabel} />
          <Info label="Total Linked Classes" value={String(linkedClasses.length)} />
        </div>
      </div>

      <LinkedClassesTable
        teacherId={teacherId}
        linkedClasses={linkedClasses}
        classes={linkableClasses}
        linkAction={linkTeacherClassAction}
        unlinkAction={unlinkTeacherClassAction}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
