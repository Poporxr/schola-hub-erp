import UserAvatar from "@/components/UserAvatar";
import { BookOpen } from "lucide-react";
import { role } from "@/lib/utils";
import { DeleteButton } from "./buttons/DeleteButton";

export type SubjectCardItem = {
  id: string;
  name: string;
  code?: string;
  schedule?: string;
  teacherNames: string[];
};

const SubjectCard = ({ subjects }: { subjects: SubjectCardItem[] }) => {
  if (!subjects.length) {
    return (
      <div className="px-4 sm:px-6 py-10">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No subjects added yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            This class does not have any subjects listed yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Subject
            </th>
            <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Schedule
            </th>
            <th className="px-4 sm:px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Staff
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {subjects.map((subject) => {
            const primaryTeacher = subject.teacherNames[0] ?? "Not assigned";
            const extraTeachers = subject.teacherNames.slice(1);

            return (
              <tr key={subject.id} className="align-top">
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <BookOpen className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {subject.name}
                      </p>
                      {subject.code ? (
                        <p className="mt-1 text-xs text-slate-500">{subject.code}</p>
                      ) : null}
                    </div>
                  </div>
                </td>

                <td className="px-4 sm:px-6 py-4">
                  <p className="text-sm text-slate-700">{subject.schedule ?? "—"}</p>
                </td>

                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      src={undefined}
                      alt={primaryTeacher}
                      size={32}
                      className="h-8 w-8 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {primaryTeacher}
                      </p>

                      {extraTeachers.length > 0 ? (
                        <p className="mt-1 text-xs text-slate-500">
                          +{extraTeachers.length} more: {extraTeachers.join(", ")}
                        </p>
                      ) : subject.teacherNames.length === 0 ? (
                        <p className="mt-1 text-xs text-amber-600">
                          No staff assigned yet
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectCard;