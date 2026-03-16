import * as z from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};

const teacherFields = {
  firstName: z.string().trim().min(1, { error: "First name is required" }),
  lastName: z.string().trim().min(1, { error: "Last name is required" }),
  email: z.email({ error: "Invalid email address" }),
  phone: z.string().trim().min(1, { error: "Phone number is required" }),
  department: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  status: z.enum(["active", "on_leave", "suspended"], {
    error: "Status is required",
  }),
};

export const createTeacherSchema = z.object(teacherFields);

export const updateTeacherSchema = z.object({
  id: z.string().trim().min(1, { error: "Teacher id is required" }),
  ...teacherFields,
});

export type CreateTeacherFormValues = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherFormValues = z.infer<typeof updateTeacherSchema>;
