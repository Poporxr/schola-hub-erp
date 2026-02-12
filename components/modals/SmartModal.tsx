"use client";

import { ModalShell}  from "@/components/modals/ModalShell";
import ClassForm, { type ClassFormData } from "./forms/ClassForm";
import StudentForm, { type StudentFormClasses, type StudentFormData } from "./forms/StudentForm";
import SubjectForm, { type SubjectFormData } from "./forms/SubjectForm";
import TeacherForm, { type TeacherFormData } from "./forms/TeacherForm";

export type ModalType = "teacher" | "student" | "class" | "subject";
type ModalMode = "create" | "edit";

type BaseProps = {
  open: boolean;
  onClose: () => void;
  mode: ModalMode;
  action: (formData: FormData) => void | Promise<void>;
};

type Props =
  | (BaseProps & {
      type: "student";
      data?: StudentFormData;
      classes?: StudentFormClasses;
    })
  | (BaseProps & {
      type: "class";
      data?: ClassFormData;
    })
  | (BaseProps & {
      type: "subject";
      data?: SubjectFormData;
    })
  | (BaseProps & {
      type: "teacher";
      data?: TeacherFormData;
    });

export default function SmartModal(props: Props) {
  const { open, onClose, type, mode, action } = props;
  const studentData = type === "student" ? props.data : undefined;
  const studentClasses = type === "student" ? props.classes : undefined;
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
            {type === "student" && mode === "edit" && studentData?.id ? (
              <input type="hidden" name="id" value={String(studentData.id)} />
            ) : null}
            {type === "teacher" && mode === "edit" && props.data?.id ? (
              <input type="hidden" name="id" value={String(props.data.id)} />
            ) : null}
            {type === "subject" && mode === "edit" && props.data?.id ? (
              <input type="hidden" name="id" value={String(props.data.id)} />
            ) : null}
            {type === "subject" && props.data?.classId ? (
              <input type="hidden" name="classId" value={String(props.data.classId)} />
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
      {type === "class" && <ClassForm mode={mode} data={props.data} />}
      {type === "student" && <StudentForm classes={studentClasses} mode={mode} data={studentData} />}
      {type === "subject" && <SubjectForm mode={mode} data={props.data} />}
      {type === "teacher" && <TeacherForm mode={mode} data={props.data} />}
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
