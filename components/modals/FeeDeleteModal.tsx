"use client";

import { useState } from "react";
import { ModalShell } from "./ModalShell";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  label: string;
  entityLabel: string;
  requireText?: boolean;
  onConfirm: (confirmText: string) => Promise<void>;
};

export default function FeeDeleteModal({
  open,
  onClose,
  title,
  subtitle,
  label,
  entityLabel,
  requireText = true,
  onConfirm,
}: Props) {
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const phrase = `delete ${label}`.toLowerCase();
  const canDelete = !requireText || confirmText.trim().toLowerCase() === phrase;

  const handleConfirm = async () => {
    if (!canDelete) return;
    try {
      setSubmitting(true);
      await onConfirm(confirmText);
      setConfirmText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="md"
      footer={
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canDelete || submitting}
              className="w-full rounded-xl bg-red-600 px-6 py-4 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
            >
              Delete
            </button>

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
            <span className="font-semibold">{entityLabel}</span>:{" "}
            <span className="font-semibold">{label}</span>
          </p>
        </div>

        {requireText ? (
          <div>
            <p className="text-sm text-gray-600">
              Type <span className="font-semibold">{phrase}</span> to confirm.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-red-400"
              placeholder={phrase}
            />
          </div>
        ) : null}
      </div>
    </ModalShell>
  );
}
