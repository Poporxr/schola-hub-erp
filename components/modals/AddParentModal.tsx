"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { ModalShell } from "@/components/modals/ModalShell";
import ParentForm from "@/components/modals/forms/ParentForm";
import { createParentAction } from "@/components/actions/actions";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const AddParentModal = () => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleCreateParent(formData: FormData) {
    if (pending) return;
    setPending(true);

    try {
      const result = await createParentAction(formData);
      if (!result?.ok) {
        throw new Error(result?.message ?? "Failed to create parent");
      }
      toast.success(result?.message ?? "Parent created");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create parent"
      );
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleCreateParent(new FormData(event.currentTarget));
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={pending}
        className="group inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-700 hover:shadow-[0_16px_30px_-18px_rgba(79,70,229,0.4)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white transition-colors group-hover:bg-indigo-600">
          <Plus className="h-3.5 w-3.5" />
        </span>
        Create Parent
      </button>

      <ModalShell
        open={open}
        onClose={() => setOpen(false)}
        title="Add Parent"
        subtitle="Create a parent or guardian profile"
        maxWidth="lg"
        footer={
          <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-4">
            <button
              form="parent-create-form"
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-6 sm:py-4 sm:text-base"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {pending ? <Spinner className="size-4" /> : null}
                {pending ? "Saving..." : "Save Parent"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-200 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
            >
              Cancel
            </button>
          </div>
        }
      >
        <form id="parent-create-form" onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
          <ParentForm mode="create" disabled={pending} />
        </form>
      </ModalShell>
    </>
  );
};

export default AddParentModal;
