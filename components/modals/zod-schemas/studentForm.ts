import * as z from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};

export const studentSchema = z.object({
  firstName: z.string().trim().min(1, { error: "First name is required" }),
  lastName: z.string().trim().min(1, { error: "Last name is required" }),
  middleName: z.preprocess(
    emptyToUndefined,
    z.string().trim().optional()
  ),

  dateOfBirth: z.string().min(1, { error: "Date of birth is required" }),

  gender: z.enum(["MALE", "FEMALE"], {
    error: "Gender is required",
  }),

  classId: z.string().min(1, { error: "Class is required" }),
  email: z.email({ error: "Invalid email address" }),

  admissionNumber: z
    .string()
    .trim()
    .min(1, { error: "Admission number is required" }),
  address: z.string().trim().min(1, { error: "Address is required" }),
  phoneNumber: z.string().trim().optional(),

  admissionDate: z.string().min(1, { error: "Admission date is required" }),

  previousSchool: z.preprocess(
    emptyToUndefined,
    z.string().trim().optional()
  ),

  healthNotes: z.preprocess(
    emptyToUndefined,
    z.string().trim().optional()
  ),

  allergies: z.preprocess(
    emptyToUndefined,
    z.string().trim().optional()
  ),

  additionalInfo: z.preprocess(
    emptyToUndefined,
    z.string().trim().optional()
  ),
});

export const createStudentSchema = studentSchema.omit({
  admissionNumber: true,
});

export type StudentFormValues = z.infer<typeof studentSchema>;
export type CreateStudentFormValues = z.infer<typeof createStudentSchema>;
