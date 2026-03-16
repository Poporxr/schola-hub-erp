import Link from "next/link";
import { notFound } from "next/navigation";
import SmartBackButton from "@/components/SmartBackButton";
import SubjectTeacherAssignmentPanel from "@/components/subject/SubjectTeacherAssignmentPanel";
import { linkSubjectTeacherAction, unlinkSubjectTeacherAction } from "@/components/actions/actions";
import { prisma } from "@/lib/prisma";

type PageParams = {
  id?: string;
};

export default async function SubjectTeacherAssignmentPage({
  params,
}: {
  params?: PageParams | Promise<PageParams>;
}) {
  const resolvedParams = await params;
  const subjectId = resolvedParams?.id;

  if (!subjectId) {
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

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: {
      id: true,
      name: true,
      code: true,
      classSubjects: {
        select: {
          classId: true,
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
          teacherId: true,
          classId: true,
          teacher: {
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
            },
          },
        },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  const teacherPool = await prisma.teacher.findMany({
    orderBy: [{ createdAt: "desc" }],
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
    },
  });

  const assignedMap = new Map<
    string,
    {
      id: string;
      teacherId: string;
      name: string;
      department: string;
      status: string;
      classIds: Set<string>;
    }
  >();

  for (const row of subject.subjectTeachers) {
    const existing = assignedMap.get(row.teacherId);
    if (existing) {
      existing.classIds.add(row.classId);
      continue;
    }

    assignedMap.set(row.teacherId, {
      id: row.teacher.id,
      teacherId: row.teacher.teacherId,
      name: `${row.teacher.user.firstName} ${row.teacher.user.lastName}`.trim(),
      department: row.teacher.department ?? "-",
      status: row.teacher.user.status,
      classIds: new Set([row.classId]),
    });
  }

  const assignedTeachers = Array.from(assignedMap.values()).map((item) => ({
    id: item.id,
    teacherId: item.teacherId,
    name: item.name,
    department: item.department,
    status: item.status,
    classCount: item.classIds.size,
  }));

  const assignedTeacherIds = new Set(assignedTeachers.map((item) => item.id));
  const teacherOptions = teacherPool
    .filter((teacher) => !assignedTeacherIds.has(teacher.id))
    .map((teacher) => ({
      id: teacher.id,
      teacherId: teacher.teacherId,
      name: `${teacher.user.firstName} ${teacher.user.lastName}`.trim(),
      department: teacher.department ?? "-",
      status: teacher.user.status,
    }));

  const assignedCount = assignedTeachers.length;
  const canAssign = assignedCount < 2;
  const coverageLabel = `${assignedCount} of 2 teachers assigned`;

  return (
    <div className="space-y-6">
      <div className="flex flex-nowrap items-start justify-between gap-4 md:items-center md:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">Subject Teacher Assignment</h1>
          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            Manage teacher assignment for this subject.
          </p>
        </div>
        <SmartBackButton
          fallbackHref="/admin/subjects"
          label="Back"
          sublabel="Return to subject"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Subject Summary</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Subject Name" value={subject.name} />
          <Info label="Subject Code" value={subject.code ?? "-"} />
          <Info label="Assigned Teachers" value={String(assignedCount)} />
          <Info label="Coverage" value={coverageLabel} />
        </div>
      </div>

      {subject.classSubjects.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          This subject is not linked to any class yet. Link it to class(es) first before assigning teachers.
        </div>
      ) : null}

      <SubjectTeacherAssignmentPanel
        subjectId={subject.id}
        canAssign={canAssign && subject.classSubjects.length > 0}
        assignedTeachers={assignedTeachers}
        teacherOptions={teacherOptions}
        linkAction={linkSubjectTeacherAction}
        unlinkAction={unlinkSubjectTeacherAction}
      />

      <div className="text-xs text-slate-500">
        View subjects list:{" "}
        <Link href="/admin/subjects" className="font-medium text-slate-900 hover:underline">
          /admin/subjects
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
