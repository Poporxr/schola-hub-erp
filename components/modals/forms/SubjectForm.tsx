"use client";

type ModalMode = "create" | "edit";

export type SubjectFormData = {
  id?: string;
  name?: string;
  code?: string;
  level?: string;
  description?: string;
  teacherIds?: string[];
  status?: "active" | "inactive";
  classId?: string;

  ca?: number | string;
  exam?: number | string;
  project?: number | string;
  assignment?: number | string;
};

export default function SubjectForm({
  mode,
  data,
}: {
  mode: ModalMode;
  data?: SubjectFormData;
}) {
  const input =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Subject Name *">
          <input
            name="name"
            defaultValue={data?.name ?? (mode === "edit" ? "Mathematics" : "")}
            className={input}
          />
        </Field>

        <Field label="Subject Code *">
          <input
            name="code"
            defaultValue={data?.code ?? (mode === "edit" ? "MTH101" : "")}
            className={input}
          />
        </Field>
      </div>

      <Field label="Level *">
        <select
          name="level"
          defaultValue={data?.level ?? (mode === "edit" ? "Senior Secondary (SS)" : "Primary")}
          className={input}
        >
          <option value="Primary">Primary</option>
          <option value="Junior Secondary (JSS)">Junior Secondary (JSS)</option>
          <option value="Senior Secondary (SS)">Senior Secondary (SS)</option>
        </select>
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          rows={3}
          placeholder="Brief description of the subject"
          defaultValue={
            data?.description ??
            (mode === "edit"
              ? "Core mathematics covering algebra, geometry, trigonometry, and calculus fundamentals."
              : "")
          }
          className={input}
        />
      </Field>

      <div>
        <label className="block text-sm font-semibold text-gray-700">
          Assign Teachers
        </label>
        <select
          name="teacherIds"
          multiple
          defaultValue={data?.teacherIds ?? (mode === "edit" ? ["sarah", "david"] : [])}
          className={`${input} mt-2 h-28`}
        >
          <option value="sarah">Mrs. Sarah Johnson</option>
          <option value="david">Mr. David Chen</option>
          <option value="amara">Ms. Amara Obi</option>
        </select>
        <p className="mt-2 text-xs text-gray-500">Teachers who can teach this subject</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status
        </label>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="active"
              defaultChecked={(data?.status ?? "active") === "active"}
              className="h-5 w-5 accent-indigo-600"
            />
            <span className="text-sm text-gray-800">Active</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="inactive"
              defaultChecked={(data?.status ?? "active") === "inactive"}
              className="h-5 w-5 accent-indigo-600"
            />
            <span className="text-sm text-gray-800">Inactive</span>
          </label>
        </div>
      </div>

      {/* Assessment */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-900">Assessment Structure</h3>

        <div className="mt-4 rounded-2xl bg-gray-50 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Continuous Assessment (%)">
              <input
                name="ca"
                type="number"
                min={0}
                max={100}
                defaultValue={data?.ca ?? (mode === "edit" ? 40 : 0)}
                className={`${input} bg-white`}
              />
            </Field>

            <Field label="Exam (%)">
              <input
                name="exam"
                type="number"
                min={0}
                max={100}
                defaultValue={data?.exam ?? (mode === "edit" ? 60 : 0)}
                className={`${input} bg-white`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Project (%)">
              <input
                name="project"
                type="number"
                min={0}
                max={100}
                defaultValue={data?.project ?? 0}
                className={`${input} bg-white`}
              />
            </Field>

            <Field label="Assignment (%)">
              <input
                name="assignment"
                type="number"
                min={0}
                max={100}
                defaultValue={data?.assignment ?? 0}
                className={`${input} bg-white`}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Total:</span>
            <span className="text-lg font-bold text-gray-900">100%</span>
          </div>
        </div>
      </div>
    </div>
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
