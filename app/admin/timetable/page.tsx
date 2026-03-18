import Link from "next/link";
import { CalendarPlus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/utils";
import Pagination from "@/components/Pagination";
import KpiCard from "@/components/kpi/KpiCard";
import KpiGrid from "@/components/kpi/KpiGrid";

type SearchParams = {
  page?: string | string[];
  search?: string | string[];
};

export default async function AdminTimetablePage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const pageParam = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams?.page[0]
    : resolvedSearchParams?.page;
  const search = Array.isArray(resolvedSearchParams?.search)
    ? resolvedSearchParams?.search[0]
    : resolvedSearchParams?.search;
  const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

  const where = search
    ? {
        OR: [
          { class: { name: { contains: search, mode: "insensitive" as const } } },
          { subject: { name: { contains: search, mode: "insensitive" as const } } },
          { teacher: { user: { firstName: { contains: search, mode: "insensitive" as const } } } },
          { teacher: { user: { lastName: { contains: search, mode: "insensitive" as const } } } },
        ],
      }
    : {};
  let currentTerm: { id: string; sessionId: string; name: string; session: { name: string } } | null = null;
  let entries: {
    id: string;
    weekday: string;
    startTime: string;
    endTime: string;
    status: "ACTIVE" | "CANCELLED";
    class: { name: string };
    subject: { name: string };
    teacher: { user: { firstName: string; lastName: string } };
    session: { name: string } | null;
    term: { name: string } | null;
  }[] = [];
  let totalFiltered = 0;
  let totalEntries = 0;
  let activeCount = 0;
  let cancelledCount = 0;
  let classDistinctRows: { classId: string }[] = [];
  let dbError = "";

  try {
    currentTerm = await prisma.term.findFirst({
      where: { isCurrent: true, session: { isCurrent: true } },
      select: { id: true, sessionId: true, name: true, session: { select: { name: true } } },
    });

    [entries, totalFiltered, totalEntries, activeCount, cancelledCount, classDistinctRows] =
      await Promise.all([
        prisma.timetableEntry.findMany({
          where,
          orderBy: [{ weekday: "asc" }, { startTime: "asc" }, { createdAt: "desc" }],
          skip: ITEM_PER_PAGE * (page - 1),
          take: ITEM_PER_PAGE,
          select: {
            id: true,
            weekday: true,
            startTime: true,
            endTime: true,
            status: true,
            class: { select: { name: true } },
            subject: { select: { name: true } },
            teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
            session: { select: { name: true } },
            term: { select: { name: true } },
          },
        }),
        prisma.timetableEntry.count({ where }),
        prisma.timetableEntry.count(),
        prisma.timetableEntry.count({ where: { status: "ACTIVE" } }),
        prisma.timetableEntry.count({ where: { status: "CANCELLED" } }),
        prisma.timetableEntry.findMany({
          distinct: ["classId"],
          select: { classId: true },
        }),
      ]);
  } catch (error) {
    console.error("AdminTimetablePage failed to load", error);
    dbError = "Database is temporarily unavailable. Please try again shortly.";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Timetable</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage scheduled timetable entries across classes and terms.
          </p>
        </div>
        <Link
          href="/admin/timetable/create-entry"
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <CalendarPlus className="h-4 w-4" />
          Create Entry
        </Link>
      </div>

      <KpiGrid>
        <KpiCard label="Total Entries" value={totalEntries} subtext="All timetable records" />
        <KpiCard label="Active Entries" value={activeCount} subtext="Currently scheduled" />
        <KpiCard label="Cancelled" value={cancelledCount} subtext="Removed schedule slots" />
        <KpiCard
          label="Classes Covered"
          value={classDistinctRows.length}
          subtext={
            currentTerm
              ? `Current: ${currentTerm.name} (${currentTerm.session.name})`
              : "No current term configured"
          }
          tone="dark"
        />
      </KpiGrid>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">All Timetable Entries</h2>
            <p className="text-xs text-slate-500">Search by class, subject, or teacher</p>
          </div>
          <form className="flex w-full max-w-sm items-center gap-2 sm:w-auto" method="GET">
            <div className="relative flex-1 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="search"
                defaultValue={search ?? ""}
                placeholder="Search timetable..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Search
            </button>
          </form>
        </div>

        {dbError ? (
          <div className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-700">{dbError}</div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Subject</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Class</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Teacher</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Schedule</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Session / Term</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {entries.map((entry) => {
                const teacherName = `${entry.teacher.user.firstName} ${entry.teacher.user.lastName}`.trim();
                return (
                  <tr key={entry.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{entry.subject.name}</td>
                    <td className="px-6 py-4 text-slate-700">{entry.class.name}</td>
                    <td className="px-6 py-4 text-slate-700">{teacherName || "-"}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {entry.weekday} {entry.startTime} - {entry.endTime}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {entry.session?.name ?? "-"} / {entry.term?.name ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          entry.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700",
                        ].join(" ")}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination page={page} count={totalFiltered} />
      </section>
    </div>
  );
}
