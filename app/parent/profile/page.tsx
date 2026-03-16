import UserAvatar from "@/components/UserAvatar";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { BookUser, GraduationCap, Phone, Users } from "lucide-react";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6 text-sm text-slate-600">Sign in to view profile.</div>;
  }

  const [parent, currentTerm] = await Promise.all([
    prisma.parent.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      select: {
        id: true,
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
        parentStudents: {
          select: {
            relation: true,
            isPrimary: true,
            student: {
              select: {
                id: true,
                admissionNumber: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    image: true,
                    status: true,
                  },
                },
                classHistories: {
                  orderBy: [{ createdAt: "desc" }],
                  select: {
                    class: { select: { name: true } },
                    sessionId: true,
                    termId: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: {
        id: true,
        sessionId: true,
        name: true,
        session: { select: { name: true } },
      },
    }),
  ]);

  if (!parent) {
    return <div className="p-6 text-sm text-slate-600">Parent profile not found.</div>;
  }

  const parentName = `${parent.user.firstName ?? ""} ${parent.user.lastName ?? ""}`.trim() || "Parent";
  const primaryLink = parent.parentStudents.find((link) => link.isPrimary) ?? parent.parentStudents[0];
  const relationship = primaryLink?.relation ?? "Guardian";

  const studentCards = parent.parentStudents.map((link) => {
    const student = link.student;
    const classHistory = currentTerm
      ? student.classHistories.find(
          (history) => history.sessionId === currentTerm.sessionId && history.termId === currentTerm.id
        )
      : student.classHistories[0];

    return {
      id: student.id,
      name: `${student.user.firstName ?? ""} ${student.user.lastName ?? ""}`.trim() || "Student",
      image: student.user.image,
      status: student.user.status ?? "ACTIVE",
      admissionNumber: student.admissionNumber,
      className: classHistory?.class.name ?? "Class not assigned",
      relation: link.relation ?? "Guardian",
    };
  });

  const activeStudents = studentCards.filter((student) => student.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <UserAvatar
              src={parent.user.image ?? undefined}
              alt="Parent"
              size={80}
              className="h-16 w-16 border border-slate-200 bg-white shadow-sm sm:h-20 sm:w-20"
            />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Parent Profile</p>
              <h1 className="text-lg font-semibold text-slate-900 sm:text-2xl">{parentName}</h1>
              <p className="text-xs text-slate-500 sm:text-sm">{relationship}</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {currentTerm?.name ?? "No active term"}
          </span>
        </div>
      </div>

      <KpiGrid>
        <KpiCard
          label="Linked Students"
          value={studentCards.length}
          icon={<Users className="h-4 w-4 text-slate-400" />}
          subtext="Total wards"
        />
        <KpiCard
          label="Active Students"
          value={activeStudents}
          icon={<GraduationCap className="h-4 w-4 text-indigo-500" />}
          subtext="Current status"
          tone="soft"
        />
        <KpiCard
          label="Relationship"
          value={relationship}
          icon={<BookUser className="h-4 w-4 text-emerald-500" />}
          subtext="Primary link"
        />
        <KpiCard
          label="Contact"
          value={parent.user.phone ?? "-"}
          icon={<Phone className="h-4 w-4 text-white/70" />}
          subtext={parent.user.email ?? "-"}
          tone="dark"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Personal Information</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Full Name</p>
              <p className="mt-1 font-medium text-slate-900">{parentName}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Relationship</p>
              <p className="mt-1 font-medium text-slate-900">{relationship}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Email Address</p>
              <p className="mt-1 font-medium text-slate-900 break-all">{parent.user.email ?? "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Phone Number</p>
              <p className="mt-1 font-medium text-slate-900">{parent.user.phone ?? "-"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Current Term</h3>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Term</p>
              <p className="mt-1 font-medium text-slate-900">{currentTerm?.name ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Session</p>
              <p className="mt-1 font-medium text-slate-900">{currentTerm?.session?.name ?? "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">Linked Students</h3>
        <div className="mt-4 space-y-3">
          {studentCards.length ? (
            studentCards.map((student) => (
              <div key={student.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={student.image ?? undefined}
                    alt="Student"
                    size={44}
                    className="h-11 w-11 border border-white bg-white"
                  />
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-slate-900">{student.name}</h4>
                    <p className="text-xs text-slate-500">Admission No: {student.admissionNumber}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                  <p className="text-slate-600">Class: <span className="font-medium text-slate-900">{student.className}</span></p>
                  <p className="text-slate-600">Status: <span className="font-medium text-emerald-600">{student.status ?? "Active"}</span></p>
                  <p className="text-slate-600">Relation: <span className="font-medium text-slate-900">{student.relation}</span></p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">No linked students found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
