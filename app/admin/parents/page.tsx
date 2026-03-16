import UserAvatar from "@/components/UserAvatar";
import {
  Mail,
  Phone,
  Users,
  ArrowUpRight,
  UserCheck,
  UserMinus,
  Layers,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/utils";
import ParentsFilters from "@/components/parents/ParentsFilters";
import AddParentModal from "@/components/modals/AddParentModal";
import { FunctionButttons } from "@/components/FunctionButtons";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";

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
  studentCount: number;
  primaryStudent?: string;
  primaryClass?: string;
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

  const classLookup = new Map(classes.map((item) => [item.id, item.name]));

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
    .map((parent) => {
      const students = parent.parentStudents.map((row) => ({
        id: row.student.id,
        name: `${row.student.user.firstName} ${row.student.user.lastName}`,
        image: row.student.user.image ?? undefined,
      }));

      const primaryStudent = students[0];
      const primaryClassId = primaryStudent ? studentClassMap.get(primaryStudent.id) : undefined;

      return {
        id: parent.id,
        name: `${parent.user.firstName} ${parent.user.lastName}`,
        email: parent.user.email,
        phone: parent.user.phone,
        image: parent.user.image,
        students,
        studentCount: students.length,
        primaryStudent: primaryStudent?.name,
        primaryClass: primaryClassId ? classLookup.get(primaryClassId) : undefined,
      };
    });

  const totalParents = rows.length;
  const parentsWithStudents = rows.filter((parent) => parent.studentCount > 0).length;
  const parentsWithoutStudents = totalParents - parentsWithStudents;
  const multiStudentParents = rows.filter((parent) => parent.studentCount >= 2).length;
  const totalLinkedStudents = new Set(rows.flatMap((parent) => parent.students.map((s) => s.id))).size;
  const avgStudentsPerParent = totalParents ? totalLinkedStudents / totalParents : 0;

  const classCounts = new Map<string, number>();
  rows.forEach((parent) => {
    parent.students.forEach((student) => {
      const cls = studentClassMap.get(student.id);
      if (!cls) return;
      classCounts.set(cls, (classCounts.get(cls) ?? 0) + 1);
    });
  });

  const topClassEntry = Array.from(classCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  const topClassName = topClassEntry ? classLookup.get(topClassEntry[0]) : "N/A";
  const topClassCount = topClassEntry ? topClassEntry[1] : 0;

  const start = (page - 1) * ITEM_PER_PAGE;
  const pagedRows = rows.slice(start, start + ITEM_PER_PAGE);

  return (
    <div className="flex-1 overflow-y-auto space-y-6 pb-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Parents</h1>
            <p className="text-slate-500 text-sm mt-1">
              Overview of parent engagement and student relationships
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
          <FunctionButttons />

          <AddParentModal />
          </div>
        </div>

        <KpiGrid>
          <KpiCard
            label="Total Parents"
            value={totalParents}
            icon={<Users className="h-4 w-4 text-slate-400" />}
            subtext="Active directory size"
          />
          <KpiCard
            label="Linked Students"
            value={totalLinkedStudents}
            icon={<Layers className="h-4 w-4 text-indigo-400" />}
            subtext="Across all parent profiles"
            tone="soft"
          />
          <KpiCard
            label="Parents With Students"
            value={parentsWithStudents}
            icon={<UserCheck className="h-4 w-4 text-emerald-500" />}
            subtext={`${multiStudentParents} with multiple wards`}
            className="bg-linear-to-br from-emerald-50 via-white to-white"
          />
          <KpiCard
            label="Unlinked Parents"
            value={parentsWithoutStudents}
            icon={<UserMinus className="h-4 w-4 text-rose-400" />}
            subtext="Pending student linkage"
            className="bg-linear-to-br from-slate-50 via-white to-white"
          />
        </KpiGrid>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="border-b border-slate-200 bg-linear-to-r from-slate-50 via-white to-slate-50 p-4 grid grid-cols-1 gap-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Parent Directory</h3>
                <p className="text-xs text-slate-500">Detailed view of parent relationships</p>
              </div>
              <span className="text-xs text-slate-500">{totalParents} records</span>
            </div>
          <ParentsFilters classes={classes} initialSearch={search} initialClassId={classId} />
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Linked Students
                  </th>
                  <th className="px-6 py-3 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Primary Class
                  </th>
                  <th className="px-6 py-3 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedRows.map((parent) => (
                  <tr key={parent.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={parent.image}
                          alt={parent.name}
                          size={44}
                          className="h-11 w-11 border border-border"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{parent.name}</p>
                          <p className="text-xs text-slate-500">{parent.primaryStudent ?? "No linked student"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3" />
                          {parent.phone ?? "-"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          {parent.email ?? "-"}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2 overflow-hidden">
                          {parent.students.slice(0, 4).map((student, index) => (
                            <UserAvatar
                              key={index}
                              src={student.image}
                              alt={student.name}
                              size={26}
                              className="h-7 w-7 ring-2 ring-surface"
                            />
                          ))}
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {parent.studentCount}
                        </span>
                      </div>
                      <span className="mt-2 block text-xs text-slate-500">
                        {parent.studentCount
                          ? `${parent.studentCount} student${parent.studentCount > 1 ? "s" : ""}`
                          : "No students linked"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {parent.primaryClass ?? "No class"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <Link
                          href={`/admin/parents/${parent.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-900 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          View
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
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
  );
};

export default Page;
