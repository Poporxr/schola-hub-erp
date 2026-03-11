import Link from "next/link";
import { Search, UserPlus, Users } from "lucide-react";
import LinkedParentsTable from "@/components/student/LinkedParentsTable";
import { linkParentStudentAction, unlinkParentStudentAction } from "@/components/actions/student-actions";
import SmartBackButton from "@/components/SmartBackButton";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";


type ParentRelationship = "Father" | "Mother" | "Guardian";

function toParentRelationship(value: string | null | undefined): ParentRelationship {
  if (value === "Father" || value === "Mother" || value === "Guardian") {
    return value;
  }
  return "Guardian";
}

export default async function StudentParentsPage({
  params,
}: {
  params: { studentId: string };
}) {
  const { studentId } = await params;
      if (!studentId) notFound();
  
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

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            id: true,
            admissionNumber: true,
            gender: true,
            dateOfBirth: true,
            address: true,
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    status: true,
                    email: true,
                    phone: true,
                    image: true,
                },
            },
            classHistories: currentSession && currentTerm
                ? {
                    where: { sessionId: currentSession.id, termId: currentTerm.id },
                    take: 1,
                    select: { id: true, class: { select: { id: true, name: true } } },
                }
                : {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    select: { id: true, class: { select: { id: true, name: true } } },
                },
            parentStudents: {
                select: {
                    relation: true,
                    isPrimary: true,
                    parent: {
                        select: {
                          id: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    phone: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!student) notFound();
    const linkedParents = student.parentStudents.map((parentWard) => ({
        id: parentWard.parent.id,
        name: `${parentWard.parent.user.firstName} ${parentWard.parent.user.lastName}`,
        email: parentWard.parent.user.email ?? "-",
        phone: parentWard.parent.user.phone ?? "-",
        image: parentWard.parent.user.image,
        relationship: toParentRelationship(parentWard.relation),
    }));
    const studentClass = student.classHistories.length > 0 ? student.classHistories[0].class.name : "N/A";
    const studentName = `${student.user.firstName} ${student.user.lastName}`.trim();  
    const linkableParents = await prisma.parent.findMany({
        where: {
            NOT: {
                parentStudents: {
                    some: { studentId },
                },
            },
        },
        select: {
            id: true,
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    image: true,
                },
            },
            _count: {
              select: { parentStudents: true },
            },
        },
    });

    const parentCandidates = linkableParents.map((parent) => ({
      id: parent.id,
      name: `${parent.user.firstName} ${parent.user.lastName}`.trim(),
      email: parent.user.email ?? "-",
      phone: parent.user.phone ?? "-",
      image: parent.user.image,
      linkedStudentsCount: parent._count.parentStudents,
    }));

  return (
    <div className="space-y-6">

      <div className="flex flex-nowrap items-start justify-between gap-4 md:items-center md:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">Student - Linked Parents</h1>
          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            Manage parent relationships for this student profile.
          </p>
        </div>
        <SmartBackButton
          fallbackHref={`/admin/students/${studentId}`}
          label="Back"
          sublabel="Return to student profile"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Linked Parents</p>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{linkedParents.length}</p>
          <p className="mt-2 text-xs text-slate-500">Parents currently attached</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-indigo-50 via-white to-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Available To Link</p>
            <UserPlus className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{linkableParents.length}</p>
          <p className="mt-2 text-xs text-slate-500">Matches current search</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-slate-500">Unique Contacts</p>
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {new Set(linkedParents.map((parent) => parent.email)).size}
          </p>
          <p className="mt-2 text-xs text-slate-500">Distinct linked emails</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Student Summary</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Info label="Name" value={studentName} />
          <Info label="Admission Number" value={student.admissionNumber} />
          <Info label="Class" value={studentClass} />
          <Info label="Gender" value={student.gender} />
          <Info label="Total Linked Parents" value={String(linkedParents.length)} />
        </div>
      </div>
      <LinkedParentsTable
        studentId={studentId}
        linkedParents={linkedParents}
        parents={parentCandidates}
        linkAction={linkParentStudentAction}
        unlinkAction={unlinkParentStudentAction}
      />
      <div className="text-xs text-slate-500">
        View full student profile:{" "}
        <Link
          href={`/admin/students/${params.studentId}`}
          className="font-medium text-slate-900 hover:underline"
        >
          /admin/students/{params.studentId}
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
