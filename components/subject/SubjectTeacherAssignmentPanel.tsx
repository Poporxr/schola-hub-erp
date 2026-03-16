"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus } from "lucide-react";
import ConfirmSubjectTeacherLinkModal from "@/components/modals/ConfirmSubjectTeacherLinkModal";

type LinkResult = {
  ok: boolean;
  message?: string;
};

type LinkAction = (formData: FormData) => Promise<LinkResult>;

type TeacherOption = {
  id: string;
  teacherId: string;
  name: string;
  department: string;
  status: string;
};

type AssignedTeacher = TeacherOption & {
  classCount: number;
};

export default function SubjectTeacherAssignmentPanel({
  subjectId,
  canAssign,
  assignedTeachers,
  teacherOptions,
  linkAction,
  unlinkAction,
}: {
  subjectId: string;
  canAssign: boolean;
  assignedTeachers: AssignedTeacher[];
  teacherOptions: TeacherOption[];
  linkAction: LinkAction;
  unlinkAction: LinkAction;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "link" | "unlink";
    teacherId: string;
    teacherName: string;
  }>({
    open: false,
    mode: "link",
    teacherId: "",
    teacherName: "",
  });
  const PAGE_SIZE = 5;

  const canRemoveAny = assignedTeachers.length > 1;
  const canLinkMore = canAssign;

  const statusClass = useMemo(
    () => ({
      ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
      INACTIVE: "bg-amber-50 text-amber-700 border-amber-200",
      SUSPENDED: "bg-rose-50 text-rose-700 border-rose-200",
    }),
    []
  );

  const filteredTeachers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teacherOptions;

    return teacherOptions.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(q) ||
        teacher.teacherId.toLowerCase().includes(q) ||
        teacher.department.toLowerCase().includes(q)
    );
  }, [teacherOptions, query]);

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTeachers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredTeachers.slice(start, start + PAGE_SIZE);
  }, [filteredTeachers, safePage]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Linked Teachers</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Teacher
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Teacher ID
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Department
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Classes
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignedTeachers.length ? (
                assignedTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{teacher.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{teacher.teacherId}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{teacher.department}</td>
                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                          statusClass[teacher.status as keyof typeof statusClass] ??
                            "border-slate-200 bg-slate-50 text-slate-700",
                        ].join(" ")}
                      >
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{teacher.classCount}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setModalState({
                            open: true,
                            mode: "unlink",
                            teacherId: teacher.id,
                            teacherName: teacher.name,
                          })
                        }
                        disabled={!canRemoveAny}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Unlink
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    No teachers assigned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Link Teacher</h3>
          <div className="relative mt-4 max-w-md lg:w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, teacher ID, or department"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Teacher
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Teacher ID
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Department
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTeachers.length ? (
                paginatedTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{teacher.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{teacher.teacherId}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{teacher.department}</td>
                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                          statusClass[teacher.status as keyof typeof statusClass] ??
                            "border-slate-200 bg-slate-50 text-slate-700",
                        ].join(" ")}
                      >
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setModalState({
                            open: true,
                            mode: "link",
                            teacherId: teacher.id,
                            teacherName: teacher.name,
                          })
                        }
                        disabled={!canLinkMore}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Link
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    No matching teachers available to link.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        {!canLinkMore ? (
          <div className="border-t border-slate-100 px-6 py-3 text-xs text-amber-600">
            Maximum of 2 teachers already assigned.
          </div>
        ) : null}
      </section>

      <ConfirmSubjectTeacherLinkModal
        open={modalState.open}
        mode={modalState.mode}
        subjectId={subjectId}
        teacherId={modalState.teacherId}
        teacherName={modalState.teacherName}
        linkAction={linkAction}
        unlinkAction={unlinkAction}
        onClose={() => setModalState((prev) => ({ ...prev, open: false }))}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
