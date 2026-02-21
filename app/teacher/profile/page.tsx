import { prisma } from "@/lib/prisma";
import { formatDate, yearsSince } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";

const Page = async () => {
    const { userId } = await auth();
    if (!userId) {
        return <div className="p-6 text-sm text-slate-600">Sign in to view profile.</div>;
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
        return <div className="p-6 text-sm text-slate-600">Teacher profile not found.</div>;
    }
    if (!currentTerm) {
        return <div className="p-6 text-sm text-slate-600">No current term configured.</div>;
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

    const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`.trim() || "Teacher";
    const statusLabel = teacher.user.status === "ACTIVE" ? "Active Staff" : teacher.user.status;
    const subjectNames = Array.from(new Set(subjectTeachers.map((row) => row.subject.name))).sort((a, b) => a.localeCompare(b));
    const classTeacherName = classTeacher?.class?.name ?? "-";
    const employmentDate = formatDate(teacher.createdAt);
    const serviceYears = yearsSince(teacher.createdAt);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-linear-to-r from-teal-500 to-emerald-600"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                            <Image
                                src={teacher.user.image ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                                alt={fullName}
                            />
                        </div>
                        <span className="px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200">
                            {statusLabel}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Full Name</label>
                                    <p className="text-gray-900 font-medium">{fullName}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Staff ID</label>
                                    <p className="text-gray-900 font-medium">{teacher.teacherId ?? "-"}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                                    <p className="text-gray-900 font-medium">-</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Email Address</label>
                                    <p className="text-gray-900 font-medium">{teacher.user.email}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                                    <p className="text-gray-900 font-medium">{teacher.user.phone ?? "-"}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Address</label>
                                    <p className="text-gray-900 font-medium">-</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Employment Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Position</label>
                                    <p className="text-gray-900 font-medium">Teacher</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Department</label>
                                    <p className="text-gray-900 font-medium">{teacher.department ?? "-"}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Employment Date</label>
                                    <p className="text-gray-900 font-medium">{employmentDate}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Years of Service</label>
                                    <p className="text-gray-900 font-medium">{serviceYears}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Qualification</label>
                                    <p className="text-gray-900 font-medium">-</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Subjects Taught</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {subjectNames.length ? subjectNames.map((name) => (
                                            <span key={name} className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">{name}</span>
                                        )) : (
                                            <span className="text-sm text-gray-500">No subjects assigned</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Class Teacher</label>
                                    <p className="text-gray-900 font-medium">{classTeacherName}</p>
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
