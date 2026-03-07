"use client";

import { useRouter } from "next/navigation";
import { deleteTeacherAction } from "@/components/actions/actions";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import FormButton from "@/components/buttons/FormButton";
import UserAvatar from "@/components/UserAvatar";
import type { TeacherFormData } from "@/components/modals/forms/TeacherForm";

type TeacherRow = {
  id: string;
  fullName: string;
  phone: string | null;
  department: string | null;
  className: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  image: string | null;
  formData: TeacherFormData;
};

type TeachersTableProps = {
  teachers: TeacherRow[];
};

export default function TeachersTable({ teachers }: TeachersTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Teacher
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Class
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {teachers.map((teacher) => (
            <tr
              key={teacher.id}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => router.push(`/admin/teachers/${teacher.id}`)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={teacher.image}
                    alt={teacher.fullName}
                    size={40}
                    className="w-10 h-10 border border-border"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{teacher.fullName}</p>
                    <p className="text-[11px] text-slate-500">{teacher.phone ?? "-"}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-700">{teacher.department ?? "-"}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{teacher.className}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 text-xs font-semibold ${
                    teacher.status === "ACTIVE"
                      ? "text-emerald-700 bg-emerald-100"
                      : teacher.status === "SUSPENDED"
                        ? "text-rose-700 bg-rose-100"
                        : "text-amber-700 bg-amber-100"
                  } rounded-full`}
                >
                  {teacher.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div
                  className="flex items-center justify-end gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DeleteButton
                    id={teacher.id}
                    label={teacher.fullName}
                    type="teacher"
                    action={deleteTeacherAction}
                    iconOnly
                  />
                  <FormButton type="teacher" action="edit" data={teacher.formData} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
