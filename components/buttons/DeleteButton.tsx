"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";
import { deleteTeacherAction } from "@/components/actions/actions";
import { ModalType } from "../modals/SmartModal";

type DeleteButtonProps = {
  id: string;
  label: string;
  type: ModalType;
  action?: (prevState: { ok: boolean; message?: string; fieldErrors?: Record<string, string> }, formData: FormData) => Promise<{ ok: boolean; message?: string; fieldErrors?: Record<string, string> }>;
  iconOnly?: boolean;
};

export function DeleteButton({
  id,
  label,
  type,
  action = deleteTeacherAction,
  iconOnly = false,
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={iconOnly
          ? "text-slate-400 hover:text-rose-600"
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
        action={action}
        requireText
      />
    </>
  );
}
