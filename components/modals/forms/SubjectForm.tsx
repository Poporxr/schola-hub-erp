"use client";

import type { FormEvent } from "react";

type ModalMode = "create" | "edit";

export type SubjectFormData = {
  id?: string;
  name?: string;
  code?: string;
  description?: string;
  classId?: string;

  ca?: number | string;
  exam?: number | string;
  project?: number | string;
};

export default function SubjectForm({
  formId,
  onSubmit,
  mode,
  data,
  disabled = false,
}: {
  formId: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  mode: ModalMode;
  data?: SubjectFormData;
  disabled?: boolean;
}) {
  const input =
    "w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:px-4 sm:py-3 sm:text-base";

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
      <fieldset disabled={disabled} className="space-y-5 disabled:opacity-70 sm:space-y-6">
        {mode === "edit" && data?.id ? <input type="hidden" name="id" value={data.id} /> : null}
        {data?.classId ? <input type="hidden" name="classId" value={data.classId} /> : null}

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          <Field label="Subject Name *">
            <input
              name="name"
              defaultValue={data?.name ?? ""}
              className={input}
            />
          </Field>

          <Field label="Subject Code *">
            <input
              name="code"
              defaultValue={data?.code ?? ""}
              className={input}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            name="description"
            rows={3}
            placeholder="Brief description of the subject"
            defaultValue={data?.description ?? ""}
            className={input}
          />
        </Field>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-base font-bold text-gray-900 sm:text-lg">Assessment Structure</h3>

          <div className="mt-4 space-y-4 rounded-2xl bg-gray-50 p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <Field label="Continuous Assessment (%)">
                <input
                  name="ca"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={data?.ca ?? 10}
                  className={`${input} bg-white`}
                />
              </Field>

              <Field label="Exam (%)">
                <input
                  name="exam"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={data?.exam ?? 60}
                  className={`${input} bg-white`}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <Field label="Project (%)">
                <input
                  name="project"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={data?.project ?? 30}
                  className={`${input} bg-white`}
                />
              </Field>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <span className="text-sm font-semibold text-gray-700">Total:</span>
              <span className="text-lg font-bold text-gray-900">100%</span>
            </div>
          </div>
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
