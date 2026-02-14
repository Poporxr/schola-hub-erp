import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";




const Page = async () => {
    const { userId } = await auth();
    if (!userId) return null;

    const currentClassRow = await prisma.studentClassHistory.findFirst({
        where: {
            student: { id: userId },
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

    const studentData = await prisma.student.findUnique({
        where: { id: userId },
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
    const currentClass = studentData?.classHistories[0].class ?? null

    const primaryGuardian =
        studentData?.parentStudents.find((row) => row.isPrimary)?.parent ??
        studentData?.parentStudents[0]?.parent;
    const guardianName = primaryGuardian
        ? `${primaryGuardian.user.firstName} ${primaryGuardian.user.lastName}`
        : "Not assigned";
    const guardianContact = primaryGuardian?.user.phone ?? primaryGuardian?.user.email ?? "Not available";

    console.log(studentData)
    return (
        <div className=" space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-600"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                            <Image
                                width={50}
                                height={50}
                                alt=""
                                src={studentData?.user.image ?? "/default-avatar.png"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Full Name</label>
                                    <p className="text-gray-900 font-medium">{studentData?.user.firstName + " " + studentData?.user.lastName}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Student ID</label>
                                    <p className="text-gray-900 font-medium">{studentData?.admissionNumber}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                                    <p className="text-gray-900 font-medium">{studentData?.dateOfBirth && formatDate(studentData?.dateOfBirth)}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Email</label>
                                    <p className="text-gray-900 font-medium">{studentData?.user.email}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Academic Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Class / Grade</label>
                                    <p className="text-gray-900 font-medium">{currentClass?.name}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Enrollment Date</label>
                                    <p className="text-gray-900 font-medium">{studentData?.createdAt && formatDate(studentData?.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Guardian Name</label>
                                    <p className="text-gray-900 font-medium">{guardianName}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">Guardian Contact</label>
                                    <p className="text-gray-900 font-medium">{guardianContact}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Page;
