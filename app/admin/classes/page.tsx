import FormButton from "@/components/buttons/FormButton";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import Link from "next/link";

const Page = async () => {
    const classSelect = {
        id: true,
        capacity: true,
        name: true,
        level: { select: { type: true, name: true } },
        teacher: {
            select: {
                id: true,
                user: { select: { lastName: true, firstName: true } },
            },
        },
        _count: { select: { classHistories: true } },
    } satisfies Prisma.ClassSelect;

    type ClassRow = Prisma.ClassGetPayload<{ select: typeof classSelect }>;

    const classes: ClassRow[] = await prisma.class.findMany({
        orderBy: [{ createdAt: "asc" }],
        select: classSelect,
    });

    return (
        <div className="space-y-6 pt-2">
            <div className="flex justify-between items-center ">
                <h2 className="text-2xl font-bold text-slate-800">Classes</h2>
            <FormButton type={"class"} action="create"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem: ClassRow) => (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow" key={classItem.id}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{classItem.name}</h3>
                                <p className="text-sm text-slate-500">{classItem.level.type}</p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Class Teacher:</span>
                                <span className="font-medium text-slate-900">
                                    {classItem.teacher?.user.firstName + ' ' + classItem.teacher?.user.lastName}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Students:</span>
                                <span className="font-medium text-slate-900">{classItem._count.classHistories}</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                            <Link href={`/admin/classes/${classItem.id}`} className="flex-1 py-2 text-center text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">View Details</Link>
                        </div>
                    </div>
                ))}


            </div>
        </div>
    )
}

export default Page;
