import * as z from "zod";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
};

const classFields = {
  name: z.string().trim().min(1, { error: "Class name is required" }),
  levelId: z.string().trim().min(1, { error: "Level is required" }),
  maxStudents: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int({ error: "Capacity must be a whole number" }).min(1, {
      error: "Capacity must be at least 1",
    }).optional()
  ),
  promotionTrack: z.enum(["NURSERY", "PRIMARY", "JSS", "SSS", "OTHER"], {
    error: "Promotion track is required",
  }),
  promotionRank: z.coerce.number().int({ error: "Promotion rank must be a whole number" }).min(0, {
    error: "Promotion rank must be 0 or greater",
  }),
  isTerminal: z.preprocess((value) => value === "on" || value === true, z.boolean()),
};

export const createClassSchema = z.object(classFields);

export const updateClassSchema = z.object({
  id: z.string().trim().min(1, { error: "Class id is required" }),
  ...classFields,
});

export type CreateClassFormValues = z.infer<typeof createClassSchema>;
export type UpdateClassFormValues = z.infer<typeof updateClassSchema>;
