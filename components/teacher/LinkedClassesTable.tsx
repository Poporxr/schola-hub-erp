"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserMinus, UserPlus } from "lucide-react";
import ConfirmTeacherClassLinkModal from "@/components/modals/ConfirmTeacherClassLinkModal";

type LinkedClass = {
  id: string;
  name: string;
  level: string;
  studentCount: number;
};

type ClassCandidate = LinkedClass & {
  assignedTeacherName?: string | null;
};

type LinkResult = {
  ok: boolean;
  message?: string;
};

type LinkAction = (formData: FormData) => Promise<LinkResult>;

export default function LinkedClassesTable({
  teacherId,
  linkedClasses,
  classes,
  linkAction,
  unlinkAction,
}: {
  teacherId: string;
  linkedClasses: LinkedClass[];
  classes: ClassCandidate[];
  linkAction: LinkAction;
  unlinkAction: LinkAction;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "link" | "unlink";
    classId: string;
    className: string;
  }>({
    open: false,
    mode: "link",
    classId: "",
    className: "",
  });

  const filteredClasses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classes;

    return classes.filter((item) => {
      const teacherName = item.assignedTeacherName?.toLowerCase() ?? "";
      return (
        item.name.toLowerCase().includes(q) ||
        item.level.toLowerCase().includes(q) ||
        teacherName.includes(q)
      );
    });
  }, [classes, query]);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Linked Classes</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Class
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Level
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Students
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {linkedClasses.length ? (
                linkedClasses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.level}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.studentCount}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setModalState({
                            open: true,
                            mode: "unlink",
                            classId: item.id,
                            className: item.name,
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        Unlink
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    No classes linked yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Link Class</h3>

          <div className="relative mt-4 max-w-md lg:w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by class, level, or assigned teacher"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Class
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Level
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Students
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Current Teacher
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.length ? (
                filteredClasses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.level}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.studentCount}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.assignedTeacherName ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setModalState({
                            open: true,
                            mode: "link",
                            classId: item.id,
                            className: item.name,
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
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
                    No matching classes available to link.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmTeacherClassLinkModal
        open={modalState.open}
        mode={modalState.mode}
        teacherId={teacherId}
        classId={modalState.classId}
        className={modalState.className}
        linkAction={linkAction}
        unlinkAction={unlinkAction}
        onClose={() => setModalState((prev) => ({ ...prev, open: false }))}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
