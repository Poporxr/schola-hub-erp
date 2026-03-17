"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { TermType } from "@/generated/prisma/client";

const mappingSchema = z.object({
  id: z.string().min(1),
  fromClassId: z.string().min(1),
  toClassId: z.string().min(1),
});

const rolloverPayloadSchema = z
  .object({
    targetSessionId: z.string().min(1),
    sessionName: z.string().trim().optional().default(""),
    sessionStartDate: z.string().optional().default(""),
    sessionEndDate: z.string().optional().default(""),
    sessionCurrent: z.boolean(),
    termName: z.string().trim().min(1, "Term name is required."),
    termType: z.enum(["FIRST", "SECOND", "THIRD"]),
    termStartDate: z.string().optional().default(""),
    termEndDate: z.string().optional().default(""),
    termCurrent: z.boolean(),
    promoteStudents: z.boolean(),
    carryTeacherAssignments: z.boolean(),
    mappings: z.array(mappingSchema),
  })
  .superRefine((data, ctx) => {
    if (data.targetSessionId === "new") {
      if (!data.sessionName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sessionName"],
          message: "Session name is required when creating a new session.",
        });
      }
      if (!data.sessionStartDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sessionStartDate"],
          message: "Session start date is required.",
        });
      }
      if (!data.sessionEndDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sessionEndDate"],
          message: "Session end date is required.",
        });
      }
    }

    if (!data.termStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["termStartDate"],
        message: "Term start date is required.",
      });
    }
    if (!data.termEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["termEndDate"],
        message: "Term end date is required.",
      });
    }

    if (
      data.targetSessionId === "new" &&
      data.sessionStartDate &&
      data.sessionEndDate &&
      data.sessionStartDate > data.sessionEndDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sessionEndDate"],
        message: "Session end date must be after session start date.",
      });
    }
    if (data.termStartDate && data.termEndDate && data.termStartDate > data.termEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["termEndDate"],
        message: "Term end date must be after term start date.",
      });
    }
  });

type RolloverPayload = z.infer<typeof rolloverPayloadSchema>;

export type RolloverPreviewResult = {
  ok: boolean;
  message?: string;
  summary?: {
    sessionsToCreate: number;
    termsToCreate: number;
    studentsToPromote: number;
    mappedClasses: number;
    warnings: string[];
    blockers: string[];
  };
};

export type RolloverExecuteResult = {
  ok: boolean;
  message?: string;
  applied?: {
    targetSessionId: string;
    targetTermId: string;
    studentHistoryRowsCreated: number;
    classTeacherRowsCreated: number;
    subjectTeacherRowsCreated: number;
  };
};

function parsePayload(payload: unknown) {
  const parsed = rolloverPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Invalid rollover payload.",
    };
  }
  return { ok: true as const, data: parsed.data };
}

