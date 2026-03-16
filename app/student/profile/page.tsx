import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import UserAvatar from "@/components/UserAvatar";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";
import { CalendarDays, GraduationCap, ShieldCheck, UserRound } from "lucide-react";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const currentClassRow = await prisma.studentClassHistory.findFirst({
    where: {
      student: { OR: [{ id: userId }, { userId }] },
      session: { isCurrent: true },
      term: { isCurrent: true },
    },
    select: {
      class: {
        select: {
          id: true,
          name: true,
          level: { select: { name: true, type: true } },
        },
      },
    },
  });

  const studentData = await prisma.student.findFirst({
    where: { OR: [{ id: userId }, { userId }] },
    select: {
      id: true,
      admissionNumber: true,
      dateOfBirth: true,
      createdAt: true,
      user: { select: { firstName: true, lastName: true, image: true, email: true } },
      parentStudents: {
        orderBy: { isPrimary: "desc" },
        select: {
          relation: true,
          isPrimary: true,
          parent: {
            select: {
              id: true,
              user: {
                select: { firstName: true, lastName: true, email: true, phone: true, image: true },
              },
            },
          },
        },
      },
      classHistories: {
        where: { session: { isCurrent: true }, term: { isCurrent: true } },
        take: 1,
        select: { class: { select: { id: true, name: true } } },
      },
    },
  });

  const currentClass = studentData?.classHistories[0]?.class ?? currentClassRow?.class ?? null;

  const primaryGuardian =
    studentData?.parentStudents.find((row) => row.isPrimary)?.parent ??
    studentData?.parentStudents[0]?.parent;
  const guardianName = primaryGuardian
    ? `${primaryGuardian.user.firstName} ${primaryGuardian.user.lastName}`
    : "Not assigned";
  const guardianContact =
    primaryGuardian?.user.phone ?? primaryGuardian?.user.email ?? "Not available";

  const studentName = studentData
    ? `${studentData.user.firstName} ${studentData.user.lastName}`
    : "Student";
  const guardianCount = studentData?.parentStudents.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <UserAvatar
              src={studentData?.user.image ?? undefined}
              alt={studentName}
              size={80}
              className="h-16 w-16 border border-slate-200 bg-white shadow-sm sm:h-20 sm:w-20"
            />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Student Profile</p>
              <h1 className="text-lg font-semibold text-slate-900 sm:text-2xl">{studentName}</h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Admission No: {studentData?.admissionNumber ?? "-"}
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {currentClass?.name ?? "Class not assigned"}
          </span>
        </div>
      </div>

      <KpiGrid>
        <KpiCard
          label="Class"
          value={currentClass?.name ?? "-"}
          icon={<GraduationCap className="h-4 w-4 text-slate-400" />}
          subtext="Current class"
        />
        <KpiCard
          label="Guardian"
          value={guardianName}
          icon={<UserRound className="h-4 w-4 text-indigo-500" />}
          subtext={guardianContact}
          tone="soft"
        />
        <KpiCard
          label="Linked Guardians"
          value={guardianCount}
          icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
          subtext="Parent records"
        />
        <KpiCard
          label="Enrollment Date"
          value={studentData?.createdAt ? formatDate(studentData.createdAt) : "-"}
          icon={<CalendarDays className="h-4 w-4 text-white/70" />}
          subtext="Account start"
          tone="dark"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Personal Details</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Full Name</p>
              <p className="mt-1 font-medium text-slate-900">{studentName}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Date of Birth</p>
              <p className="mt-1 font-medium text-slate-900">
                {studentData?.dateOfBirth ? formatDate(studentData.dateOfBirth) : "-"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 font-medium text-slate-900 break-all">{studentData?.user.email ?? "-"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">School Details</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Class / Grade</p>
              <p className="mt-1 font-medium text-slate-900">{currentClass?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Enrollment Date</p>
              <p className="mt-1 font-medium text-slate-900">
                {studentData?.createdAt ? formatDate(studentData.createdAt) : "-"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Primary Guardian</p>
              <p className="mt-1 font-medium text-slate-900">{guardianName}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Guardian Contact</p>
              <p className="mt-1 font-medium text-slate-900 break-all">{guardianContact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
