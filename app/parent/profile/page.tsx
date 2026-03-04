import UserAvatar from "@/components/UserAvatar";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Parent Profile
          </p>
          <h1 className="text-2xl font-bold text-white/80">Account Overview</h1>
          <p className="text-sm text-white/70">
            Parent and guardian information linked to active students.
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
                src={parent.user.image ?? undefined}
                alt="Parent"
                size={96}
                className="w-24 h-24 border-4 border-white bg-white shadow-sm"
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Parent Account
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {parentName}
                </h2>
                <p className="text-sm text-slate-500">{relationship}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Personal Information
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Full Name
                    </label>
                    <p className="text-slate-900 font-medium">
                      {parentName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Relationship
                    </label>
                    <p className="text-slate-900 font-medium">{relationship}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Email Address
                    </label>
                    <p className="text-slate-900 font-medium">
                      {parent.user.email ?? "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Phone Number
                    </label>
                    <p className="text-slate-900 font-medium">{parent.user.phone ?? "-"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Current Term
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Term
                    </label>
                    <p className="text-slate-900 font-medium">{currentTerm?.name ?? "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Session
                    </label>
                    <p className="text-slate-900 font-medium">{currentTerm?.session?.name ?? "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Linked Students
              </h3>
              <div className="space-y-4">
                {studentCards.length ? (
                  studentCards.map((student) => (
                    <div key={student.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white">
                          <UserAvatar
                            src={student.image ?? undefined}
                            alt="Student"
                            size={48}
                            className="w-full h-full"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {student.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Admission No: {student.admissionNumber}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Class:</span>
                          <span className="font-medium text-slate-900"> {student.className}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Status:</span>
                          <span className="font-medium text-emerald-600"> {student.status ?? "Active"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Relation:</span>
                          <span className="font-medium text-slate-900"> {student.relation}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">No linked students found.</div>
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
