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
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  onClose: () => void;
  onSuccess: () => void;
  linkAction: LinkAction;
  unlinkAction: LinkAction;
};

export default function ConfirmSubjectClassLinkModal({
  open,
  mode,
  classId,
  className,
  subjectId,
  subjectName,
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
      formData.set("classId", classId);
      formData.set("subjectId", subjectId);

      const result = await (isLink ? linkAction(formData) : unlinkAction(formData));
      if (result?.ok) {
        toast.success(
          result.message ??
            (isLink
              ? "Subject linked to class successfully."
              : "Subject unlinked from class successfully.")
        );
        onSuccess();
        onClose();
        return;
      }

      toast.error(
        result?.message ??
          (isLink ? "Failed to link subject to class." : "Failed to unlink subject from class.")
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isLink
            ? "Failed to link subject to class."
            : "Failed to unlink subject from class."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isLink ? "Confirm Link Subject" : "Confirm Unlink Subject"}
      subtitle={
        isLink
          ? "This will assign the subject to the selected class."
          : "This will remove the subject from the selected class."
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
            {isLink ? "Yes, Link Subject" : "Yes, Unlink Subject"}
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
          {isLink ? "Link" : "Unlink"} <span className="font-semibold">{subjectName}</span>{" "}
          {isLink ? "to" : "from"} <span className="font-semibold">{className}</span>?
        </p>
      </div>
    </ModalShell>
  );
}
