import Link from "next/link";
import { Search, UserPlus, Users } from "lucide-react";
import { notFound } from "next/navigation";
import LinkedSubjectsTable from "@/components/subject/LinkedSubjectsTable";
import SmartBackButton from "@/components/SmartBackButton";
import { linkSubjectClassAction, unlinkSubjectClassAction } from "@/components/actions/actions";
import { prisma } from "@/lib/prisma";

type PageParams = {
  classId?: string;
};

export default async function ClassSubjectAssignmentsPage({
  params,
}: {
  params?: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = await params;
  const classId = resolvedParams?.classId;
  if (!classId) notFound();

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

  const classRecord = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      level: { select: { name: true } },
      teacher: {
        select: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
      subjects: {
        select: {
          subjectId: true,
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              _count: { select: { classSubjects: true } },
            },
          },
        },
      },
    },
  });

  if (!classRecord) {
    notFound();
  }

  const totalStudents = await prisma.studentClassHistory.count({
    where:
      currentSession && currentTerm
        ? {
            classId,
            sessionId: currentSession.id,
            termId: currentTerm.id,
          }
        : { classId },
  });

  const allSubjects = await prisma.subject.findMany({
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      code: true,
      _count: { select: { classSubjects: true } },
    },
  });

  const linkedSubjectIds = new Set(classRecord.subjects.map((row) => row.subjectId));

  const linkedSubjects = classRecord.subjects.map((row) => ({
    id: row.subject.id,
    name: row.subject.name,
    code: row.subject.code ?? "-",
    assignedClassesCount: row.subject._count.classSubjects,
  }));

  const linkableSubjects = allSubjects
    .filter((subject) => !linkedSubjectIds.has(subject.id))
    .map((subject) => ({
      id: subject.id,
      name: subject.name,
      code: subject.code ?? "-",
      assignedClassesCount: subject._count.classSubjects,
    }));

  const classTeacherName = classRecord.teacher
    ? `${classRecord.teacher.user.firstName} ${classRecord.teacher.user.lastName}`.trim()
    : "Unassigned";

  return (
    <div className="space-y-6">
      <div className="flex flex-nowrap items-start justify-between gap-4 md:items-center md:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
            Class - Linked Subjects
          </h1>
          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            Manage subject assignments for this class profile.
          </p>
        </div>
        <SmartBackButton
          fallbackHref={`/admin/classes/${classId}`}
          label="Back"
          sublabel="Return to class profile"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Linked Subjects</p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{linkedSubjects.length}</p>
          <p className="mt-2 text-xs text-slate-500">Subjects currently attached</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Available To Link</p>
            <UserPlus className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{linkableSubjects.length}</p>
          <p className="mt-2 text-xs text-slate-500">Matches current search</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Students</p>
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{totalStudents}</p>
          <p className="mt-2 text-xs text-slate-500">In this class</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Class Summary</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Info label="Class Name" value={classRecord.name} />
          <Info label="Level" value={classRecord.level.name ?? "-"} />
          <Info label="Class Teacher" value={classTeacherName} />
          <Info label="Linked Subjects" value={String(linkedSubjects.length)} />
          <Info label="Total Students" value={String(totalStudents)} />
        </div>
      </div>

      <LinkedSubjectsTable
        classId={classRecord.id}
        className={classRecord.name}
        linkedSubjects={linkedSubjects}
        subjects={linkableSubjects}
        linkAction={linkSubjectClassAction}
        unlinkAction={unlinkSubjectClassAction}
      />

      <div className="text-xs text-slate-500">
        View full class profile:{" "}
        <Link href={`/admin/classes/${classRecord.id}`} className="font-medium text-slate-900 hover:underline">
          /admin/classes/{classRecord.id}
        </Link>
      </div>
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
