"use client";

import { useEffect } from "react";

type Props = { open: boolean; onClose: () => void };

export default function TeacherProfilePopover({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* center */}
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        {/* CARD: NOT h-full. Use max height with margin space */}
        <div
          className="
            w-full
            max-w-5xl
            rounded-2xl
            bg-white
            shadow-2xl
            ring-1 ring-black/10
            overflow-hidden
            flex flex-col
            max-h-[calc(100vh-2rem)]
            sm:max-h-[calc(100vh-3rem)]
          "
        >
          {/* header */}
          <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-gray-200 shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Teacher Full Profile
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage teacher information and assignments
            </p>
          </div>

          {/* body scrolls */}
          <div className="px-5 sm:px-8 py-5 overflow-y-auto flex-1">
            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                  1
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Personal Information
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="First Name *">
                  <Input defaultValue="Sarah" />
                </Field>

                <Field label="Last Name *">
                  <Input defaultValue="Johnson" />
                </Field>

                <Field label="Email *">
                  <Input type="email" defaultValue="sarah.johnson@school.com" />
                </Field>

                <Field label="Phone Number *">
                  <Input defaultValue="+234 801 234 5678" />
                </Field>

                <Field label="Date of Birth">
                  <Input type="date" defaultValue="1985-03-20" />
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
                    defaultValue="45 Lekki Phase 1, Lagos State"
                    className="mt-2 min-h-30 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </section>

            <div className="my-7 border-t border-gray-200" />

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center">
                  2
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Professional Details
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Qualification *">
                  <select className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                    <option>NCE</option>
                    <option selected>B.Ed</option>
                    <option>M.Ed</option>
                    <option>PhD</option>
                  </select>
                </Field>

                <Field label="Years of Experience">
                  <Input type="number" defaultValue={8 as any} />
                </Field>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Assigned Subjects *
                  </label>
                  <select
                    multiple
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 h-40"
                    defaultValue={["Mathematics", "Further Mathematics"]}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Further Mathematics">Further Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="English Language">English Language</option>
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
                    multiple
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 h-32"
                    defaultValue={["SS1 A", "SS1 B"]}
                  >
                    <option value="SS1 A">SS1 A</option>
                    <option value="SS1 B">SS1 B</option>
                    <option value="SS2 A">SS2 A</option>
                    <option value="SS3 A">SS3 A</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Classes where this teacher teaches
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Employment Status
                  </label>
                  <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                    <Radio name="teacher-status" label="Active" defaultChecked />
                    <Radio name="teacher-status" label="On Leave" />
                    <Radio name="teacher-status" label="Suspended" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* footer: always visible */}
          <div className="border-t border-gray-200 bg-white px-5 sm:px-8 py-4 shrink-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 rounded-xl bg-indigo-600 px-6 py-4 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Save Teacher Profile
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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 " +
        (props.className ?? "")
      }
    />
  );
}

function Radio({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        name={name}
        defaultChecked={defaultChecked}
        className="h-5 w-5 accent-indigo-600"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  );
}
