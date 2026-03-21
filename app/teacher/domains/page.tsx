import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import TeacherDomainEntryClient from "@/components/teacher/TeacherDomainEntryClient";
import { notFound, redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

type SearchParams = {
  classId?: string | string[];
};

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

function toScale(value: number | null): 1 | 2 | 3 | 4 | 5 | null {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) {
    return value;
  }
  return null;
}

export default async function TeacherDomainsPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const classIdParam = firstParam(resolvedSearchParams?.classId);

  const [teacher, currentTerm] = await Promise.all([
    prisma.teacher.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      select: { id: true },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, name: true, sessionId: true, session: { select: { name: true } } },
    }),
  ]);

  if (!teacher) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Teacher profile not found.
      </div>
    );
  }

  if (!currentTerm) {
    notFound();
  }

  const assignments = await prisma.classTeacher.findMany({
    where: { teacherId: teacher.id },
    select: {
      classId: true,
      sessionId: true,
      termId: true,
      class: { select: { id: true, name: true } },
      session: { select: { id: true, name: true, startDate: true } },
      term: { select: { id: true, name: true, startDate: true } },
    },
    orderBy: [
      { session: { startDate: "desc" } },
      { term: { startDate: "asc" } },
      { class: { name: "asc" } },
    ],
  });

  if (!assignments.length) {
    notFound();
  }

  const currentTermAssignments = assignments.filter(
    (row) => row.sessionId === currentTerm.sessionId && row.termId === currentTerm.id
  );

  if (!currentTermAssignments.length) {
    notFound();
  }

  const classes = Array.from(
    new Map(
      currentTermAssignments
        .map((row) => [
          row.classId,
          {
            id: row.class.id,
            name: row.class.name,
            sessionId: row.sessionId,
            termId: row.termId,
          },
        ])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const selectedClassId =
    (classIdParam && classes.some((item) => item.id === classIdParam)
      ? classIdParam
      : undefined) ??
    classes[0]?.id ??
    "";

  const selectedSessionId = currentTerm.sessionId;
  const selectedTermId = currentTerm.id;
  const selectedSessionName = currentTerm.session.name;
  const selectedTermName = currentTerm.name;
  const selectedClassName = classes.find((item) => item.id === selectedClassId)?.name ?? "-";

  const classHistories = selectedClassId
    ? await prisma.studentClassHistory.findMany({
        where: {
          classId: selectedClassId,
          sessionId: selectedSessionId,
          termId: selectedTermId,
        },
        select: {
          id: true,
          studentId: true,
          student: {
            select: {
              id: true,
              admissionNumber: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: [{ student: { admissionNumber: "asc" } }],
      })
    : [];

  const studentIds = classHistories.map((item) => item.studentId);
  const domainRecords = studentIds.length
    ? await prisma.studentDomainRecord.findMany({
        where: {
          classId: selectedClassId,
          sessionId: selectedSessionId,
          termId: selectedTermId,
          studentId: { in: studentIds },
        },
        select: {
          studentId: true,
          punctuality: true,
          neatness: true,
          politeness: true,
          honesty: true,
          relationshipWithOthers: true,
          handwriting: true,
          sportsAndGames: true,
          drawingAndPainting: true,
          musicalSkills: true,
          verbalFluency: true,
        },
      })
    : [];

  const recordByStudentId = new Map(
    domainRecords.map((record) => [record.studentId, record])
  );

  const rows = classHistories.map((history) => {
    const existing = recordByStudentId.get(history.studentId);
    return {
      studentId: history.student.id,
      admissionNumber: history.student.admissionNumber,
      fullName: `${history.student.user.lastName} ${history.student.user.firstName}`.trim(),
      image: history.student.user.image,
      punctuality: toScale(existing?.punctuality ?? null),
      neatness: toScale(existing?.neatness ?? null),
      politeness: toScale(existing?.politeness ?? null),
      honesty: toScale(existing?.honesty ?? null),
      relationshipWithOthers: toScale(existing?.relationshipWithOthers ?? null),
      handwriting: toScale(existing?.handwriting ?? null),
      sportsAndGames: toScale(existing?.sportsAndGames ?? null),
      drawingAndPainting: toScale(existing?.drawingAndPainting ?? null),
      musicalSkills: toScale(existing?.musicalSkills ?? null),
      verbalFluency: toScale(existing?.verbalFluency ?? null),
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Behaviour Entry</p>
          <h1 className="text-2xl font-bold text-white/90">Enter Domains</h1>
          <p className="text-sm text-white/70">
            Enter affective and psychomotor scores for your class only. Entries are scoped by session and term.
          </p>
        </div>
        <div className="absolute right-4 top-4 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-0 bottom-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <TeacherDomainEntryClient
        sessionId={selectedSessionId}
        sessionName={selectedSessionName}
        termId={selectedTermId}
        termName={selectedTermName}
        classId={selectedClassId}
        className={selectedClassName}
        rows={rows}
      />

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Permission is restricted to class teachers only. Admin and subject teachers cannot edit this section.
          </p>
        </div>
      </div>
    </div>
  );
}
