"use client";

import { ModalShell}  from "@/components/modals/ModalShell";
import ClassForm from "./forms/ClassForm";
import StudentForm from "./forms/StudentForm";
import SubjectForm from "./forms/SubjectForm";
import TeacherForm from "./forms/TeacherForm";

export type ModalType = "teacher" | "student" | "class" | "subject";
type ModalMode = "create" | "edit";

type Props = {
  open: boolean;
  onClose: () => void;
  type: ModalType;
  mode: ModalMode;
  action: (formData: FormData) => Promise<any>;
  data?: any; // edit defaults
};

export default function SmartModal({ open, onClose, type, mode, action, data }: Props) {
  const meta = getMeta(type, mode);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={meta.title}
      subtitle={meta.subtitle}
      maxWidth={meta.maxWidth}
      footer={
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <form action={action} className="flex-1">
            {mode === "edit" && data?.id ? (
              <input type="hidden" name="id" value={String(data.id)} />
            ) : null}

            <button className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-white font-semibold hover:bg-indigo-700 transition">
              {meta.primaryCta}
            </button>
          </form>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-gray-100 px-8 py-4 font-semibold text-gray-900 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      }
    >
      {type === "class" && <ClassForm mode={mode} data={data} />}
      {type === "student" && <StudentForm mode={mode} data={data} />}
      {type === "subject" && <SubjectForm mode={mode} data={data} />}
      {type === "teacher" && <TeacherForm mode={mode} data={data} />}
    </ModalShell>
  );
}

function getMeta(type: ModalType, mode: ModalMode) {
  const isEdit = mode === "edit";

  if (type === "class") {
    return {
      title: isEdit ? "Edit Class" : "Create Class",
      subtitle: "Manage class details and settings",
      primaryCta: isEdit ? "Save Changes" : "Create Class",
      maxWidth: "md" as const,
    };
  }

  if (type === "student") {
    return {
      title: isEdit ? "Edit Student" : "Student Full Registration",
      subtitle: "Complete student profile with all details",
      primaryCta: isEdit ? "Save Changes" : "Save Student Profile",
      maxWidth: "lg" as const,
    };
  }

  if (type === "subject") {
    return {
      title: isEdit ? "Edit Subject" : "Create Subject",
      subtitle: "Manage subject details and assessment structure",
      primaryCta: isEdit ? "Save Changes" : "Save Subject",
      maxWidth: "md" as const,
    };
  }

  return {
    title: isEdit ? "Edit Teacher" : "Teacher Full Profile",
    subtitle: "Manage teacher information and assignments",
    primaryCta: isEdit ? "Save Changes" : "Save Teacher Profile",
    maxWidth: "lg" as const,
  };
}
