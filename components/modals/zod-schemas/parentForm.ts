import * as z from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};

export const parentSchema = z.object({
  firstName: z.string().trim().min(1, { error: "First name is required" }),
  lastName: z.string().trim().min(1, { error: "Last name is required" }),
  email: z.email({ error: "Invalid email address" }),
  phone: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  relationship: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export type ParentFormValues = z.infer<typeof parentSchema>;
