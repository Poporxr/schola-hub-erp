"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";
import { deleteSubjectAction, deleteTeacherAction } from "@/components/actions/actions";
import { deleteStudentAction } from "@/components/actions/student-actions";
import { ModalType } from "../modals/SmartModal";

type DeleteButtonProps = {
  id: string;
  label: string;
  type: ModalType;
  action?: (prevState: { ok: boolean; message?: string; fieldErrors?: Record<string, string> }, formData: FormData) => Promise<{ ok: boolean; message?: string; fieldErrors?: Record<string, string> }>;
  iconOnly?: boolean;
};

async function unsupportedDeleteAction(
  prevState: { ok: boolean; message?: string; fieldErrors?: Record<string, string> },
  formData: FormData
) {
  void prevState;
  void formData;
  return {
    ok: false,
    message: "Delete action is not configured for this record type.",
  };
}

export function DeleteButton({
  id,
  label,
  type,
  action,
  iconOnly = false,
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const resolvedAction =
    action ??
    (type === "teacher"
      ? deleteTeacherAction
      : type === "subject"
        ? deleteSubjectAction
        : type === "student"
          ? deleteStudentAction
          : unsupportedDeleteAction);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={iconOnly
          ? "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          : "rounded-lg text-red-600 px-3 py-2 cursor-pointer text-xs bg-white hover:text-red-700"}
      >
        {iconOnly ? <Trash2 className="w-4 h-4" /> : "Remove"}
      </button>

      <ConfirmDeleteModal
        open={open}
        onClose={() => setOpen(false)}
        type={type}
        id={id}
        label={label}
        action={resolvedAction}
        requireText
      />
    </>
  );
}
