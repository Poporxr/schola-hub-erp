"use client";

import type { FormEvent } from "react";

type ModalMode = "create" | "edit";

export type ClassFormData = {
  id?: string;
  name?: string;
  levelId?: string;
  maxStudents?: number | null;
  promotionTrack?: "NURSERY" | "PRIMARY" | "JSS" | "SSS" | "OTHER";
  promotionRank?: number;
  isTerminal?: boolean;
};

export type ClassFormMeta = {
  levels: Array<{ id: string; name: string; type: "PRIMARY" | "SECONDARY" }>;
};

export default function ClassForm({
  formId,
  onSubmit,
  mode,
  data,
  meta,
  disabled = false,
}: {
  formId: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  mode: ModalMode;
  data?: ClassFormData;
  meta?: ClassFormMeta;
  disabled?: boolean;
}) {
  const input =
    "w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:px-4 sm:py-3 sm:text-base";

  const levels = meta?.levels ?? [];
  
  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
      <fieldset disabled={disabled} className="space-y-5 disabled:opacity-70 sm:space-y-6">
        {mode === "edit" && data?.id ? <input type="hidden" name="id" value={data.id} /> : null}

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <Field label="Class Name *">
            <input name="name" defaultValue={data?.name ?? ""} className={input} />
          </Field>

          <Field label="Level *">
            <select
              name="levelId"
              defaultValue={data?.levelId ?? ""}
              className={input}
              disabled={levels.length === 0}
            >
              <option value="">Select level</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5">
          <Field label="Maximum Students">
            <input
              name="maxStudents"
              type="number"
              min={1}
              defaultValue={data?.maxStudents ?? ""}
              className={input}
            />
          </Field>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 sm:text-base">Promotion Metadata</h3>
          <p className="mt-1 text-xs text-gray-500">
            Used by academic rollover to auto-suggest progression.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            <Field label="Promotion Track *">
              <select
                name="promotionTrack"
                defaultValue={data?.promotionTrack ?? "OTHER"}
                className={`${input} bg-white`}
              >
                <option value="NURSERY">Nursery</option>
                <option value="PRIMARY">Primary</option>
                <option value="JSS">JSS</option>
                <option value="SSS">SSS</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>

            <Field label="Promotion Rank *">
              <input
                name="promotionRank"
                type="number"
                min={0}
                defaultValue={data?.promotionRank ?? 0}
                className={`${input} bg-white`}
              />
            </Field>
          </div>

          <label className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="isTerminal"
              defaultChecked={Boolean(data?.isTerminal)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Mark as graduating class
          </label>
        </div>
      </fieldset>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
