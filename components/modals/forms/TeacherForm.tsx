"use client";

import UserAvatar from "@/components/UserAvatar";

type ModalMode = "create" | "edit";

export type TeacherFormData = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  status?: "active" | "on_leave" | "suspended";
};

export default function TeacherForm({
  data,
}: {
  mode: ModalMode;
  data?: TeacherFormData;
}) {
  const input =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
            1
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Personal Information
          </h3>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="First Name *">
            <input name="firstName" defaultValue={data?.firstName ?? ""} className={input} />
          </Field>

          <Field label="Last Name *">
            <input name="lastName" defaultValue={data?.lastName ?? ""} className={input} />
          </Field>

          <Field label="Email *">
            <input
              name="email"
              type="email"
              defaultValue={data?.email ?? ""}
              className={input}
            />
          </Field>

          <Field label="Phone Number">
            <input name="phone" type="tel" defaultValue={data?.phone ?? ""} className={input} />
          </Field>

          <Field label="Profile Photo">
            <div className="flex items-center gap-4">
              <UserAvatar
                src={undefined}
                alt="Teacher"
                size={48}
                className="h-12 w-12 ring-2 ring-gray-200"
              />
              <button
                type="button"
                className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition"
              >
                Change Photo
              </button>
            </div>
          </Field>
        </div>
      </section>

      <Divider />

      <section>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
            2
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Professional Details
          </h3>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Department">
            <input name="department" defaultValue={data?.department ?? ""} className={input} />
          </Field>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Employment Status
            </label>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <Radio
                name="status"
                value="active"
                label="Active"
                defaultChecked={(data?.status ?? "active") === "active"}
              />
              <Radio
                name="status"
                value="on_leave"
                label="On Leave"
                defaultChecked={(data?.status ?? "active") === "on_leave"}
              />
              <Radio
                name="status"
                value="suspended"
                label="Suspended"
                defaultChecked={(data?.status ?? "active") === "suspended"}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-200" />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Radio({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="h-5 w-5 accent-indigo-600"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  );
}
