import { AlertCircle, AlertTriangle, BookOpen, CalendarDays, Clock, Info, Megaphone, UserCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTime, greetingForHour, relativeDaysLabel, todayDateInputValue, weekdayKeyFromDate } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const Page = async () => {
    const { userId } = await auth();
    if (!userId) {
        return <div className="p-6 text-sm text-slate-600">Sign in to view dashboard.</div>;
    }
    const [teacher, currentTerm] = await Promise.all([
        prisma.teacher.findFirst({
            where: { OR: [{ id: userId }, { userId }] },
            select: {
                id: true,
                user: { select: { firstName: true, lastName: true } },
            },
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

    const today = new Date();
    const todayLabel = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(today);
    const todayInput = todayDateInputValue();
    const todayDate = new Date(`${todayInput}T00:00:00.000Z`);
    const weekdayKey = weekdayKeyFromDate(today);

    const [subjectTeachers, classTeachers, attendanceRows, timetableEntriesToday, notices] = await Promise.all([
        prisma.subjectTeacher.findMany({
            where: {
                teacherId: teacher.id,
                sessionId: currentTerm.sessionId,
                termId: currentTerm.id,
            },
            include: {
                subject: { select: { id: true, name: true } },
                class: { select: { id: true, name: true } },
            },
        }),
        prisma.classTeacher.findMany({
            where: {
                teacherId: teacher.id,
                sessionId: currentTerm.sessionId,
                termId: currentTerm.id,
            },
            include: {
                class: { select: { id: true, name: true } },
            },
        }),
        prisma.attendance.findMany({
            where: {
                teacherId: teacher.id,
                date: todayDate,
            },
            select: {
                classId: true,
                subjectId: true,
            },
        }),
        weekdayKey
            ? prisma.timetableEntry.findMany({
                  where: {
                      teacherId: teacher.id,
                      sessionId: currentTerm.sessionId,
                      termId: currentTerm.id,
                      weekday: weekdayKey,
                      status: "ACTIVE",
                  },
                  include: {
                      class: { select: { id: true, name: true } },
                      subject: { select: { id: true, name: true } },
                      venue: { select: { id: true, name: true } },
                  },
                  orderBy: [{ startTime: "asc" }],
              })
            : Promise.resolve([]),
        prisma.notice.findMany({
            where: {
                isPublished: true,
                sessionId: currentTerm.sessionId,
            },
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            take: 2,
            select: {
                id: true,
                title: true,
                message: true,
                publishedAt: true,
                createdAt: true,
            },
        }),
    ]);

    const classIds = Array.from(
        new Set([
            ...classTeachers.map((row) => row.classId),
            ...subjectTeachers.map((row) => row.classId),
        ])
    );





    const subjectIds = Array.from(new Set(subjectTeachers.map((row) => row.subjectId)));
    const totalClasses = classIds.length;
    const totalSubjects = subjectIds.length;

    const attendanceKeys = new Set(
        attendanceRows
            .filter((row) => row.subjectId)
            .map((row) => `${row.classId}-${row.subjectId}`)
    );

    const pendingAttendance = timetableEntriesToday.filter(
        (entry) => !attendanceKeys.has(`${entry.classId}-${entry.subjectId}`)
    );

    const pendingTasks = pendingAttendance.slice(0, 3).map((entry) => ({
        id: entry.id,
        label: "Attendance",
        tone: "orange",
        title: `Mark attendance for ${entry.class.name}`,
        meta: `${entry.subject.name} - ${entry.venue.name}`,
        href: "/teacher/attendance",
    }));

    const greeting = greetingForHour(today.getHours());
    const teacherName = `${teacher.user.firstName} ${teacher.user.lastName}`.trim() || "Teacher";
    const classesToday = timetableEntriesToday.length;

    return (
        <div className="tab-content active space-y-6">
            <div className="bg-linear-to-r from-teal-600 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold mb-2">{greeting}, {teacherName}!</h1>
                <p className="text-teal-100">
                    You have <span className="font-semibold text-white">{classesToday} classes</span> today and{" "}
                    <span className="font-semibold text-white">{pendingAttendance.length} pending attendance</span>{" "}
                    records to mark.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Total Classes</h3>
                        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900">{totalClasses}</span>
                        <span className="text-sm text-gray-500 mb-1">Classes</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Subjects Taught</h3>
                        <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                            <BookOpen className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900">{totalSubjects}</span>
                        <span className="text-sm text-gray-500 mb-1">Subjects</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Pending Tasks</h3>
                        <span className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900">{pendingTasks.length}</span>
                        <span className="text-sm text-orange-600 mb-1">Action Needed</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Today&apos;s Timetable</h3>
                        <span className="text-sm text-gray-500">{todayLabel}</span>
                    </div>
                    {timetableEntriesToday.length ? (
                        <div className="space-y-4">
                            {timetableEntriesToday.map((entry, index) => {
                                const bgClasses = ["bg-teal-50 border-teal-500", "bg-blue-50 border-blue-500", "bg-purple-50 border-purple-500"];
                                const textClasses = ["text-teal-900 text-teal-700 text-teal-600", "text-blue-900 text-blue-700 text-blue-600", "text-purple-900 text-purple-700 text-purple-600"];
                                const styleIndex = index % bgClasses.length;


                                return (
                                    <div key={entry.id} className={`flex gap-4 items-start ${index < timetableEntriesToday.length - 1 ? "pb-4 border-b border-gray-50" : ""}`}>
                                        <div className="w-20 text-sm font-semibold text-gray-500 pt-1">{formatTime(entry.startTime)}</div>
                                        <div className={`flex-1 ${bgClasses[styleIndex]} p-4 rounded-lg border-l-4`}>
                                            <h4 className={`font-bold ${textClasses[styleIndex].split(" ")[0]}`}>{entry.subject.name}</h4>
                                            <p className={`text-sm ${textClasses[styleIndex].split(" ")[1]} mt-1`}>
                                     {entry.venue.name}
                                            </p>
                                            <Link href={"/teacher/attendance"} className={`mt-2 text-xs font-medium hover:underline ${textClasses[styleIndex].split(" ")[2]}`}>
                                                Mark Attendance -&gt;
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No scheduled classes for today.</p>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-6">Pending Tasks</h3>
                    {pendingTasks.length ? (
                        <div className="space-y-4">
                            {pendingTasks.map((task, index) => (
                                <div key={task.id} className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                                    <div className="flex items-start justify-between mb-1">
                                        <span className="text-xs font-semibold text-orange-600 uppercase">{index === 0 ? "Urgent" : "Due Soon"}</span>
                                        {index === 0 ? (
                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-orange-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium">{task.title}</p>
                                    <p className="text-xs text-gray-500">{task.meta}</p>
                                    <Link href={task.href} className="mt-2 text-xs text-orange-600 font-medium hover:underline">
                                        Complete Now -&gt;
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                            <div className="flex items-start justify-between mb-1">
                                <span className="text-xs font-semibold text-gray-600 uppercase">All Clear</span>
                                <Info className="w-4 h-4 text-gray-500" />
                            </div>
                            <p className="text-sm text-gray-800 font-medium">No pending tasks right now.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-6">Recent Announcements</h3>
                {notices.length ? (
                    <div className="space-y-4">
                        {notices.map((notice, index) => (
                            <div key={notice.id} className={`flex gap-4 ${index < notices.length - 1 ? "pb-4 border-b border-gray-100" : ""}`}>
                                <div className={`p-2 ${index % 2 === 0 ? "bg-teal-50 text-teal-600" : "bg-blue-50 text-blue-600"} rounded-lg h-fit`}>
                                    {index % 2 === 0 ? <Megaphone className="w-5 h-5" /> : <CalendarDays className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-1">
                                        <h4 className="font-semibold text-gray-900">{notice.title ?? "Announcement"}</h4>
                                        <span className="text-xs text-gray-500">
                                            {relativeDaysLabel(notice.publishedAt ?? notice.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{notice.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No announcements yet.</p>
                )}
            </div>
        </div>
    );
};

export default Page;
