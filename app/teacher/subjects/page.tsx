import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Calculator, FlaskConical, FunctionSquare } from "lucide-react";

const Page = async () => {
  const { userId } = await auth();
  const authGate = !userId ? (
    <div className="p-6 text-sm text-slate-600">Sign in to view subjects.</div>
  ) : null;

  const userIdValue = userId!;

  const teacherFilter = {
    OR: [{ teacherId: userIdValue }, { teacher: { userId: userIdValue } }],
  };

  const [
    subjects,
    classHistories,
    timetableEntries,
    currentTerm,
  ] = userId
    ? await Promise.all([
        prisma.subjectTeacher.findMany({
          where: {
            ...teacherFilter,
            session: { isCurrent: true },
            term: { isCurrent: true },
          },
          include: {
            subject: { select: { id: true, name: true, description: true } },
            class: { select: { id: true, name: true } },
          },
        }),
        prisma.studentClassHistory.findMany({
          where: {
            session: { isCurrent: true },
            term: { isCurrent: true },
            class: {
              subjectTeachers: {
                some: {
                  ...teacherFilter,
                  session: { isCurrent: true },
                  term: { isCurrent: true },
                },
              },
            },
          },
          select: {
            classId: true,
            studentId: true,
          },
        }),
        prisma.timetableEntry.findMany({
          where: {
            ...teacherFilter,
            session: { isCurrent: true },
            term: { isCurrent: true },
            status: "ACTIVE",
          },
          select: {
            id: true,
            subjectId: true,
          },
        }),
        prisma.term.findFirst({
          where: { isCurrent: true, session: { isCurrent: true } },
          select: { name: true },
        }),
      ])
    : [[], [], [], null];

  const classStudents = classHistories.reduce((map, row) => {
    const studentIds = map.get(row.classId) ?? new Set<string>();
    studentIds.add(row.studentId);
    map.set(row.classId, studentIds);
    return map;
  }, new Map<string, Set<string>>());

  const weeklyPeriodsBySubject = timetableEntries.reduce((map, row) => {
    map.set(row.subjectId, (map.get(row.subjectId) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  type SubjectCard = {
    id: string;
    name: string;
    description: string | null;
    classes: { id: string; name: string }[];
  };

  const subjectMap = subjects.reduce((map, row) => {
    const existing = map.get(row.subjectId) ?? {
      id: row.subject.id,
      name: row.subject.name,
      description: row.subject.description,
      classes: [] as { id: string; name: string }[],
    };
    const classAlreadyAdded = existing.classes.some((item) => item.id === row.classId);
    const classes = classAlreadyAdded ? existing.classes : [...existing.classes, { id: row.class.id, name: row.class.name }];
    map.set(row.subjectId, { ...existing, classes });
    return map;
  }, new Map<string, SubjectCard>());

  const subjectStats = Array.from(subjectMap.values())
    .map((item) => ({
      ...item,
      classCount: item.classes.length,
      totalStudents: item.classes.reduce((sum, cls) => sum + (classStudents.get(cls.id)?.size ?? 0), 0),
      weeklyPeriods: weeklyPeriodsBySubject.get(item.id) ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const subjectUi = [
    {
      icon: Calculator,
      iconClass: "bg-teal-50 text-teal-600",
    },
    {
      icon: FunctionSquare,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      icon: FlaskConical,
      iconClass: "bg-purple-50 text-purple-600",
    },
  ];

  return authGate ?? (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">My Teaching Subjects</h3>
            <p className="text-sm text-gray-500">
              Subjects assigned to you this term{currentTerm?.name ? ` (${currentTerm.name})` : ""}
            </p>
          </div>
        </div>

        {subjectStats.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectStats.map((item, index) => {
              const ui = subjectUi[index % subjectUi.length];
              const Icon = ui.icon;

              return (
                <div key={item.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${ui.iconClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 text-lg mb-2">{item.name}</h4>
                  <p className="text-sm text-gray-500 mb-4">{item.description ?? "No subject description available."}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Classes Assigned</span>
                      <span className="font-semibold text-gray-900">
                        {item.classCount} {item.classCount === 1 ? "Class" : "Classes"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Students</span>
                      <span className="font-semibold text-gray-900">
                        {item.totalStudents} {item.totalStudents === 1 ? "Student" : "Students"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Weekly Periods</span>
                      <span className="font-semibold text-gray-900">
                        {item.weeklyPeriods} {item.weeklyPeriods === 1 ? "Period" : "Periods"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Classes:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.classes.map((cls) => (
                        <span key={cls.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {cls.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No subjects assigned to this teacher for the current term.</p>
        )}
      </div>
    </div>
  );
};

export default Page;
