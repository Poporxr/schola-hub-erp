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
    "w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:px-4 sm:py-3 sm:text-base";

  return (
    <div className="space-y-5 sm:space-y-8">
      <section>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 sm:h-10 sm:w-10 sm:text-sm">
            1
          </span>
          <h3 className="text-base font-bold text-gray-900 sm:text-xl">
            Personal Information
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:gap-5 md:grid-cols-2">
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

          <Field label="Phone Number *">
            <input name="phone" type="tel" required defaultValue={data?.phone ?? ""} className={input} />
          </Field>

          <Field label="Profile Photo">
            <div className="flex items-center gap-4">
              <UserAvatar
                src={undefined}
                alt="Teacher"
                size={48}
                className="h-10 w-10 ring-2 ring-gray-200 sm:h-12 sm:w-12"
              />
              <button
                type="button"
                className="rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-semibold text-gray-900 transition hover:bg-gray-200 sm:px-5 sm:py-3 sm:text-sm"
              >
                Change Photo
              </button>
            </div>
          </Field>
        </div>
      </section>

      <Divider />

      <section>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 sm:h-10 sm:w-10 sm:text-sm">
            2
          </span>
          <h3 className="text-base font-bold text-gray-900 sm:text-xl">
            Professional Details
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:gap-5 md:grid-cols-2">
          <Field label="Department">
            <input name="department" defaultValue={data?.department ?? ""} className={input} />
          </Field>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Employment Status
            </label>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 sm:gap-x-8 sm:gap-y-3">
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
