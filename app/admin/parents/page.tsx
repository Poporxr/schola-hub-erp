import Image from "next/image";
import {
  Mail,
  Download,
  Plus,
  Phone,
  MoreHorizontal,
  Users,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/utils";
import ParentsFilters from "@/components/parents/ParentsFilters";

type SearchParams = {
  search?: string | string[];
  classId?: string | string[];
  page?: string | string[];
};

type ParentRow = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
  students: { id: string; name: string; image?: string | null }[];
};

const Page = async ({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) => {
  const resolvedSearchParams = await searchParams;
  const classId = Array.isArray(resolvedSearchParams?.classId)
    ? resolvedSearchParams?.classId[0]
    : resolvedSearchParams?.classId;
  const search = Array.isArray(resolvedSearchParams?.search)
    ? resolvedSearchParams?.search[0]
    : resolvedSearchParams?.search;
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams?.page[0]
    : resolvedSearchParams?.page;
  const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

  const [classes, currentSession, allParents] = await Promise.all([
    prisma.class.findMany({ select: { id: true, name: true }, orderBy: [{ name: "asc" }] }),
    prisma.academicSession.findFirst({ where: { isCurrent: true }, select: { id: true } }),
    prisma.parent.findMany({
      where: {
        ...(search
          ? {
              user: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { phone: { contains: search, mode: "insensitive" } },
                ],
              },
            }
          : {}),
      },
      select: {
        id: true,
        user: { select: { firstName: true, lastName: true, email: true, phone: true, image: true } },
        parentStudents: {
          select: {
            student: {
              select: {
                id: true,
                user: { select: { firstName: true, lastName: true, image: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const currentTerm = currentSession
    ? await prisma.term.findFirst({
        where: { sessionId: currentSession.id, isCurrent: true },
        select: { id: true },
      })
    : null;

  const studentIds = allParents.flatMap((parent) =>
    parent.parentStudents.map((row) => row.student.id)
  );

  const studentClassHistories = currentSession && currentTerm && studentIds.length
    ? await prisma.studentClassHistory.findMany({
        where: {
          studentId: { in: studentIds },
          sessionId: currentSession.id,
          termId: currentTerm.id,
        },
        select: { studentId: true, classId: true },
      })
    : [];

  const studentClassMap = new Map(
    studentClassHistories.map((history) => [history.studentId, history.classId])
  );

  const rows: ParentRow[] = allParents
    .filter((parent) => {
      if (!classId || classId === "all") return true;
      if (!studentClassMap.size) return true;
      return parent.parentStudents.some((row) => studentClassMap.get(row.student.id) === classId);
    })
    .map((parent) => ({
      id: parent.id,
      name: `${parent.user.firstName} ${parent.user.lastName}`,
      email: parent.user.email,
      phone: parent.user.phone,
      image: parent.user.image,
      students: parent.parentStudents.map((row) => ({
        id: row.student.id,
        name: `${row.student.user.firstName} ${row.student.user.lastName}`,
        image: row.student.user.image ?? undefined,
      })),
    }));

  const totalParents = rows.length;
  const start = (page - 1) * ITEM_PER_PAGE;
  const pagedRows = rows.slice(start, start + ITEM_PER_PAGE);

  return (
    <div className="flex-1 overflow-y-auto space-y-3">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Parents</h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage parent records and communications
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Message
              </button>

              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-indigo-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>

              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Add Parent
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-5">Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">Total Parents</p>
                  <Users className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{totalParents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <ParentsFilters classes={classes} initialSearch={search} initialClassId={classId} />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Parent Name
                    </th>
                    <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="p-4 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagedRows.map((parent) => (
                    <tr key={parent.id} className="hover:bg-slate-50 group cursor-pointer">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={parent.image || "/default-avatar.png"}
                            alt={parent.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{parent.name}</p>
                            <p className="text-xs text-slate-500">{parent.email ?? "-"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone className="w-3 h-3" />
                            {parent.phone ?? "-"}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail className="w-3 h-3" />
                            {parent.email ?? "-"}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex -space-x-2 overflow-hidden">
                          {parent.students.slice(0, 4).map((student, index) => (
                            <Image
                              key={index}
                              width={24}
                              height={24}
                              src={student.image ?? "/default-avatar.png"}
                              alt=""
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500 mt-1 block">
                          {parent.students.length
                            ? `${parent.students.length} student${parent.students.length > 1 ? "s" : ""}`
                            : "No students"}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/parents/${parent.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Open parent profile"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                          <button className="text-slate-400 hover:text-indigo-600 p-1">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={page} count={totalParents} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
