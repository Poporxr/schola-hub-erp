import ParentAttendanceClient from "@/components/parent/ParentAttendanceClient";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getParentAttendanceData } from "@/lib/parentAttendance";

export const dynamic = "force-dynamic";

const Page = async ({ searchParams }: { searchParams?: { studentId?: string } }) => {
    const { userId } = await auth();
    if (!userId) {
        return <div className="p-6 text-sm text-slate-600">Sign in to view attendance.</div>;
    }

    const parent = await prisma.parent.findFirst({
        where: { OR: [{ id: userId }, { userId }] },
        select: {
            id: true,
            parentStudents: {
                select: {
                    student: {
                        select: {
                            id: true,
                            admissionNumber: true,
                            user: { select: { firstName: true, lastName: true } },
                        },
                    },
                },
            },
        },
    });

    if (!parent) {
        return <div className="p-6 text-sm text-slate-600">Parent profile not found.</div>;
    }
    const children = parent.parentStudents.map((row) => row.student);
    if (!children.length) {
        return <div className="p-6 text-sm text-slate-600">No linked students found for this parent.</div>;
    }

    const selectedId = searchParams?.studentId ?? children[0].id;
    const initialResult = await getParentAttendanceData({ userId, studentId: selectedId });
    if (!initialResult.ok) {
        return <div className="p-6 text-sm text-slate-600">{initialResult.error}</div>;
    }

    return (
        <ParentAttendanceClient
            students={children.map((child) => ({
                id: child.id,
                firstName: child.user.firstName,
                lastName: child.user.lastName,
            }))}
            initialStudentId={selectedId}
            initialData={initialResult.data}
        />
    );
};

export default Page;
