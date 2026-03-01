"use client";

import UserAvatar from "@/components/UserAvatar";

type ModalMode = "create" | "edit";

export type StudentFormClasses = { id: string; name: string }[];

export type StudentFormData = {
  id?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE";
  classId?: string;
  arm?: string;
  admissionNumber?: string;
  admissionDate?: string;
  previousSchool?: string;

  guardianName?: string;
  guardianRelationship?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianAddress?: string;

  healthNotes?: string;
  allergies?: string;
  additionalInfo?: string;
};

export default function StudentForm({
  mode,
  data,
  classes,
}: {
  mode: ModalMode;
  data?: StudentFormData;
  classes?: StudentFormClasses;
}) {
  void mode;
  const defaultGender = "MALE" as const;
  const input =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  const sectionTitle = "text-lg font-bold text-gray-900 flex items-center gap-3";

  return (
    <div className="space-y-8">
      {/* 1 Personal */}
      <section>
        <div className={sectionTitle}>
          <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
            1
          </span>
          Personal Information
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="First Name *">
            <input
              name="firstName"
              defaultValue={data?.firstName ?? ""}
              className={input}
            />
          </Field>

          <Field label="Last Name *">
            <input
              name="lastName"
              defaultValue={data?.lastName ?? ""}
              className={input}
            />
          </Field>

          <Field label="Middle Name">
            <input
              name="middleName"
              defaultValue={data?.middleName ?? ""}
              className={input}
            />
          </Field>

          <Field label="Date of Birth *">
            <input
              name="dateOfBirth"
              type="date"
              defaultValue={data?.dateOfBirth ?? ""}
              className={input}
            />
          </Field>

          <Field label="Gender *">
            <select
              name="gender"
              defaultValue={data?.gender ?? defaultGender}
              className={input}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </Field>

          <Field label="Passport Photo">
            <div className="flex items-center gap-4">
              <UserAvatar
                src={undefined}
                alt="Student"
                size={48}
                className="w-12 h-12 border-2 border-gray-200"
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

      {/* 2 Academic */}
      <section>
        <div className={sectionTitle}>
          <span className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
            2
          </span>
          Academic Information
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Class *">
            <select
              name="classId"
              defaultValue={data?.classId ?? ""}
              className={input}
            >
              <option value="" disabled>
                Select class
              </option>
              {(classes ?? []).map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Section (Arm)">
            <input
              name="arm"
              defaultValue={data?.arm ?? ""}
              className={input}
            />
          </Field>

          <Field label="Admission No. *">
            <input
              name="admissionNumber"
              defaultValue={data?.admissionNumber ?? ""}
              className={input}
            />
          </Field>

          <Field label="Admission Date *">
            <input
              name="admissionDate"
              type="date"
              defaultValue={data?.admissionDate ?? ""}
              className={input}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Previous School">
              <input
                name="previousSchool"
                placeholder="Optional"
                defaultValue={data?.previousSchool ?? ""}
                className={input}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* 3 Guardian */}
      <section>
        <div className={sectionTitle}>
          <span className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">
            3
          </span>
          Parent/Guardian Information
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Full Name *">
            <input
              name="guardianName"
              defaultValue={data?.guardianName ?? ""}
              className={input}
            />
          </Field>

          <Field label="Relationship *">
            <select
              name="guardianRelationship"
              defaultValue={data?.guardianRelationship ?? "Father"}
              className={input}
            >
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
            </select>
          </Field>

          <Field label="Phone Number *">
            <input
              name="guardianPhone"
              type="tel"
              defaultValue={data?.guardianPhone ?? ""}
              className={input}
            />
          </Field>

          <Field label="Email">
            <input
              name="guardianEmail"
              type="email"
              defaultValue={data?.guardianEmail ?? ""}
              className={input}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Address">
              <textarea
                name="guardianAddress"
                rows={2}
                defaultValue={data?.guardianAddress ?? ""}
                className={input}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* 4 Health */}
      <section>
        <div className={sectionTitle}>
          <span className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold">
            4
          </span>
          Health & Additional Notes
        </div>

        <div className="mt-5 space-y-5">
          <Field label="Health Notes">
            <textarea
              name="healthNotes"
              rows={2}
              placeholder="Any medical conditions or health concerns"
              defaultValue={data?.healthNotes ?? ""}
              className={input}
            />
          </Field>

          <Field label="Allergies">
            <input
              name="allergies"
              placeholder="e.g., Peanuts, Penicillin"
              defaultValue={data?.allergies ?? ""}
              className={input}
            />
          </Field>

          <Field label="Additional Information">
            <textarea
              name="additionalInfo"
              rows={3}
              placeholder="Any other relevant information"
              defaultValue={data?.additionalInfo ?? ""}
              className={input}
            />
          </Field>
        </div>
      </section>
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
