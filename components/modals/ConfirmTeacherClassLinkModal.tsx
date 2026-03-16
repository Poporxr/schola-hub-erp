"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ModalShell } from "@/components/modals/ModalShell";
import { Spinner } from "@/components/ui/spinner";

type LinkResult = {
  ok: boolean;
  message?: string;
};

type LinkAction = (formData: FormData) => Promise<LinkResult>;

type Props = {
  open: boolean;
  mode: "link" | "unlink";
  teacherId: string;
  classId: string;
  className: string;
  onClose: () => void;
  onSuccess: () => void;
  linkAction: LinkAction;
  unlinkAction: LinkAction;
};

export default function ConfirmTeacherClassLinkModal({
  open,
  mode,
  teacherId,
  classId,
  className,
  onClose,
  onSuccess,
  linkAction,
  unlinkAction,
}: Props) {
  const [pending, setPending] = useState(false);
  const isLink = mode === "link";

  async function handleConfirm() {
    setPending(true);
    try {
      const formData = new FormData();
      formData.set("teacherId", teacherId);
      formData.set("classId", classId);

      const result = await (isLink ? linkAction(formData) : unlinkAction(formData));

      if (result?.ok) {
        toast.success(result.message ?? (isLink ? "Class linked successfully." : "Class unlinked successfully."));
        onSuccess();
        onClose();
        return;
      }

      toast.error(result?.message ?? (isLink ? "Failed to link class." : "Failed to unlink class."));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isLink
            ? "Failed to link class."
            : "Failed to unlink class."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isLink ? "Confirm Link Class" : "Confirm Unlink Class"}
      subtitle={
        isLink
          ? "This will assign the teacher as class teacher for this class."
          : "This will remove the class teacher relationship."
      }
      maxWidth="md"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className={[
              "inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold text-white transition",
              isLink ? "bg-indigo-600 hover:bg-indigo-700" : "bg-rose-600 hover:bg-rose-700",
              pending ? "cursor-not-allowed opacity-70" : "",
            ].join(" ")}
          >
            {pending ? <Spinner className="size-4" /> : null}
            {isLink ? "Yes, Link Class" : "Yes, Unlink Class"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-gray-100 px-8 py-4 text-sm font-semibold text-gray-900 transition hover:bg-gray-200 sm:w-auto"
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">
          {isLink ? "Link" : "Unlink"} <span className="font-semibold">{className}</span>{" "}
          {isLink ? "to" : "from"} this teacher?
        </p>
      </div>
    </ModalShell>
  );
}
