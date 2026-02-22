import BackButton from "@/components/BackButton";
import FormButton from "@/components/buttons/FormButton";
import ClassDetailActions from "@/components/buttons/ClassDetailActions";
import ClassSubjects from "@/components/ClassSubjects";
import ClassStudent from "@/components/List/ClassStudent";
import Pagination from "@/components/Pagination";
import WeeklyTimetable from "@/components/WeeklyTimetable";
import { ArrowUp, Award, BookOpen, Calendar, CalendarCheck, ClipboardList, School, TrendingUp, Trophy, UserCheck, Users } from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params?: { classId?: string } | Promise<{ classId?: string }>;
}) {
  const resolvedParams = await params;
  const classId = resolvedParams?.classId;
  if (!classId) {
    notFound();
  }

  const classInfo = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
  });
  if (!classInfo) {
    notFound();
  }

  const classOptions = [{ id: classInfo.id, name: classInfo.name }];

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

  const [students, classSubjects, timetableEntries] = await Promise.all([
    prisma.student.findMany({
      where: currentSession && currentTerm
        ? { classHistories: { some: { classId, sessionId: currentSession.id, termId: currentTerm.id } } }
        : { classHistories: { some: { classId } } },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        admissionNumber: true,
        gender: true,
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    }),
    prisma.classSubject.findMany({
      where: { classId },
      select: {
        subject: { select: { id: true, name: true } },
      },
    }),
    prisma.timetableEntry.findMany({
      where: currentSession && currentTerm
        ? { classId, sessionId: currentSession.id, termId: currentTerm.id }
        : { classId },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      select: {
        weekday: true,
        startTime: true,
        endTime: true,
        subject: { select: { name: true } },
        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
    }),
  ]);

  const subjectTeachers = await prisma.subjectTeacher.findMany({
    where: { classId },
    select: {
      subjectId: true,
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  const teacherNamesBySubject = new Map<string, string[]>();
  for (const row of subjectTeachers) {
    const name = `${row.teacher.user.firstName} ${row.teacher.user.lastName}`;
    const list = teacherNamesBySubject.get(row.subjectId) ?? [];
    list.push(name);
    teacherNamesBySubject.set(row.subjectId, list);
  }

  const subjects = classSubjects.map((row) => ({
    id: row.subject.id,
    name: row.subject.name,
    teacherNames: teacherNamesBySubject.get(row.subject.id) ?? [],
  }));

  const timetable = timetableEntries.map((entry) => ({
    weekday: entry.weekday,
    startTime: entry.startTime,
    endTime: entry.endTime,
    subject: entry.subject.name,
    teacher: `${entry.teacher.user.firstName} ${entry.teacher.user.lastName}`,
  }));

  // currentTerm resolved above

    return (
        <>
            <BackButton />
            <main className="space-y-10">

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ">
                    <div className="bg-linear-to-r from-indigo-500 to-indigo-600 px-4 sm:px-6 py-6 sm:py-8">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                                    <School className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{classInfo.name}</h1>
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-indigo-100">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="w-4 h-4 shrink-0" />
                                            <span className="text-xs sm:text-sm">
                                                {classInfo.teacher
                                                    ? `${classInfo.teacher.user.firstName} ${classInfo.teacher.user.lastName}`
                                                    : "—"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 shrink-0 " />
                                            <span className="text-xs sm:text-sm">Academic Year {currentSession?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <ClassDetailActions classId={classId} classOptions={classOptions} />
                                <FormButton action="edit" type="class"/>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-200">
                        <div className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{students.length}</p>
                                    <p className="text-xs text-gray-500">Total Students</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg shrink-0">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{subjects.length}</p>
                                    <p className="text-xs text-gray-500">Subjects</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">—</p>
                                    <p className="text-xs text-gray-500">Avg Score</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg shrink-0">
                                    <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{currentTerm?.name ?? "—"}</p>
                                    <p className="text-xs text-gray-500">Current Term</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Average Score</h3>
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">85.4%</p>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <ArrowUp className="w-3 h-3" />
                            +3.2% from last term
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Top Student</h3>
                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                <Award className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" width={10} height={10} alt="Top Student" className="w-10 h-10 rounded-full object-cover shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">Emma Wilson</p>
                                <p className="text-xs text-gray-500">95.8% Average</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Recent Exams</h3>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <ClipboardList className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">3</p>
                        <p className="text-xs text-gray-500">Completed this month</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Attendance Rate</h3>
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <UserCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">92.3%</p>
                        <p className="text-xs text-gray-500">26/28 present today</p>
                    </div>
                </div>

                {/* Students List Section */}
                <ClassStudent students={students} />

                {/* Subjects & Teachers Section */}
                <ClassSubjects subjects={subjects} />

                {/* Weekly Timetable */}
                <WeeklyTimetable entries={timetable} />
            </main>
        </>

    )
}
