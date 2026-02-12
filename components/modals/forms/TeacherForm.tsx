"use client";

import { subjectsMock } from "@/utils/students";
type ModalMode = "create" | "edit";

export type TeacherFormData = {
  id: string,
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  address?: string;

  qualification?: string;
  yearsExperience?: number | string;

  subjectIds?: string[]; // use IDs in real app
  classIds?: string[];   // use IDs in real app

  status?: "active" | "on_leave" | "suspended";
};

export default function TeacherForm({
  mode,
  data,
}: {
  mode: ModalMode;
  data?: TeacherFormData;
}) {
  
  const input =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  const isEdit = mode === "edit";

  return (
    <div className="space-y-8">
      {/* 1 Personal */}
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
            <input
              name="firstName"
              defaultValue={data?.firstName ?? (isEdit ? "Sarah" : "")}
              className={input}
            />
          </Field>

          <Field label="Last Name *">
            <input
              name="lastName"
              defaultValue={data?.lastName ?? (isEdit ? "Johnson" : "")}
              className={input}
            />
          </Field>

          <Field label="Email *">
            <input
              name="email"
              type="email"
              defaultValue={data?.email ?? (isEdit ? "sarah.johnson@school.com" : "")}
              className={input}
            />
          </Field>

          <Field label="Phone Number *">
            <input
              name="phone"
              type="tel"
              defaultValue={data?.phone ?? (isEdit ? "+234 801 234 5678" : "")}
              className={input}
            />
          </Field>

          <Field label="Date of Birth">
            <input
              name="dob"
              type="date"
              defaultValue={data?.dob ?? (isEdit ? "1985-03-20" : "")}
              className={input}
            />
          </Field>

          <Field label="Profile Photo">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80"
                alt="Teacher"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200"
              />
              <button
                type="button"
                className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition"
              >
                Change Photo
              </button>
            </div>
          </Field>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              defaultValue={data?.address ?? (isEdit ? "45 Lekki Phase 1, Lagos State" : "")}
              className={`${input} mt-2 min-h-30`}
            />
          </div>
        </div>
      </section>

      <Divider />

      {/* 2 Professional */}
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
          <Field label="Qualification *">
            <select
              name="qualification"
              defaultValue={data?.qualification ?? (isEdit ? "B.Ed" : "NCE")}
              className={input}
            >
              <option value="NCE">NCE</option>
              <option value="B.Ed">B.Ed</option>
              <option value="M.Ed">M.Ed</option>
              <option value="PhD">PhD</option>
            </select>
          </Field>

          <Field label="Years of Experience">
            <input
              name="yearsExperience"
              type="number"
              defaultValue={data?.yearsExperience ?? (isEdit ? 8 : "")}
              className={input}
            />
          </Field>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Assigned Subjects *
            </label>
            <select
              name="subjectIds"
              multiple
              defaultValue={data?.subjectIds ?? (isEdit ? ["math", "fmath"] : [])}
              className={`${input} mt-2 h-40`}
            >
              <option value="math">Mathematics</option>
              <option value="fmath">Further Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chem">Chemistry</option>
              <option value="eng">English Language</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Hold Ctrl/Cmd to select multiple subjects
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Assigned Classes
            </label>
            <select
              name="classIds"
              multiple
              defaultValue={data?.classIds ?? (isEdit ? ["ss1a", "ss1b"] : [])}
              className={`${input} mt-2 h-32`}
            >
              <option value="ss1a">SS1 A</option>
              <option value="ss1b">SS1 B</option>
              <option value="ss2a">SS2 A</option>
              <option value="ss3a">SS3 A</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Classes where this teacher teaches
            </p>
          </div>

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
