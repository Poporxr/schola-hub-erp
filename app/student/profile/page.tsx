import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import UserAvatar from "@/components/UserAvatar";

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

  const currentClass = studentData?.classHistories[0].class ?? null;

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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Student Profile
          </p>
          <h1 className="text-2xl font-bold">{studentName}</h1>
          <p className="text-sm text-white/70">
            Academic and guardian overview for the current term.
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
                src={studentData?.user.image ?? undefined}
                alt={studentName}
                size={96}
                className="w-24 h-24 border-4 border-white bg-white shadow-sm"
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Admission Number
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {studentData?.admissionNumber ?? "-"}
                </h2>
                <p className="text-sm text-slate-500">
                  {currentClass?.name ?? "Class not assigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Class
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-900">
                {currentClass?.name ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Guardian
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-900">
                {guardianName}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Guardian Contact
              </p>
              <p className="mt-3 text-base font-semibold text-slate-900">
                {guardianContact}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
              <p className="text-xs uppercase tracking-wide text-white/70">
                Enrollment Date
              </p>
              <p className="mt-3 text-xl font-semibold">
                {studentData?.createdAt ? formatDate(studentData.createdAt) : "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Personal Details
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Full Name
                  </label>
                  <p className="text-slate-900 font-medium">{studentName}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Date of Birth
                  </label>
                  <p className="text-slate-900 font-medium">
                    {studentData?.dateOfBirth ? formatDate(studentData.dateOfBirth) : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Email
                  </label>
                  <p className="text-slate-900 font-medium">
                    {studentData?.user.email ?? "-"}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Academic Details
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Class / Grade
                  </label>
                  <p className="text-slate-900 font-medium">
                    {currentClass?.name ?? "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Enrollment Date
                  </label>
                  <p className="text-slate-900 font-medium">
                    {studentData?.createdAt ? formatDate(studentData.createdAt) : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Guardian Name
                  </label>
                  <p className="text-slate-900 font-medium">{guardianName}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase">
                    Guardian Contact
                  </label>
                  <p className="text-slate-900 font-medium">{guardianContact}</p>
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
