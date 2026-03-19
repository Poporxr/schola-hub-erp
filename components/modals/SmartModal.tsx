"use client";

import { useState, type FormEvent } from "react";
import { ModalShell}  from "@/components/modals/ModalShell";
import ClassForm, { type ClassFormData, type ClassFormMeta } from "./forms/ClassForm";
import StudentForm, { type StudentFormClasses, type StudentFormData } from "./forms/StudentForm";
import SubjectForm, { type SubjectFormData } from "./forms/SubjectForm";
import TeacherForm, { type TeacherFormData } from "./forms/TeacherForm";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { subjectSchema } from "./zod-schemas/subjectForm";
import { createClassSchema, updateClassSchema } from "./zod-schemas/classForm";

export type ModalType = "teacher" | "student" | "class" | "subject";
type ModalMode = "create" | "edit";

type BaseProps = {
  open: boolean;
  onClose: () => void;
  mode: ModalMode;
  action: (formData: FormData) => unknown | Promise<unknown>;
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
      meta?: ClassFormMeta;
    })
  | (BaseProps & {
      type: "subject";
      data?: SubjectFormData;
    })
  | (BaseProps & {
      type: "teacher";
      data?: TeacherFormData;
    });

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


export default function SmartModal(props: Props) {
  const { open, onClose, type, mode, action } = props;
  const studentData = type === "student" ? props.data : undefined;
  const studentClasses = type === "student" ? props.classes : undefined;
  const meta = getMeta(type, mode);
  const shouldToast =
    type === "student" || type === "teacher" || type === "subject" || type === "class";
  const formId = `smart-modal-${type}-${mode}-form`;
  const [pending, setPending] = useState(false);

  function validateSubjectFormData(formData: FormData) {
    const raw = Object.fromEntries(formData.entries());
    const parsed = subjectSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid subject data");
    }
  }

  function validateClassFormData(formData: FormData) {
    const raw = Object.fromEntries(formData.entries());
    const parsed =
      mode === "edit" ? updateClassSchema.safeParse(raw) : createClassSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid class data");
    }
  }

  async function handleAction(formData: FormData) {
    if (pending) return;
    setPending(true);

    try {
      if (type === "subject") {
        validateSubjectFormData(formData);
      }
      if (type === "class") {
        validateClassFormData(formData);
      }

      const result = await action(formData);

      if (
        result &&
        typeof result === "object" &&
        "ok" in result &&
        (result as { ok?: boolean; message?: string }).ok === false
      ) {
        throw new Error(
          (result as { message?: string }).message ??
            (type === "teacher" ? "Failed to save teacher" : "Failed to save student")
        );
      }

      if (shouldToast) {
        const label =
          type === "teacher"
            ? mode === "edit"
              ? "Teacher updated"
              : "Teacher created"
            : type === "class"
              ? mode === "edit"
                ? "Class updated"
                : "Class created"
            : type === "student"
              ? mode === "edit"
                ? "Student updated"
                : "Student created"
              : mode === "edit"
                ? "Subject updated"
                : "Subject created";
        toast.success(label);
      }
      onClose();
    } catch (error) {
      if (shouldToast) {
        const message =
          error instanceof Error
            ? error.message
            : type === "teacher"
              ? "Failed to save teacher"
              : type === "class"
                ? "Failed to save class"
              : type === "subject"
                ? "Failed to save subject"
                : "Failed to save student";
        toast.error(message);
      }
    } finally {
      setPending(false);
    }
  }

  function handleSubjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleAction(new FormData(event.currentTarget));
  }

  function handleClassSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleAction(new FormData(event.currentTarget));
  }

  function handleTeacherSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleAction(new FormData(event.currentTarget));
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={meta.title}
      subtitle={meta.subtitle}
      maxWidth={meta.maxWidth}
      footer={
        <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-4">
          <button
            type="submit"
            form={formId}
            disabled={pending}
            className="w-full flex-1 rounded-full border border-slate-800 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(15,23,42,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:from-slate-800 hover:to-slate-900 hover:shadow-[0_18px_34px_-18px_rgba(79,70,229,0.55)] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-4 sm:text-base"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {pending ? <Spinner className="size-4" /> : null}
              {pending ? "Saving..." : meta.primaryCta}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            Cancel
          </button>
        </div>
      }
    >
      {type === "student" ? (
        <StudentForm
          formId={formId}
          action={undefined}
          onValidSubmit={handleAction}
          classes={studentClasses}
          mode={mode}
          data={studentData}
          disabled={pending}
          showSubmitButton={false}
        />
      ) : type === "subject" ? (
        <SubjectForm
          formId={formId}
          onSubmit={handleSubjectSubmit}
          mode={mode}
          data={props.data}
          disabled={pending}
        />
      ) : type === "class" ? (
        <ClassForm
          formId={formId}
          onSubmit={handleClassSubmit}
          mode={mode}
          data={props.data}
          meta={props.meta}
          disabled={pending}
        />
      ) : (
        <form id={formId} onSubmit={handleTeacherSubmit} className="space-y-5 sm:space-y-8">
          <fieldset disabled={pending} className="space-y-5 disabled:opacity-70 sm:space-y-8">
          {type === "teacher" && mode === "edit" && props.data?.id ? (
          <input type="hidden" name="id" value={String(props.data.id)} />
          ) : null}

          {type === "teacher" && <TeacherForm mode={mode} data={props.data} />}
          </fieldset>
        </form>
      )}
    </ModalShell>
  );
}