async function buildPreviewSummary(data: RolloverPayload) {
  const warnings: string[] = [];
  const blockers: string[] = [];

  const [targetSession, currentSession, currentTerm, promotableClasses] = await Promise.all([
    data.targetSessionId === "new"
      ? Promise.resolve(null)
      : prisma.academicSession.findUnique({
          where: { id: data.targetSessionId },
          select: { id: true },
        }),
    prisma.academicSession.findFirst({
      where: { isCurrent: true },
      select: { id: true },
    }),
    prisma.term.findFirst({
      where: { isCurrent: true },
      select: { id: true, sessionId: true, type: true },
    }),
    prisma.class.findMany({
      where: { isTerminal: false },
      select: { id: true },
    }),
  ]);

  if (data.targetSessionId !== "new" && !targetSession) {
    blockers.push("Selected target session does not exist.");
  }

  const validMappings = data.mappings.filter((item) => item.fromClassId && item.toClassId);
  if (data.promoteStudents) {
    const incompleteRows = data.mappings.filter((item) => !item.fromClassId || !item.toClassId);
    if (incompleteRows.length) {
      blockers.push(`${incompleteRows.length} mapping row(s) are incomplete.`);
    }

    const fromSet = new Set<string>();
    const duplicateFrom = new Set<string>();
    for (const mapping of validMappings) {
      if (fromSet.has(mapping.fromClassId)) duplicateFrom.add(mapping.fromClassId);
      fromSet.add(mapping.fromClassId);
    }
    if (duplicateFrom.size) {
      blockers.push("Each source class can only appear once in mapping.");
    }

    const sameClassRows = validMappings.filter((item) => item.fromClassId === item.toClassId);
    if (sameClassRows.length) {
      blockers.push("A source class cannot map to itself.");
    }

    const promotableIds = promotableClasses.map((item) => item.id);
    const mappedFromIds = new Set(validMappings.map((item) => item.fromClassId));
    const uncovered = promotableIds.filter((id) => !mappedFromIds.has(id));
    if (uncovered.length) {
      warnings.push(`${uncovered.length} promotable class(es) are unmapped and will be skipped.`);
    }
  }

  if (data.promoteStudents && (!currentSession || !currentTerm)) {
    blockers.push(
      "No current session/term is set. Set current session and term before promoting students."
    );
  }

  if (
    currentSession &&
    currentTerm &&
    data.targetSessionId !== "new" &&
    data.targetSessionId === currentSession.id &&
    data.termType === currentTerm.type
  ) {
    blockers.push("Selected target term is already the current active term.");
  }

  let termsToCreate = 1;
  if (data.targetSessionId !== "new") {
    const existingTerm = await prisma.term.findUnique({
      where: {
        sessionId_type: {
          sessionId: data.targetSessionId,
          type: data.termType as TermType,
        },
      },
      select: { id: true },
    });
    if (existingTerm) termsToCreate = 0;
  }

  let studentsToPromote = 0;
  if (data.promoteStudents && currentSession && currentTerm && validMappings.length) {
    const fromIds = [...new Set(validMappings.map((item) => item.fromClassId))];
    studentsToPromote = await prisma.studentClassHistory.count({
      where: {
        sessionId: currentSession.id,
        termId: currentTerm.id,
        classId: { in: fromIds },
      },
    });
  }

  return {
    sessionsToCreate: data.targetSessionId === "new" ? 1 : 0,
    termsToCreate,
    studentsToPromote,
    mappedClasses: validMappings.length,
    warnings,
    blockers,
  };
}

export async function previewAcademicRolloverAction(payload: unknown): Promise<RolloverPreviewResult> {
  try {
    const parsed = parsePayload(payload);
    if (!parsed.ok) {
      return { ok: false, message: parsed.message };
    }

    const summary = await buildPreviewSummary(parsed.data);
    return { ok: true, summary };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to generate rollover preview.",
    };
  }
}

