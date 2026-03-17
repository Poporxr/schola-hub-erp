import { z } from "zod";

const numberField = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() === "") return undefined;
    if (typeof value === "string") return Number(value);
    return value;
  },
  z.number().min(0, "Value cannot be less than 0").max(100, "Value cannot exceed 100")
);

export const subjectSchema = z
  .object({
    id: z.string().optional(),
    classId: z.string().optional(),
    name: z.string().trim().min(1, "Subject name is required"),
    code: z.string().trim().min(1, "Subject code is required"),
    description: z.string().trim().optional(),
    ca: numberField,
    exam: numberField,
    project: numberField,
  })
  .superRefine((data, ctx) => {
    const total = data.ca + data.exam + data.project;
    if (total !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["project"],
        message: `Assessment total must be 100%. Current total is ${total}%.`,
      });
    }
  });

export type SubjectSchemaInput = z.infer<typeof subjectSchema>;
