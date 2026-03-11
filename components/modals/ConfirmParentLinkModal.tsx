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
  studentId: string;
  parentId: string;
  parentName: string;
  onClose: () => void;
  onSuccess: () => void;
  linkAction: LinkAction;
  unlinkAction: LinkAction;
};

export default function ConfirmParentLinkModal({
  open,
  mode,
  studentId,
  parentId,
  parentName,
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
      formData.set("parentId", parentId);
      formData.set("studentId", studentId);

      if (isLink) {
        formData.set("relation", "Guardian");
        formData.set("isPrimary", "false");
      }

      const result = await (isLink ? linkAction(formData) : unlinkAction(formData));

      if (result?.ok) {
        toast.success(result.message ?? (isLink ? "Parent linked successfully." : "Parent unlinked successfully."));
        onSuccess();
        onClose();
        return;
      }

      toast.error(result?.message ?? (isLink ? "Failed to link parent." : "Failed to unlink parent."));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isLink
            ? "Failed to link parent."
            : "Failed to unlink parent."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isLink ? "Confirm Link Parent" : "Confirm Unlink Parent"}
      subtitle={
        isLink
          ? "This will attach the parent to the student profile."
          : "This will remove the parent relationship from the student profile."
      }
      maxWidth="md"
      footer={
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className={[
              "w-full rounded-xl px-6 py-4 text-sm font-semibold text-white transition inline-flex items-center justify-center gap-2",
              isLink ? "bg-indigo-600 hover:bg-indigo-700" : "bg-rose-600 hover:bg-rose-700",
              pending ? "opacity-70 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {pending ? <Spinner className="size-4" /> : null}
            {isLink ? "Yes, Link Parent" : "Yes, Unlink Parent"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-gray-100 px-8 py-4 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-700">
          {isLink ? "Link" : "Unlink"} <span className="font-semibold">{parentName}</span>{" "}
          {isLink ? "to" : "from"} this student?
        </p>
      </div>
    </ModalShell>
  );
}
