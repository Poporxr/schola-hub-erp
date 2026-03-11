"use client";

import { useState } from "react";
import UserAvatar from "@/components/UserAvatar";
import {
  createStudentSchema,
  studentSchema,
  type CreateStudentFormValues,
  type StudentFormValues,
} from "../zod-schemas/studentForm";
import Field from "./Field";
type ModalMode = "create" | "edit";

export type StudentFormClasses = { id: string; name: string }[];

export type StudentFormData = {
  id?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE";
  classId?: string;
  admissionNumber?: string;
  admissionDate?: string;
  previousSchool?: string;

  healthNotes?: string;
  allergies?: string;
  additionalInfo?: string;
};

type FieldErrors = Partial<Record<keyof StudentFormValues, string>>;

export default function StudentForm({
  mode,
  data,
  classes,
  action,
  disabled = false,
  formId,
  showSubmitButton = true,
}: {
  mode: ModalMode;
  data?: StudentFormData;
  classes?: StudentFormClasses;
  action?: (formData: FormData) => void | Promise<void>;
  disabled?: boolean;
  formId?: string;
  showSubmitButton?: boolean;
}) {
  const defaultGender = "MALE" as const;
  const [errors, setErrors] = useState<FieldErrors>({});

  const input =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  const inputError =
    "w-full rounded-xl border border-red-500 px-4 py-3 text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20";

  const sectionTitle = "text-lg font-bold text-gray-900 flex items-center gap-3";

  function getError(name: keyof StudentFormValues) {
    return errors[name];
  }

  function getInputClass(name: keyof StudentFormValues) {
    return getError(name) ? inputError : input;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const raw = Object.fromEntries(formData.entries());
    const result =
      mode === "create"
        ? createStudentSchema.safeParse(raw)
        : studentSchema.safeParse(raw);

    if (!result.success) {
      e.preventDefault();

      const nextErrors: Partial<
        Record<keyof StudentFormValues | keyof CreateStudentFormValues, string>
      > = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !(field in nextErrors)) {
          nextErrors[field as keyof StudentFormValues] = issue.message;
        }
      }

      setErrors(nextErrors as FieldErrors);
      return;
    }

    setErrors({});
  }

  return (
    <form
      id={formId}
      action={action}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <fieldset disabled={disabled} className="space-y-8 disabled:opacity-70">
      {mode === "edit" && data?.id ? (
        <input type="hidden" name="id" value={String(data.id)} />
      ) : null}

      {/* 1 Personal */}
      <section>
        <div className={sectionTitle}>
          <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
            1
          </span>
          Personal Information
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="First Name *" error={getError("firstName")}>
            <input
              name="firstName"
              defaultValue={data?.firstName ?? ""}
              className={getInputClass("firstName")}
            />
          </Field>

          <Field label="Last Name *" error={getError("lastName")}>
            <input
              name="lastName"
              defaultValue={data?.lastName ?? ""}
              className={getInputClass("lastName")}
            />
          </Field>

          <Field label="Middle Name" error={getError("middleName")}>
            <input
              name="middleName"
              defaultValue={data?.middleName ?? ""}
              className={getInputClass("middleName")}
            />
          </Field>

          <Field label="Date of Birth *" error={getError("dateOfBirth")}>
            <input
              name="dateOfBirth"
              type="date"
              defaultValue={data?.dateOfBirth ?? ""}
              className={getInputClass("dateOfBirth")}
            />
          </Field>

          <Field label="Gender *" error={getError("gender")}>
            <select
              name="gender"
              defaultValue={data?.gender ?? defaultGender}
              className={getInputClass("gender")}
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
          <Field label="Class *" error={getError("classId")}>
            <select
              name="classId"
              defaultValue={data?.classId ?? ""}
              className={getInputClass("classId")}
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

          <Field label="Student Email *" error={getError("email")}>
            <input
              name="email"
              type="email"
              defaultValue={data?.email ?? ""}
              className={getInputClass("email")}
            />
          </Field>

          {mode === "edit" ? (
            <Field label="Admission No. *" error={getError("admissionNumber")}>
              <input
                name="admissionNumber"
                defaultValue={data?.admissionNumber ?? ""}
                className={getInputClass("admissionNumber")}
              />
            </Field>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Admission No.
              </label>
              <div className="mt-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                This will be generated automatically when the student is created.
              </div>
            </div>
          )}

          <Field label="Admission Date *" error={getError("admissionDate")}>
            <input
              name="admissionDate"
              type="date"
              defaultValue={data?.admissionDate ?? ""}
              className={getInputClass("admissionDate")}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Previous School" error={getError("previousSchool")}>
              <input
                name="previousSchool"
                placeholder="Optional"
                defaultValue={data?.previousSchool ?? ""}
                className={getInputClass("previousSchool")}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* 3 Health */}
      <section>
        <div className={sectionTitle}>
          <span className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold">
            3
          </span>
          Health & Additional Notes
        </div>

        <div className="mt-5 space-y-5">
          <Field label="Health Notes" error={getError("healthNotes")}>
            <textarea
              name="healthNotes"
              rows={2}
              placeholder="Any medical conditions or health concerns"
              defaultValue={data?.healthNotes ?? ""}
              className={getInputClass("healthNotes")}
            />
          </Field>

          <Field label="Allergies" error={getError("allergies")}>
            <input
              name="allergies"
              placeholder="e.g., Peanuts, Penicillin"
              defaultValue={data?.allergies ?? ""}
              className={getInputClass("allergies")}
            />
          </Field>

          <Field label="Additional Information" error={getError("additionalInfo")}>
            <textarea
              name="additionalInfo"
              rows={3}
              placeholder="Any other relevant information"
              defaultValue={data?.additionalInfo ?? ""}
              className={getInputClass("additionalInfo")}
            />
          </Field>
        </div>
      </section>

      {showSubmitButton ? (
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            {mode === "create" ? "Create Student" : "Save Changes"}
          </button>
        </div>
      ) : null}
      </fieldset>
    </form>
  );
}
