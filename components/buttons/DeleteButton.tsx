"use client";

import { useState } from "react";
import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";
import { deleteTeacherAction } from "@/components/actions/actions";
import { ModalType } from "../modals/SmartModal";

type DeleteButtonProps = {
  id: string;
  label: string;
  type: ModalType;
};

export function DeleteButton({ id, label, type }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg text-red-600 px-3 py-2 cursor-pointer text-xs bg-white hover:text-red-700"
      >
        Remove
      </button>

      <ConfirmDeleteModal
        open={open}
        onClose={() => setOpen(false)}
        type={type}
        id={id}
        label={label}
        action={deleteTeacherAction}
        requireText
      />
    </>
  );
}
