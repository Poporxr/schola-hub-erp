"use client";

type ModalMode = "create" | "edit";

type StudentFormData = {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dob?: string;
  gender?: "Male" | "Female";
  class?: string;
  arm?: string;
  admissionNo?: string;
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
}: {
  mode: ModalMode;
  data?: StudentFormData;
}) {
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
              defaultValue={data?.firstName ?? (mode === "edit" ? "Chukwuemeka" : "")}
              className={input}
            />
          </Field>

          <Field label="Last Name *">
            <input
              name="lastName"
              defaultValue={data?.lastName ?? (mode === "edit" ? "Okafor" : "")}
              className={input}
            />
          </Field>

          <Field label="Middle Name">
            <input
              name="middleName"
              defaultValue={data?.middleName ?? (mode === "edit" ? "Emeka" : "")}
              className={input}
            />
          </Field>

          <Field label="Date of Birth *">
            <input
              name="dob"
              type="date"
              defaultValue={data?.dob ?? (mode === "edit" ? "2008-05-15" : "")}
              className={input}
            />
          </Field>

          <Field label="Gender *">
            <select
              name="gender"
              defaultValue={data?.gender ?? (mode === "edit" ? "Male" : "Male")}
              className={input}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>

          <Field label="Passport Photo">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1544502062-f82887f03d1c?auto=format&fit=facearea&facepad=2&w=96&h=96&q=80"
                alt="Student"
                className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
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
              name="class"
              defaultValue={data?.class ?? (mode === "edit" ? "SS1 B" : "SS1 A")}
              className={input}
            >
              <option value="SS1 A">SS1 A</option>
              <option value="SS1 B">SS1 B</option>
              <option value="SS2 A">SS2 A</option>
            </select>
          </Field>

          <Field label="Section (Arm)">
            <input
              name="arm"
              defaultValue={data?.arm ?? (mode === "edit" ? "B" : "")}
              className={input}
            />
          </Field>

          <Field label="Admission No. *">
            <input
              name="admissionNo"
              defaultValue={data?.admissionNo ?? (mode === "edit" ? "2024/SS1/042" : "")}
              className={input}
            />
          </Field>

          <Field label="Admission Date *">
            <input
              name="admissionDate"
              type="date"
              defaultValue={data?.admissionDate ?? (mode === "edit" ? "2024-01-15" : "")}
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
              defaultValue={data?.guardianName ?? (mode === "edit" ? "Mr. Okafor Nnamdi" : "")}
              className={input}
            />
          </Field>

          <Field label="Relationship *">
            <select
              name="guardianRelationship"
              defaultValue={data?.guardianRelationship ?? (mode === "edit" ? "Father" : "Father")}
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
              defaultValue={data?.guardianPhone ?? (mode === "edit" ? "+234 803 456 7890" : "")}
              className={input}
            />
          </Field>

          <Field label="Email">
            <input
              name="guardianEmail"
              type="email"
              defaultValue={data?.guardianEmail ?? (mode === "edit" ? "okafor.n@email.com" : "")}
              className={input}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Address">
              <textarea
                name="guardianAddress"
                rows={2}
                defaultValue={data?.guardianAddress ?? (mode === "edit" ? "12 Victoria Island, Lagos State" : "")}
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
