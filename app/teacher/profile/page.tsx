import { prisma } from "@/lib/prisma";
import { formatDate, yearsSince } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import UserAvatar from "@/components/UserAvatar";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";
import { BookOpenCheck, BriefcaseBusiness, CalendarDays, School } from "lucide-react";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Sign in to view profile.
      </div>
    );
  }

  const [teacher, currentTerm] = await Promise.all([
    prisma.teacher.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      select: {
        id: true,
        teacherId: true,
        department: true,
        createdAt: true,
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
      },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, sessionId: true },
    }),
  ]);

  if (!teacher) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Teacher profile not found.
      </div>
    );
  }
  if (!currentTerm) {
    return (
      <div className="p-6 text-sm text-slate-600">
        No current term configured.
      </div>
    );
  }

  const [subjectTeachers, classTeacher] = await Promise.all([
    prisma.subjectTeacher.findMany({
      where: {
        teacherId: teacher.id,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      include: {
        subject: { select: { id: true, name: true } },
      },
    }),
    prisma.classTeacher.findFirst({
      where: {
        teacherId: teacher.id,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      include: {
        class: { select: { id: true, name: true } },
      },
    }),
  ]);

  const fullName =
    `${teacher.user.firstName} ${teacher.user.lastName}`.trim() || "Teacher";
  const statusLabel =
    teacher.user.status === "ACTIVE" ? "Active Staff" : teacher.user.status;
  const subjectNames = Array.from(
    new Set(subjectTeachers.map((row) => row.subject.name))
  ).sort((a, b) => a.localeCompare(b));
  const classTeacherName = classTeacher?.class?.name ?? "-";
  const employmentDate = formatDate(teacher.createdAt);
  const serviceYears = yearsSince(teacher.createdAt);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <UserAvatar
              src={teacher.user.image ?? undefined}
              alt={fullName}
              size={80}
              className="h-16 w-16 border border-slate-200 bg-white shadow-sm sm:h-20 sm:w-20"
            />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Teacher Profile</p>
              <h1 className="text-lg font-semibold text-slate-900 sm:text-2xl">{fullName}</h1>
              <p className="text-xs text-slate-500 sm:text-sm">Staff ID: {teacher.teacherId ?? "-"}</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {statusLabel}
          </span>
        </div>
      </div>

      <KpiGrid>
        <KpiCard
          label="Department"
          value={teacher.department ?? "-"}
          icon={<BriefcaseBusiness className="h-4 w-4 text-slate-400" />}
          subtext="Assigned unit"
        />
        <KpiCard
          label="Subjects"
          value={subjectNames.length}
          icon={<BookOpenCheck className="h-4 w-4 text-indigo-500" />}
          subtext="Current term"
          tone="soft"
        />
        <KpiCard
          label="Class Teacher"
          value={classTeacherName}
          icon={<School className="h-4 w-4 text-emerald-500" />}
          subtext="Homeroom allocation"
        />
        <KpiCard
          label="Years of Service"
          value={serviceYears}
          icon={<CalendarDays className="h-4 w-4 text-white/70" />}
          subtext={`Employed ${employmentDate}`}
          tone="dark"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Personal Information</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Full Name</p>
              <p className="mt-1 font-medium text-slate-900">{fullName}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Email Address</p>
              <p className="mt-1 font-medium text-slate-900 break-all">{teacher.user.email}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Phone Number</p>
              <p className="mt-1 font-medium text-slate-900">{teacher.user.phone ?? "-"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Teaching Details</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Position</p>
              <p className="mt-1 font-medium text-slate-900">Teacher</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Employment Date</p>
              <p className="mt-1 font-medium text-slate-900">{employmentDate}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Class Teacher</p>
              <p className="mt-1 font-medium text-slate-900">{classTeacherName}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Subjects Taught</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {subjectNames.length ? (
                  subjectNames.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No subjects assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
