import ScheduleAndNotices from "@/components/student/ScheduleAndNotices";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { BookOpen, CheckCircle, Library, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AttendanceStatus } from "@/generated/prisma/client";
import AttendanceRateCards from "@/components/AttendanceRateCards";


const Page = async () => {
    const { userId } = await auth();
    if (!userId) {
        return <div className="p-6 text-sm text-slate-600">Sign in to view your dashboard.</div>;
    }

    const currentTerm = await prisma.term.findFirst({
        where: { isCurrent: true, session: { isCurrent: true } },
        select: { id: true, sessionId: true },
    });
    if (!currentTerm) {
        return <div className="p-6 text-sm text-slate-600">No current term is configured.</div>;
    }

    const studentData = await prisma.student.findFirst({
        where: { OR: [{ id: userId }, { userId }] },
        select: {
            id: true,
            admissionNumber: true,
            user: { select: { firstName: true, lastName: true } },
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
                where: { sessionId: currentTerm.sessionId, termId: currentTerm.id },
                take: 1,
                select: {
                    classId: true,
                    class: {
                        select: {
                            id: true,
                            name: true,
                            _count: {
                                select: {
                                    subjects: true
                                },
                            },
                            subjects: {
                                select: {
                                    subject: { select: { id: true, name: true, code: true } },
                                },
                            },
                            timetableEntries: {
                                where: {
                                    sessionId: currentTerm.sessionId,
                                    termId: currentTerm.id,
                                    status: "ACTIVE",
                                },
                                orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
                                select: {
                                    id: true,
                                    weekday: true,
                                    startTime: true,
                                    endTime: true,
                                    subject: { select: { id: true, name: true } },
                                    teacher: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
                                    venue: { select: { id: true, name: true } },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!studentData) {
        return <div className="p-6 text-sm text-slate-600">No student profile is linked to this account.</div>;
    }


    const [present, absent, late, notices] = await Promise.all([
        prisma.attendance.count({
            where: {
                studentId: studentData.id,
                status: AttendanceStatus.PRESENT,
                sessionId: currentTerm.sessionId,
                termId: currentTerm.id,
            },
        }),
        prisma.attendance.count({
            where: {
                studentId: studentData.id,
                status: AttendanceStatus.ABSENT,
                sessionId: currentTerm.sessionId,
                termId: currentTerm.id,
            },
        }),
        prisma.attendance.count({
            where: {
                studentId: studentData.id,
                status: AttendanceStatus.LATE,
                sessionId: currentTerm.sessionId,
                termId: currentTerm.id,
            },
        }),
        prisma.notice.findMany({
            where: {
                isPublished: true,
                OR: [
                    { targetAudience: "ALL" },
                    { targetAudience: "STUDENT" },
                    { targetAudience: "STUDENTS" },
                ],
            },
            orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            select: {
                id: true,
                from: true,
                message: true,
                priority: true,
            },
            take: 8,
        }),
    ])

    const currentClassHistory = studentData.classHistories[0];
    const subjectCount = currentClassHistory?.class._count.subjects ?? 0;
    const schedule = currentClassHistory?.class.timetableEntries ?? [];
    return (
        <div id="dashboard" className=" active space-y-6">
            {/*Welcome Banner */}
            <div className="bg-linear-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-2">{`Welcome back, ${studentData?.user.lastName}! 👋`}</h1>

                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                    <BookOpen className="w-64 h-64" />
                </div>
            </div>

            {/*Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Attendance</h3>
                        <span className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                        </span>
                    </div>
                    <AttendanceRateCards present={present} absent={absent} late={late} />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Last Position</h3>
                        <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <TrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900">3rd</span>
                        <span className="text-sm text-gray-500 mb-1">/ 23</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Last updated: Yesterday</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Total Subjects</h3>
                        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Library className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-gray-900">{subjectCount}</span>
                        <span className="text-sm text-gray-500 mb-1">Active</span>
                    </div>
                    <Link href={"/student/subjects"} className="text-sm text-indigo-600 font-medium mt-3 hover:underline">View All &rarr;</Link>
                </div>
            </div>
            <ScheduleAndNotices schedule={schedule} notices={notices} />
        </div>
    );
}
export default Page;
