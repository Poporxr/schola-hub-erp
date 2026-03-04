import { prisma } from "@/lib/prisma";
import { formatDate, yearsSince } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import UserAvatar from "@/components/UserAvatar";

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
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Teacher Profile
          </p>
          <h1 className="text-2xl font-bold">{fullName}</h1>
          <p className="text-sm text-white/70">
            Staff profile and teaching assignments overview.
          </p>
        </div>
        <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 pt-10 pb-6">
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-6 mb-6">
            <div className="flex items-center gap-4">
              <UserAvatar
                src={teacher.user.image ?? undefined}
                alt={fullName}
                size={96}
                className="w-24 h-24 border-4 border-white bg-white shadow-sm"
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Staff ID
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {teacher.teacherId ?? "-"}
                </h2>
                <p className="text-sm text-slate-500">{statusLabel}</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full">
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Department
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-900">
                {teacher.department ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Subjects
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-900">
                {subjectNames.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Class Teacher
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-900">
                {classTeacherName}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
              <p className="text-xs uppercase tracking-wide text-white/70">
                Years of Service
              </p>
              <p className="mt-3 text-xl font-semibold">{serviceYears}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Personal Information
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Full Name
                  </label>
                  <p className="text-slate-900 font-medium">{fullName}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Email Address
                  </label>
                  <p className="text-slate-900 font-medium">{teacher.user.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Phone Number
                  </label>
                  <p className="text-slate-900 font-medium">
                    {teacher.user.phone ?? "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Address
                  </label>
                  <p className="text-slate-900 font-medium">-</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Employment Details
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Position
                  </label>
                  <p className="text-slate-900 font-medium">Teacher</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Employment Date
                  </label>
                  <p className="text-slate-900 font-medium">{employmentDate}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Qualification
                  </label>
                  <p className="text-slate-900 font-medium">-</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Subjects Taught
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {subjectNames.length ? (
                      subjectNames.map((name) => (
                        <span
                          key={name}
                          className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                        >
                          {name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">
                        No subjects assigned
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Class Teacher
                  </label>
                  <p className="text-slate-900 font-medium">{classTeacherName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