export async function executeAcademicRolloverAction(payload: unknown): Promise<RolloverExecuteResult> {
  try {
    const parsed = parsePayload(payload);
    if (!parsed.ok) {
      return { ok: false, message: parsed.message };
    }

    const data = parsed.data;
    const summary = await buildPreviewSummary(data);
    if (summary.blockers.length > 0) {
      return { ok: false, message: summary.blockers[0] };
    }

    const validMappings = data.mappings.filter((item) => item.fromClassId && item.toClassId);
    const mappingMap = new Map(validMappings.map((item) => [item.fromClassId, item.toClassId]));

    const result = await prisma.$transaction(async (tx) => {
    const sourceSession = await tx.academicSession.findFirst({
      where: { isCurrent: true },
      select: { id: true },
    });

    const sourceTerm = await tx.term.findFirst({
      where: { isCurrent: true },
      select: { id: true, sessionId: true },
    });

    let targetSessionId: string;
    if (data.targetSessionId === "new") {
      const existingByName = await tx.academicSession.findUnique({
        where: { name: data.sessionName },
        select: { id: true },
      });
      if (existingByName) {
        targetSessionId = existingByName.id;
      } else {
        const created = await tx.academicSession.create({
          data: {
            name: data.sessionName,
            startDate: new Date(data.sessionStartDate),
            endDate: new Date(data.sessionEndDate),
            isCurrent: false,
          },
          select: { id: true },
        });
        targetSessionId = created.id;
      }
    } else {
      targetSessionId = data.targetSessionId;
    }

    if (data.sessionCurrent) {
      await tx.academicSession.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
      await tx.academicSession.update({
        where: { id: targetSessionId },
        data: { isCurrent: true },
      });
    }

    const targetTerm = await tx.term.upsert({
      where: {
        sessionId_type: {
          sessionId: targetSessionId,
          type: data.termType as TermType,
        },
      },
      update: {
        name: data.termName,
        startDate: new Date(data.termStartDate),
        endDate: new Date(data.termEndDate),
      },
      create: {
        sessionId: targetSessionId,
        type: data.termType as TermType,
        name: data.termName,
        startDate: new Date(data.termStartDate),
        endDate: new Date(data.termEndDate),
        isCurrent: false,
      },
      select: { id: true },
    });

    if (data.termCurrent) {
      await tx.term.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
      await tx.term.update({
        where: { id: targetTerm.id },
        data: { isCurrent: true },
      });
    }

    let studentHistoryRowsCreated = 0;
    let classTeacherRowsCreated = 0;
    let subjectTeacherRowsCreated = 0;

    if (data.promoteStudents && sourceSession && sourceTerm && mappingMap.size > 0) {
      const fromClassIds = [...mappingMap.keys()];
      const sourceClassHistoryRows = await tx.studentClassHistory.findMany({
        where: {
          sessionId: sourceSession.id,
          termId: sourceTerm.id,
          classId: { in: fromClassIds },
        },
        select: {
          studentId: true,
          classId: true,
        },
      });

      const nextHistoryData = sourceClassHistoryRows
        .map((row) => {
          const targetClassId = mappingMap.get(row.classId);
          if (!targetClassId) return null;
          return {
            studentId: row.studentId,
            classId: targetClassId,
            sessionId: targetSessionId,
            termId: targetTerm.id,
          };
        })
        .filter((item): item is { studentId: string; classId: string; sessionId: string; termId: string } => Boolean(item));

      if (nextHistoryData.length) {
        const createResult = await tx.studentClassHistory.createMany({
          data: nextHistoryData,
          skipDuplicates: true,
        });
        studentHistoryRowsCreated = createResult.count;
      }
    }

    if (data.carryTeacherAssignments && sourceSession && sourceTerm) {
      const [sourceClassTeachers, sourceSubjectTeachers] = await Promise.all([
        tx.classTeacher.findMany({
          where: {
            sessionId: sourceSession.id,
            termId: sourceTerm.id,
          },
          select: { teacherId: true, classId: true },
        }),
        tx.subjectTeacher.findMany({
          where: {
            sessionId: sourceSession.id,
            termId: sourceTerm.id,
          },
          select: { teacherId: true, classId: true, subjectId: true },
        }),
      ]);

      if (sourceClassTeachers.length) {
        const classResult = await tx.classTeacher.createMany({
          data: sourceClassTeachers.map((row) => ({
            teacherId: row.teacherId,
            classId: row.classId,
            sessionId: targetSessionId,
            termId: targetTerm.id,
          })),
          skipDuplicates: true,
        });
        classTeacherRowsCreated = classResult.count;
      }

      if (sourceSubjectTeachers.length) {
        const subjectResult = await tx.subjectTeacher.createMany({
          data: sourceSubjectTeachers.map((row) => ({
            teacherId: row.teacherId,
            subjectId: row.subjectId,
            classId: row.classId,
            sessionId: targetSessionId,
            termId: targetTerm.id,
          })),
          skipDuplicates: true,
        });
        subjectTeacherRowsCreated = subjectResult.count;
      }
    }

    return {
      targetSessionId,
      targetTermId: targetTerm.id,
      studentHistoryRowsCreated,
      classTeacherRowsCreated,
      subjectTeacherRowsCreated,
    };
    });

    revalidatePath("/admin/academic-rollover");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/students");
    revalidatePath("/admin/classes");
    revalidatePath("/admin/teachers");

    return {
      ok: true,
      message: "Academic rollover executed successfully.",
      applied: result,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to execute academic rollover.",
    };
  }
}
