"use client";

type ModalMode = "create" | "edit";

export type ClassFormData = {
  name?: string;
  arm?: string;
  level?: string;
  classTeacherId?: string; // use ID in real app
  maxStudents?: number | string;
  room?: string;
  status?: "active" | "inactive";
};

export default function ClassForm({
  mode,
  data,
}: {
  mode: ModalMode;
  data?: ClassFormData;
}) {
  const input =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  const isEdit = mode === "edit";

  return (
    <div className="space-y-6">
      {/* Grid 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Class Name *">
          <input
            name="name"
            defaultValue={data?.name ?? (isEdit ? "SS1" : "")}
            className={input}
          />
        </Field>

        <Field label="Class Arm">
          <input
            name="arm"
            defaultValue={data?.arm ?? (isEdit ? "A" : "")}
            className={input}
          />
        </Field>
      </div>

      {/* Grid 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Level *">
          <select
            name="level"
            defaultValue={data?.level ?? (isEdit ? "Senior Secondary" : "Primary")}
            className={input}
          >
            <option value="Nursery">Nursery</option>
            <option value="Primary">Primary</option>
            <option value="Junior Secondary">Junior Secondary</option>
            <option value="Senior Secondary">Senior Secondary</option>
          </select>
        </Field>

        <Field label="Class Teacher *">
          {/* In real app map teachers with IDs */}
          <select
            name="classTeacherId"
            defaultValue={data?.classTeacherId ?? (isEdit ? "sarah" : "")}
            className={input}
          >
            <option value="">Select teacher</option>
            <option value="sarah">Mrs. Sarah Johnson</option>
            <option value="david">Mr. David Chen</option>
            <option value="amara">Ms. Amara Obi</option>
          </select>
        </Field>
      </div>

      {/* Grid 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Maximum Students">
          <input
            name="maxStudents"
            type="number"
            defaultValue={data?.maxStudents ?? (isEdit ? 40 : "")}
            className={input}
          />
        </Field>

        <Field label="Room/Block">
          <input
            name="room"
            defaultValue={data?.room ?? (isEdit ? "Block A, Room 12" : "")}
            className={input}
          />
        </Field>
      </div>

      {/* Status */}
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
