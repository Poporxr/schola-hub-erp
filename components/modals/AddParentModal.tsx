"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ModalShell } from "@/components/modals/ModalShell";
import ParentForm from "@/components/modals/forms/ParentForm";
import { createParentAction } from "@/components/actions/actions";
import { Spinner } from "@/components/ui/spinner";

const AddParentModal = () => {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleCreateParent(formData: FormData) {
    setPending(true);

    try {
      await createParentAction(formData);
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              form="parent-create-form"
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-slate-900 px-6 py-4 text-white font-semibold hover:bg-slate-800 transition"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {pending ? <Spinner className="size-4" /> : null}
                Save Parent
              </span>
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto rounded-xl bg-gray-100 px-8 py-4 font-semibold text-gray-900 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        }
      >
        <form id="parent-create-form" action={handleCreateParent} className="space-y-5">
          <ParentForm mode="create" />
        </form>
      </ModalShell>
    </>
  );
};

export default AddParentModal;
