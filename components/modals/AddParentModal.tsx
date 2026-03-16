"use client";

import { useState } from "react";
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={pending}
        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add Parent
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
                Save Parent
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
        <form id="parent-create-form" action={handleCreateParent} className="space-y-4 sm:space-y-5">
          <ParentForm mode="create" disabled={pending} />
        </form>
      </ModalShell>
    </>
  );
};

export default AddParentModal;
