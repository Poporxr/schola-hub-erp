import BackButton from "@/components/BackButton";
import UserAvatar from "@/components/UserAvatar";
import LoginCredentialsCard from "@/components/student/LoginCredentialsCard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Link2, Sparkles } from "lucide-react";

type PageParams = {
  teacherId?: string;
};

const cardTones = ["bg-blue-50", "bg-green-50", "bg-purple-50", "bg-amber-50"];

function normalizeClerkCredential(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default async function Page({
  params,
}: {
  params?: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = await params;
  const teacherId = resolvedParams?.teacherId;

  if (!teacherId) {
    notFound();
  }

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
      classId: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          image: true,
          status: true,
          passwordHash: true,
        },
      },
      class: {
        select: {
          id: true,
          name: true,
          level: { select: { name: true } },
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
      subjectTeachers: {
        where: assignmentWhere,
        select: {
          subjectId: true,
          classId: true,
          subject: { select: { id: true, name: true } },
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

  const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`.trim() || "Teacher";
  const primaryClass = teacher.class;

  const classMap = new Map<
    string,
    { id: string; name: string; levelName: string | null; isPrimary: boolean }
  >();

  if (primaryClass) {
    classMap.set(primaryClass.id, {
      id: primaryClass.id,
      name: primaryClass.name,
      levelName: primaryClass.level.name,
      isPrimary: true,
    });
  }

  for (const row of teacher.classTeachers) {
    classMap.set(row.class.id, {
      id: row.class.id,
      name: row.class.name,
      levelName: row.class.level.name,
      isPrimary: classMap.get(row.class.id)?.isPrimary ?? false,
    });
  }

  const classIds = Array.from(classMap.keys());

  const classCounts = classIds.length
    ? await prisma.studentClassHistory.groupBy({
        by: ["classId"],
        where:
          currentSession && currentTerm
            ? {
                classId: { in: classIds },
                sessionId: currentSession.id,
                termId: currentTerm.id,
              }
            : {
                classId: { in: classIds },
              },
        _count: { _all: true },
      })
    : [];

  const studentCountByClassId = new Map(
    classCounts.map((row) => [row.classId, row._count._all])
  );

  const subjectRows = teacher.subjectTeachers.map((row) => ({
    key: `${row.subjectId}-${row.classId}`,
    subjectName: row.subject.name,
    className: row.class.name,
    studentCount: studentCountByClassId.get(row.classId) ?? 0,
  }));

  const classRows = Array.from(classMap.values()).map((row) => ({
    ...row,
    studentCount: studentCountByClassId.get(row.id) ?? 0,
  }));

  const subjectSummary =
    teacher.subjectTeachers.length > 0
      ? `${teacher.subjectTeachers.length} Subject${teacher.subjectTeachers.length === 1 ? "" : "s"}`
      : "No subject assignments";

  const statusLabel =
    teacher.user.status === "ACTIVE"
      ? "Active Teacher"
      : teacher.user.status === "SUSPENDED"
        ? "Suspended Teacher"
        : "Inactive Teacher";

  const statusClassName =
    teacher.user.status === "ACTIVE"
      ? "text-green-700 bg-green-100"
      : teacher.user.status === "SUSPENDED"
        ? "text-rose-700 bg-rose-100"
        : "text-amber-700 bg-amber-100";
  const loginCredential = normalizeClerkCredential(teacher.teacherId);
  const loginUsername = loginCredential || "N/A";
  const loginPassword = loginCredential || "N/A";

  const assignmentLabel =
    currentSession && currentTerm
      ? `${currentTerm.name} • ${currentSession.name}`
      : "All recorded assignments";

  const assignmentCount = classRows.length + subjectRows.length;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BackButton />
        <Link
          href={`/admin/teachers/${teacherId}/assignments`}
          className="group inline-flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-linear-to-r from-white to-slate-50 px-3 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:w-auto sm:px-3.5"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
            <Link2 size={15} />
          </span>
          <span className="mr-auto leading-tight">
            <span className="block text-sm font-semibold text-slate-900 sm:hidden">Assignments</span>
            <span className="hidden text-sm font-semibold text-slate-900 sm:block">Manage Assignments</span>
            <span className="hidden text-xs text-slate-500 md:block">Link classes and subjects</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
            <Sparkles size={12} />
            {assignmentCount}
          </span>
          <ChevronRight
            size={16}
            className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600"
          />
        </Link>
      </div>
      <div className="pb-8 pt-5">
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-8">
          <div className="gap-6 md:flex md:items-start">
            <UserAvatar
              src={teacher.user.image}
              alt={fullName}
              size={128}
              className="h-32 w-32 border-4 border-accent-soft"
            />
            <div className="flex-1">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-2xl font-bold text-gray-900">{fullName}</h3>
                  <p className="mb-2 text-gray-500">Teacher ID: {teacher.teacherId}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <Info label="Subjects" value={subjectSummary} />
                <Info label="Department" value={teacher.department ?? "—"} />
                <Info label="Phone" value={teacher.user.phone ?? "—"} />
                <Info label="Email" value={teacher.user.email ?? "—"} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <LoginCredentialsCard username={loginUsername} password={loginPassword} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Assigned Subjects</h3>
            <div className="space-y-3">
              {subjectRows.length ? (
                subjectRows.map((row, index) => (
                  <div
                    key={row.key}
                    className={`rounded-lg p-4 ${cardTones[index % cardTones.length]}`}
                  >
                    <p className="font-semibold text-gray-900">
                      {row.subjectName} - {row.className}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{row.studentCount} Students</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">No subjects assigned</p>
                  <p className="mt-1 text-xs text-gray-500">{assignmentLabel}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Assigned Classes</h3>
            <div className="space-y-3">
              {classRows.length ? (
                classRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{row.name}</p>
                      <p className="text-xs text-gray-500">
                        {row.levelName ?? "Class"} •{" "}
                        {row.isPrimary ? "Primary Class" : "Class Teacher Assignment"}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {row.studentCount} Students
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">No classes assigned</p>
                  <p className="mt-1 text-xs text-gray-500">{assignmentLabel}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

