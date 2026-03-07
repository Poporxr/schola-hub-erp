"use client";

import { useRouter } from "next/navigation";
import { deleteStudentAction } from "@/components/actions/actions";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import FormButton from "@/components/buttons/FormButton";
import UserAvatar from "@/components/UserAvatar";
import type { StudentFormClasses, StudentFormData } from "@/components/modals/forms/StudentForm";

type StudentRow = {
  id: string;
  admissionNumber: string;
  gender: "MALE" | "FEMALE";
  status: string;
  className: string;
  image: string | null;
  firstName: string;
  lastName: string;
  email: string;
  formData: StudentFormData;
};

type StudentsTableProps = {
  students: StudentRow[];
  classOptions: StudentFormClasses;
};

export default function StudentsTable({ students, classOptions }: StudentsTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Student
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
              Class
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gender
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
          {students.map((student) => (
            <tr
              className="hover:bg-slate-50 cursor-pointer"
              key={student.id}
              onClick={() => router.push(`/admin/students/${student.id}`)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={student.image}
                    alt={`${student.firstName} ${student.lastName}`}
                    size={40}
                    className="w-10 h-10 border border-border"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {`${student.firstName} ${student.lastName}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {student.admissionNumber}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {student.email}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 text-sm text-slate-700 hidden md:table-cell">
                {student.className}
              </td>

              <td className="px-6 py-4 text-sm text-slate-700">
                {student.gender}
              </td>

              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 text-xs font-semibold ${
                    student.status === "ACTIVE"
                      ? "text-emerald-700 bg-emerald-100"
                      : "text-rose-700 bg-rose-100"
                  } rounded-full`}
                >
                  {student.status}
                </span>
              </td>

              <td className="px-6 py-4 text-right">
                <div
                  className="flex items-center justify-end gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DeleteButton
                    id={student.id}
                    label={`${student.firstName} ${student.lastName}`}
                    type="student"
                    action={deleteStudentAction}
                    iconOnly
                  />
                  <FormButton
                    type="student"
                    action="edit"
                    classes={classOptions}
                    data={student.formData}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
