import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) {
    return <div className="p-6 text-sm text-slate-600">Sign in to view classes.</div>;
  }

  const [teacher, currentTerm] = await Promise.all([
    prisma.teacher.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      select: { id: true },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, sessionId: true, name: true },
    }),
  ]);

  if (!teacher) {
    return <div className="p-6 text-sm text-slate-600">Teacher profile not found.</div>;
  }
  if (!currentTerm) {
    return <div className="p-6 text-sm text-slate-600">No current term configured.</div>;
  }

  const [classTeacherRows, subjectTeacherRows] = await Promise.all([
    prisma.classTeacher.findMany({
      where: {
        teacherId: teacher.id,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      select: { classId: true, class: { select: { id: true, name: true } } },
    }),
    prisma.subjectTeacher.findMany({
      where: {
        teacherId: teacher.id,
        sessionId: currentTerm.sessionId,
        termId: currentTerm.id,
      },
      select: {
        classId: true,
        subjectId: true,
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
    }),
  ]);

  const classMap = new Map<string, { id: string; name: string; isClassTeacher: boolean; subjectNames: string[] }>();

  for (const row of classTeacherRows) {
    classMap.set(row.classId, { id: row.class.id, name: row.class.name, isClassTeacher: true, subjectNames: [] });
  }

  for (const row of subjectTeacherRows) {
    const existing = classMap.get(row.classId) ?? {
      id: row.class.id,
      name: row.class.name,
      isClassTeacher: false,
      subjectNames: [],
    };
    if (!existing.subjectNames.includes(row.subject.name)) {
      existing.subjectNames.push(row.subject.name);
    }
    classMap.set(row.classId, existing);
  }

  const filteredClasses = Array.from(classMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  const classStats = await Promise.all(
    filteredClasses.map(async (item) => {
      const [totalStudents, weeklyPeriods] = await Promise.all([
        prisma.studentClassHistory.count({
          where: {
            classId: item.id,
            sessionId: currentTerm.sessionId,
            termId: currentTerm.id,
          },
        }),
        prisma.timetableEntry.count({
          where: {
            classId: item.id,
            teacherId: teacher.id,
            sessionId: currentTerm.sessionId,
            termId: currentTerm.id,
            status: "ACTIVE",
          },
        }),
      ]);

      return {
        ...item,
        totalStudents,
        weeklyPeriods,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">My Assigned Classes</h3>
            <p className="text-sm text-gray-500">
              Classes you teach this term ({currentTerm.name})
            </p>
          </div>
        </div>

        {classStats.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classStats.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                    <p className="text-sm text-gray-500">Assigned class</p>
                  </div>
                  {item.isClassTeacher ? (
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                      Class Teacher
                    </span>
                  ) : null}
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Students</span>
                    <span className="font-semibold text-gray-900">{item.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subject{item.subjectNames.length > 1 ? "s" : ""}</span>
                    <span className="font-semibold text-gray-900 text-right">
                      {item.subjectNames.length ? item.subjectNames.join(", ") : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Weekly Periods</span>
                    <span className="font-semibold text-gray-900">{item.weeklyPeriods} Periods</span>
                  </div>
                </div>

                <Link
                  href={`/teacher/classes/${item.id}`}
                  className="block w-full rounded-lg border border-teal-600 text-teal-600 hover:bg-teal-50 py-2 px-4 text-center font-medium text-sm transition-colors whitespace-nowrap"
                >
                  View Class Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No assigned classes found for the current term.</p>
        )}
      </div>
    </div>
  );
};

export default Page;
