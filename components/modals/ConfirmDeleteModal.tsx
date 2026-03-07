"use client";

import { useActionState, useEffect, useMemo } from "react";
import { ModalShell } from "./ModalShell";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

type EntityType = "class" | "student" | "teacher" | "subject" | "parent";

type DeleteState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

const initialState: DeleteState = { ok: false };

type Props = {
  open: boolean;
  onClose: () => void;

  type: EntityType;

  // the record you’re deleting
  id: string | number;
  label: string; // e.g. "SS1 A" / "Sarah Johnson" / "Mathematics"

  // server action: must accept (prevState, formData)
  action: (prevState: DeleteState, formData: FormData) => Promise<DeleteState>;

  // optional extra safety: require user to type a phrase
  requireText?: boolean;
};

export default function ConfirmDeleteModal({
  open,
  onClose,
  type,
  id,
  label,
  action,
  requireText = true,
}: Props) {
  const meta = useMemo(() => getDeleteMeta(type), [type]);

  const [state, formAction, pending] = useActionState(action, initialState);

  // auto-close when server says ok
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(`${meta.entityLabel} deleted`);
      onClose();
      return;
    }
    if (state.message && !state.ok) {
      toast.error(state.message);
    }
  }, [state, meta.entityLabel, onClose]);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={meta.title}
      subtitle={meta.subtitle}
      maxWidth="md"
      footer={
        <div className="space-y-3">
          {state?.message ? (
            <div
              className={[
                "rounded-xl px-4 py-3 text-sm",
                state.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
              ].join(" ")}
            >
              {state.message}
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-4">
            <form action={formAction} >
              <input type="hidden" name="id" value={String(id)} />
              <input type="hidden" name="type" value={type} />

              {requireText ? (
                <div>
                  {state?.fieldErrors?.confirmText ? (
                    <p className="mt-2 text-sm text-red-600">
                      {state.fieldErrors.confirmText}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-red-600 px-6 py-4 text-white font-semibold hover:bg-red-700 transition"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {pending ? <Spinner className="size-4" /> : null}
                  Delete
                </span>
              </button>
            </form>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl bg-gray-100 px-8 py-4 font-semibold text-gray-900 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Warning:</span> This action cannot be
            undone.
          </p>
          <p className="mt-2 text-sm text-red-800">
            You are about to delete{" "}
            <span className="font-semibold">{meta.entityLabel}</span>:{" "}
            <span className="font-semibold">{label}</span>
          </p>
        </div>

        {meta.hint ? (
          <p className="text-sm text-gray-600">{meta.hint}</p>
        ) : null}
      </div>
    </ModalShell>
  );
}

function getDeleteMeta(type: EntityType) {
  if (type === "class") {
    return {
      title: "Delete Class",
      subtitle: "This will remove the class and related references.",
      entityLabel: "class",
      hint: "If students are assigned to this class, you may need to reassign them first.",
    };
  }
  if (type === "student") {
    return {
      title: "Delete Student",
      subtitle: "This will permanently remove the student profile.",
      entityLabel: "student",
      hint: "Consider archiving instead if you need historical records/results.",
    };
  }
  if (type === "teacher") {
    return {
      title: "Delete Teacher",
      subtitle: "This will remove the teacher account and assignments.",
      entityLabel: "teacher",
      hint: "If this teacher is assigned to classes/subjects, reassign them first.",
    };
  }
  if (type === "subject") {
    return {
      title: "Delete Subject",
      subtitle: "This will remove the subject and its assessment structure.",
      entityLabel: "subject",
      hint: "If results exist for this subject, deletion may affect reports.",
    };
  }
  return {
    title: "Delete Parent",
    subtitle: "This will remove the parent/guardian profile.",
    entityLabel: "parent",
    hint: "Students linked to this parent may lose access for result viewing.",
  };
}
