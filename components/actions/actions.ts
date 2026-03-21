"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { parentSchema } from "@/components/modals/zod-schemas/parentForm";
import { subjectSchema } from "@/components/modals/zod-schemas/subjectForm";
import {
  createClassSchema,
  updateClassSchema,
} from "@/components/modals/zod-schemas/classForm";
import {
  createTeacherSchema,
  updateTeacherSchema,
} from "@/components/modals/zod-schemas/teacherForm";
import type { PromotionTrack, Status } from "@/generated/prisma/client";
import {
  extractClerkMessage,
  generateParentIdentifier,
  generateTeacherId,
  isClerkIdentifierExistsError,
  normalizeHumanName,
  type SchoolRole,
} from "./handlers/action-functions";
import {
  createClerkUser,
  deleteClerkUserIfExists,
} from "./handlers/clerk-helpers";

type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function isDatabaseUnavailableError(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const message =
    typeof error === "object" && error && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";
  return code === "P1001" || /can't reach database server/i.test(message);
}

const timetableEntrySchema = z
  .object({
    sessionId: z.string().min(1, "Session is required."),
    termId: z.string().min(1, "Term is required."),
    classId: z.string().min(1, "Class is required."),
    subjectId: z.string().min(1, "Subject is required."),
    teacherId: z.string().min(1, "Teacher is required."),
    weekday: z.enum(["MON", "TUE", "WED", "THU", "FRI"]),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be HH:MM."),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "End time must be HH:MM."),
    notes: z.string().max(200).optional().default(""),
  })
  .superRefine((value, ctx) => {
    if (value.startTime >= value.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be later than start time.",
      });
    }
  });

const domainScaleSchema = z.number().int().min(1).max(5).nullable();

const teacherDomainEntrySchema = z.object({
  classId: z.string().min(1, "Class is required."),
  sessionId: z.string().min(1, "Session is required."),
  termId: z.string().min(1, "Term is required."),
  rows: z.array(
    z.object({
      studentId: z.string().min(1, "Student id is required."),
      punctuality: domainScaleSchema,
      neatness: domainScaleSchema,
      politeness: domainScaleSchema,
      honesty: domainScaleSchema,
      relationshipWithOthers: domainScaleSchema,
      handwriting: domainScaleSchema,
      sportsAndGames: domainScaleSchema,
      drawingAndPainting: domainScaleSchema,
      musicalSkills: domainScaleSchema,
      verbalFluency: domainScaleSchema,
    })
  ),
});

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toStatus(value: string): Status {
  if (value === "suspended") return "SUSPENDED";
  if (value === "on_leave") return "INACTIVE";
  return "ACTIVE";
}
function capitalizeWords(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function updateClerkUserNamesAndMetadata({
  clerkUserId,
  firstName,
  lastName,
  role,
  identifier,
}: {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  role: SchoolRole;
  identifier: string;
}) {
  const client = await clerkClient();
  const normalizedFirstName = normalizeHumanName(firstName);
  const normalizedLastName = normalizeHumanName(lastName);

  await client.users.updateUser(clerkUserId, {
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    publicMetadata: {
      role,
      identifier,
    },
  });
}

export async function deleteTeacherAction(
  prevState: ActionState,
  formData: FormData
) {
  void prevState;

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { ok: false, message: "Teacher id is required." };
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!teacher) {
    return { ok: false, message: "Teacher not found." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.teacher.delete({
        where: { id: teacher.id },
      });

      await tx.user.delete({
        where: { id: teacher.userId },
      });
    });

    try {
      await deleteClerkUserIfExists(teacher.userId);
    } catch {
      return {
        ok: false,
        message:
          "Teacher was deleted from the database, but Clerk cleanup failed. Please remove the Clerk user manually.",
      };
    }
  } catch (error) {
    console.error("deleteTeacherAction failed", error);
    return { ok: false, message: "Failed to delete teacher." };
  }

  revalidatePath("/admin/teachers");
  revalidatePath("/admin/classes");
  revalidatePath("/admin/subjects");

  return { ok: true, message: "Deleted successfully." };
}

export async function deleteParentAction(
  prevState: ActionState,
  formData: FormData
) {
  void prevState;

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { ok: false, message: "Parent id is required." };
  }

  const parent = await prisma.parent.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!parent) {
    return { ok: false, message: "Parent not found." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.parent.delete({
        where: { id: parent.id },
      });

      await tx.user.delete({
        where: { id: parent.userId },
      });
    });

    try {
      await deleteClerkUserIfExists(parent.userId);
    } catch {
      return {
        ok: false,
        message:
          "Parent was deleted from the database, but Clerk cleanup failed. Please remove the Clerk user manually.",
      };
    }
  } catch (error) {
    console.error("deleteParentAction failed", error);
    return { ok: false, message: "Failed to delete parent." };
  }

  revalidatePath("/admin/parents");
  revalidatePath("/admin/students");

  return { ok: true, message: "Deleted successfully." };
}

export async function createClassAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = createClassSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid class data");
  }

  const {
    name,
    levelId,
    maxStudents,
    promotionTrack,
    promotionRank,
    isTerminal,
  } = parsed.data;

  const className = name.trim();

  const [level, duplicate] = await Promise.all([
    prisma.level.findUnique({
      where: { id: levelId },
      select: { id: true },
    }),
    prisma.class.findFirst({
      where: {
        levelId,
        name: className,
      },
      select: { id: true },
    }),
  ]);

  if (!level) {
    throw new Error("Selected level was not found.");
  }

  if (duplicate) {
    throw new Error("A class with this name already exists in the selected level.");
  }

  await prisma.class.create({
    data: {
      name: className,
      levelId,
      capacity: maxStudents ?? null,
      promotionTrack: promotionTrack as PromotionTrack,
      promotionRank,
      isTerminal,
    },
  });

  revalidatePath("/admin/classes");
}

export async function updateClassAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = updateClassSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid class data");
  }

  const {
    id,
    name,
    levelId,
    maxStudents,
    promotionTrack,
    promotionRank,
    isTerminal,
  } = parsed.data;

  const className = name.trim();

  const [classRecord, level, duplicate] = await Promise.all([
    prisma.class.findUnique({
      where: { id },
      select: { id: true },
    }),
    prisma.level.findUnique({
      where: { id: levelId },
      select: { id: true },
    }),
    prisma.class.findFirst({
      where: {
        NOT: { id },
        levelId,
        name: className,
      },
      select: { id: true },
    }),
  ]);

  if (!classRecord) {
    throw new Error("Class not found.");
  }

  if (!level) {
    throw new Error("Selected level was not found.");
  }

  if (duplicate) {
    throw new Error("A class with this name already exists in the selected level.");
  }

  await prisma.class.update({
    where: { id },
    data: {
      name: className,
      levelId,
      capacity: maxStudents ?? null,
      promotionTrack: promotionTrack as PromotionTrack,
      promotionRank,
      isTerminal,
    },
  });

  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${id}`);
}

export async function createTeacherAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = createTeacherSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid teacher data");
  }
  const { firstName, lastName, email, phone, department, status } = parsed.data;
  const normalizedFirstName = normalizeHumanName(firstName);
  const normalizedLastName = normalizeHumanName(lastName);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("Email already exists.");
  }

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { name: true },
  });

  const teacherId = await generateTeacherId(currentSession?.name);

  const { user: clerkUser, tempPassword } = await createClerkUser({
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    identifier: teacherId,
    role: "teacher",
    email,
    password: teacherId,
  });

  try {
    await prisma.teacher.create({
      data: {
        teacherId,
        department: department || null,
        user: {
          create: {
            id: clerkUser.id,
            email,
            passwordHash: tempPassword,
            role: "TEACHER",
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            phone,
            status: toStatus(status),
          },
        },
      },
    });
  } catch (error) {
    try {
      await deleteClerkUserIfExists(clerkUser.id);
    } catch (rollbackError) {
      console.error("Teacher create rollback failed", rollbackError);
    }

    throw error;
  }

  revalidatePath("/admin/teachers");
}

export async function updateTeacherAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = updateTeacherSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid teacher data");
  }
  const { id, firstName, lastName, email, phone, department, status } = parsed.data;
  const normalizedFirstName = normalizeHumanName(firstName);
  const normalizedLastName = normalizeHumanName(lastName);

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    select: {
      id: true,
      teacherId: true,
      userId: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
      },
    },
  });

  if (!teacher) {
    throw new Error("Teacher not found.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser && existingUser.id !== teacher.userId) {
    throw new Error("Email already exists.");
  }

  await updateClerkUserNamesAndMetadata({
    clerkUserId: teacher.userId,
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    role: "teacher",
    identifier: teacher.teacherId,
  });

  try {
    await prisma.$transaction([
      prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          department: department || null,
        },
      }),
      prisma.user.update({
        where: { id: teacher.userId },
        data: {
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
          email,
          phone,
          status: toStatus(status),
        },
      }),
    ]);
  } catch (error) {
    try {
      await updateClerkUserNamesAndMetadata({
        clerkUserId: teacher.userId,
        firstName: teacher.user.firstName,
        lastName: teacher.user.lastName,
        role: "teacher",
        identifier: teacher.teacherId,
      });
    } catch (rollbackError) {
      /*console.error("Teacher update rollback failed", rollbackError);*/
      throw new Error (`Teacher update rollback failed', ${rollbackError}`)
    }

    throw error;
  }

  revalidatePath("/admin/teachers");
}

export async function createSubjectAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = subjectSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid subject data");
  }

  const { name, code, description, exam, ca, project } = parsed.data;

  const subjectName = capitalizeWords(name);
  const subjectCode = code.toUpperCase();
  const existingSubject = await prisma.subject.findFirst({
    where: {
      OR: [{ name: subjectName }, { code: subjectCode }],
    },
    select: { id: true },
  });

  if (existingSubject) {
    throw new Error("Subject with this name or code already exists.");
  }

  try{
    await prisma.subject.create({
      data: {
        name: subjectName,
        code: subjectCode,
        description: description || null,
        assessmentMax: Number(ca),
        examMax: Number(exam),
        projectMax: Number(project),
      },
    });

  } catch (error) {
    throw new Error("Failed to create subject.", { cause: error });
  }

  revalidatePath("/admin/subjects");
}

export async function createTimetableEntryAction(formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = timetableEntrySchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid timetable data." };
  }

  const { sessionId, termId, classId, subjectId, teacherId, weekday, startTime, endTime, notes } = parsed.data;
  try {
    const [session, term, classRecord, subject, teacher, assignment] = await Promise.all([
      prisma.academicSession.findUnique({
        where: { id: sessionId },
        select: { id: true },
      }),
      prisma.term.findUnique({
        where: { id: termId },
        select: { id: true, sessionId: true },
      }),
      prisma.class.findUnique({
        where: { id: classId },
        select: { id: true },
      }),
      prisma.subject.findUnique({
        where: { id: subjectId },
        select: { id: true },
      }),
      prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { id: true },
      }),
      prisma.subjectTeacher.findFirst({
        where: { teacherId, classId, subjectId, sessionId, termId },
        select: { id: true },
      }),
    ]);

    if (!session) return { ok: false, message: "Session not found." };
    if (!term) return { ok: false, message: "Term not found." };
    if (term.sessionId !== sessionId) {
      return { ok: false, message: "Selected term does not belong to selected session." };
    }
    if (!classRecord) return { ok: false, message: "Class not found." };
    if (!subject) return { ok: false, message: "Subject not found." };
    if (!teacher) return { ok: false, message: "Teacher not found." };
    if (!assignment) {
      return {
        ok: false,
        message: "Teacher is not assigned to this class and subject for the selected session/term.",
      };
    }

    const exactDuplicate = await prisma.timetableEntry.findFirst({
      where: {
        classId,
        subjectId,
        teacherId,
        sessionId,
        termId,
        weekday,
        startTime,
        endTime,
      },
      select: { id: true },
    });

    if (exactDuplicate) {
      return { ok: false, message: "This timetable entry already exists." };
    }

    await prisma.timetableEntry.create({
      data: {
        classId,
        subjectId,
        teacherId,
        sessionId,
        termId,
        weekday,
        startTime,
        endTime,
        status: "ACTIVE",
        notes: notes || null,
      },
    });
  } catch (error) {
    console.error("createTimetableEntryAction failed", error);
    if (isDatabaseUnavailableError(error)) {
      return {
        ok: false,
        message: "Database is temporarily unavailable. Please try again shortly.",
      };
    }
    return { ok: false, message: "Failed to create timetable entry." };
  }

  revalidatePath("/admin/timetable");
  revalidatePath("/admin/timetable/create-entry");
  revalidatePath("/teacher/timetable");
  revalidatePath("/teacher/dashboard");
  revalidatePath("/student/dashboard");
  revalidatePath("/teacher/subjects");

  return { ok: true, message: "Timetable entry created successfully." };
}

export async function updateSubjectAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = subjectSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid subject data");
  }

  const { id, name, code, description, exam, ca, project } = parsed.data;
  if (!id) {
    throw new Error("Subject id is required.");
  }

  const subjectName = capitalizeWords(name);
  const subjectCode = code.toUpperCase();

  const existingSubject = await prisma.subject.findFirst({
    where: {
      NOT: { id },
      OR: [{ name: subjectName }, { code: subjectCode }],
    },
    select: { id: true },
  });

  if (existingSubject) {
    throw new Error("Subject with this name or code already exists.");
  }

  try {
    await prisma.subject.update({
      where: { id },
      data: {
        name: subjectName,
        code: subjectCode,
        description: description || null,
        assessmentMax: Number(ca),
        examMax: Number(exam),
        projectMax: Number(project),
      },
    });
  } catch (error) {
    console.error("updateSubjectAction failed", error);
    throw new Error("Failed to update subject.");
  }

  revalidatePath("/admin/subjects");
}
export async function deleteSubjectAction(
  prevState: ActionState,
  formData: FormData
) {
  void prevState;

  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { ok: false, message: "Subject id is required." };
  }

  try {
    await prisma.subject.delete({
      where: { id },
    });
  } catch (error) {
    console.error("deleteSubjectAction failed", error);
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";

    if (code === "P2003") {
      return {
        ok: false,
        message:
          "Cannot delete subject because it is linked to other records. Unlink teachers/classes and remove dependent results first.",
      };
    }

    return { ok: false, message: "Failed to delete subject." };
  }

  revalidatePath("/admin/subjects");
  revalidatePath("/admin/classes");

  return { ok: true, message: "Deleted successfully." };
}
export async function createParentAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = parentSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid parent data");
  }

  const { firstName, lastName, email, phone } = parsed.data;
  const normalizedFirstName = normalizeHumanName(firstName);
  const normalizedLastName = normalizeHumanName(lastName);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      parent: { select: { id: true } },
    },
  });

  if (existingUser?.parent) {
    throw new Error("Parent with this email already exists.");
  }

  if (existingUser && !existingUser.parent) {
    throw new Error("Email already exists.");
  }

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { name: true },
  });

  let clerkUserResult:
    | {
        user: { id: string };
        tempPassword: string;
        username: string;
      }
    | undefined;
  let createError: unknown = null;

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidateIdentifier = await generateParentIdentifier(
      currentSession?.name,
      attempt
    );

    try {
      clerkUserResult = await createClerkUser({
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        role: "parent",
        email,
        identifier: candidateIdentifier,
        password: candidateIdentifier,
      });
      break;
    } catch (error) {
      createError = error;
      if (isClerkIdentifierExistsError(error)) {
        continue;
      }
      throw new Error(
        extractClerkMessage(error, "Unable to create parent account in Clerk.")
      );
    }
  }

  if (!clerkUserResult) {
    throw new Error(
      extractClerkMessage(
        createError,
        "Unable to generate a unique parent login identifier."
      )
    );
  }

  try {
    await prisma.parent.create({
      data: {
        user: {
          create: {
            id: clerkUserResult.user.id,
            email,
            passwordHash: clerkUserResult.tempPassword,
            role: "PARENT",
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            phone: phone || null,
          },
        },
      },
    });
  } catch (error) {
    try {
      await deleteClerkUserIfExists(clerkUserResult.user.id);
    } catch (rollbackError) {
      console.error("Parent create rollback failed", rollbackError);
    }

    throw error;
  }

  revalidatePath("/admin/parents");
  revalidatePath("/admin/students");

  return {
    ok: true,
    message: `Parent created successfully. Username: ${clerkUserResult.username}, Password: ${clerkUserResult.tempPassword}`,
  };
}

export async function linkTeacherClassAction(
  formData: FormData
): Promise<ActionState> {
  const teacherId = getString(formData, "teacherId");
  const classId = getString(formData, "classId");

  if (!teacherId || !classId) {
    return { ok: false, message: "Teacher id and class id are required." };
  }

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const currentTerm = currentSession
    ? await prisma.term.findFirst({
        where: { sessionId: currentSession.id, isCurrent: true },
        select: { id: true },
      })
    : null;

  if (!currentSession || !currentTerm) {
    return { ok: false, message: "No active session/term found." };
  }

  const [teacher, classRecord] = await Promise.all([
    prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true, classId: true },
    }),
    prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true },
    }),
  ]);

  if (!teacher) {
    return { ok: false, message: "Teacher not found." };
  }

  if (!classRecord) {
    return { ok: false, message: "Class not found." };
  }

  if (classRecord.teacherId && classRecord.teacherId !== teacherId) {
    return {
      ok: false,
      message: "This class is already assigned to another class teacher.",
    };
  }

  const existingClassAssignment = await prisma.classTeacher.findFirst({
    where: {
      classId,
      sessionId: currentSession.id,
      termId: currentTerm.id,
    },
    select: { id: true, teacherId: true },
  });

  if (existingClassAssignment && existingClassAssignment.teacherId !== teacherId) {
    return {
      ok: false,
      message: "This class already has a class teacher for the active term.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existingLink = await tx.classTeacher.findUnique({
        where: {
          teacherId_classId_sessionId_termId: {
            teacherId,
            classId,
            sessionId: currentSession.id,
            termId: currentTerm.id,
          },
        },
        select: { id: true },
      });

      if (!existingLink) {
        await tx.classTeacher.create({
          data: {
            teacherId,
            classId,
            sessionId: currentSession.id,
            termId: currentTerm.id,
          },
        });
      }

      if (!classRecord.teacherId || classRecord.teacherId === teacherId) {
        await tx.class.update({
          where: { id: classId },
          data: { teacherId },
        });
      }

      if (!teacher.classId) {
        await tx.teacher.update({
          where: { id: teacherId },
          data: { classId },
        });
      }
    });

    revalidatePath("/admin/teachers");
    revalidatePath(`/admin/teachers/${teacherId}`);
    revalidatePath(`/admin/teachers/${teacherId}/assignments`);
    revalidatePath("/admin/classes");

    return { ok: true, message: "Class linked successfully." };
  } catch (error) {
    console.error("linkTeacherClassAction failed", error);
    return { ok: false, message: "Failed to link class to teacher." };
  }
}

export async function unlinkTeacherClassAction(
  formData: FormData
): Promise<ActionState> {
  const teacherId = getString(formData, "teacherId");
  const classId = getString(formData, "classId");

  if (!teacherId || !classId) {
    return { ok: false, message: "Teacher id and class id are required." };
  }

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const currentTerm = currentSession
    ? await prisma.term.findFirst({
        where: { sessionId: currentSession.id, isCurrent: true },
        select: { id: true },
      })
    : null;

  if (!currentSession || !currentTerm) {
    return { ok: false, message: "No active session/term found." };
  }

  const existingLink = await prisma.classTeacher.findUnique({
    where: {
      teacherId_classId_sessionId_termId: {
        teacherId,
        classId,
        sessionId: currentSession.id,
        termId: currentTerm.id,
      },
    },
    select: { id: true },
  });

  if (!existingLink) {
    return { ok: false, message: "Class-teacher link not found." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.classTeacher.delete({
        where: { id: existingLink.id },
      });

      const classRecord = await tx.class.findUnique({
        where: { id: classId },
        select: { teacherId: true },
      });

      if (classRecord?.teacherId === teacherId) {
        await tx.class.update({
          where: { id: classId },
          data: { teacherId: null },
        });
      }

      const teacher = await tx.teacher.findUnique({
        where: { id: teacherId },
        select: { classId: true },
      });

      if (teacher?.classId === classId) {
        const fallback = await tx.classTeacher.findFirst({
          where: {
            teacherId,
            sessionId: currentSession.id,
            termId: currentTerm.id,
          },
          orderBy: { createdAt: "asc" },
          select: { classId: true },
        });

        await tx.teacher.update({
          where: { id: teacherId },
          data: { classId: fallback?.classId ?? null },
        });
      }
    });

    revalidatePath("/admin/teachers");
    revalidatePath(`/admin/teachers/${teacherId}`);
    revalidatePath(`/admin/teachers/${teacherId}/assignments`);
    revalidatePath("/admin/classes");

    return { ok: true, message: "Class unlinked successfully." };
  } catch (error) {
    console.error("unlinkTeacherClassAction failed", error);
    return { ok: false, message: "Failed to unlink class from teacher." };
  }
}

export async function linkSubjectClassAction(
  formData: FormData
): Promise<ActionState> {
  const classId = getString(formData, "classId");
  const subjectId = getString(formData, "subjectId");

  if (!classId || !subjectId) {
    return { ok: false, message: "Class id and subject id are required." };
  }

  const [classExists, subjectExists] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId }, select: { id: true } }),
    prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true } }),
  ]);

  if (!classExists) {
    return { ok: false, message: "Class not found." };
  }

  if (!subjectExists) {
    return { ok: false, message: "Subject not found." };
  }

  const existing = await prisma.classSubject.findUnique({
    where: {
      classId_subjectId: {
        classId,
        subjectId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return { ok: false, message: "Subject is already linked to this class." };
  }

  try {
    await prisma.classSubject.create({
      data: {
        classId,
        subjectId,
      },
    });

    revalidatePath("/admin/subjects");
    revalidatePath("/admin/classes");
    revalidatePath(`/admin/classes/${classId}/subject-assignments`);
    revalidatePath(`/admin/classes/${classId}`);

    return { ok: true, message: "Subject linked to class successfully." };
  } catch (error) {
    console.error("linkSubjectClassAction failed", error);
    return { ok: false, message: "Failed to link subject to class." };
  }
}

export async function unlinkSubjectClassAction(
  formData: FormData
): Promise<ActionState> {
  const classId = getString(formData, "classId");
  const subjectId = getString(formData, "subjectId");

  if (!classId || !subjectId) {
    return { ok: false, message: "Class id and subject id are required." };
  }

  const existing = await prisma.classSubject.findUnique({
    where: {
      classId_subjectId: {
        classId,
        subjectId,
      },
    },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false, message: "Subject-class link not found." };
  }

  try {
    await prisma.classSubject.delete({
      where: { id: existing.id },
    });

    revalidatePath("/admin/subjects");
    revalidatePath("/admin/classes");
    revalidatePath(`/admin/classes/${classId}/subject-assignments`);
    revalidatePath(`/admin/classes/${classId}`);

    return { ok: true, message: "Subject unlinked from class successfully." };
  } catch (error) {
    console.error("unlinkSubjectClassAction failed", error);
    return { ok: false, message: "Failed to unlink subject from class." };
  }
}

export async function linkSubjectTeacherAction(
  formData: FormData
): Promise<ActionState> {
  const subjectId = getString(formData, "subjectId");
  const teacherId = getString(formData, "teacherId");

  if (!subjectId || !teacherId) {
    return { ok: false, message: "Subject id and teacher id are required." };
  }

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const currentTerm = currentSession
    ? await prisma.term.findFirst({
        where: { sessionId: currentSession.id, isCurrent: true },
        select: { id: true },
      })
    : null;

  if (!currentSession || !currentTerm) {
    return { ok: false, message: "No active session/term found." };
  }

  const [subject, teacher, classLinks] = await Promise.all([
    prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    }),
    prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true },
    }),
    prisma.classSubject.findMany({
      where: { subjectId },
      select: { classId: true },
    }),
  ]);

  if (!subject) {
    return { ok: false, message: "Subject not found." };
  }

  if (!teacher) {
    return { ok: false, message: "Teacher not found." };
  }

  if (!classLinks.length) {
    return { ok: false, message: "Link this subject to at least one class first." };
  }

  const subjectTeacherRows = await prisma.subjectTeacher.findMany({
    where: {
      subjectId,
      sessionId: currentSession.id,
      termId: currentTerm.id,
    },
    select: { teacherId: true, classId: true },
  });

  const assignedTeacherIds = new Set(subjectTeacherRows.map((row) => row.teacherId));
  if (assignedTeacherIds.has(teacherId)) {
    return { ok: false, message: "Teacher is already assigned to this subject." };
  }

  if (assignedTeacherIds.size >= 2) {
    return { ok: false, message: "A subject can have at most 2 teachers." };
  }

  try {
    await prisma.subjectTeacher.createMany({
      data: classLinks.map((row) => ({
        teacherId,
        subjectId,
        classId: row.classId,
        sessionId: currentSession.id,
        termId: currentTerm.id,
      })),
      skipDuplicates: true,
    });

    revalidatePath("/admin/subjects");
    revalidatePath(`/admin/subjects/${subjectId}/teacher-assignment`);
    revalidatePath("/admin/teachers");
    revalidatePath("/admin/classes");

    return { ok: true, message: "Teacher assigned to subject successfully." };
  } catch (error) {
    console.error("linkSubjectTeacherAction failed", error);
    return { ok: false, message: "Failed to assign teacher to subject." };
  }
}

export async function unlinkSubjectTeacherAction(
  formData: FormData
): Promise<ActionState> {
  const subjectId = getString(formData, "subjectId");
  const teacherId = getString(formData, "teacherId");

  if (!subjectId || !teacherId) {
    return { ok: false, message: "Subject id and teacher id are required." };
  }

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });

  const currentTerm = currentSession
    ? await prisma.term.findFirst({
        where: { sessionId: currentSession.id, isCurrent: true },
        select: { id: true },
      })
    : null;

  if (!currentSession || !currentTerm) {
    return { ok: false, message: "No active session/term found." };
  }

  const subjectTeacherRows = await prisma.subjectTeacher.findMany({
    where: {
      subjectId,
      sessionId: currentSession.id,
      termId: currentTerm.id,
    },
    select: { teacherId: true },
  });

  const assignedTeacherIds = new Set(subjectTeacherRows.map((row) => row.teacherId));
  if (!assignedTeacherIds.has(teacherId)) {
    return { ok: false, message: "Subject-teacher link not found." };
  }

  if (assignedTeacherIds.size <= 1) {
    return { ok: false, message: "Each subject must have at least 1 teacher." };
  }

  try {
    await prisma.subjectTeacher.deleteMany({
      where: {
        subjectId,
        teacherId,
        sessionId: currentSession.id,
        termId: currentTerm.id,
      },
    });

    revalidatePath("/admin/subjects");
    revalidatePath(`/admin/subjects/${subjectId}/teacher-assignment`);
    revalidatePath("/admin/teachers");
    revalidatePath("/admin/classes");

    return { ok: true, message: "Teacher removed from subject successfully." };
  } catch (error) {
    console.error("unlinkSubjectTeacherAction failed", error);
    return { ok: false, message: "Failed to remove teacher from subject." };
  }
}

export async function upsertTeacherDomainScoresAction(
  payload: z.infer<typeof teacherDomainEntrySchema>
): Promise<ActionState> {
  const parsed = teacherDomainEntrySchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid score payload.",
    };
  }

  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "Unauthorized." };
  }

  const { classId, sessionId, termId, rows } = parsed.data;

  try {
    const teacher = await prisma.teacher.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      select: { id: true },
    });

    if (!teacher) {
      return { ok: false, message: "Teacher profile not found." };
    }

    const classTeacher = await prisma.classTeacher.findFirst({
      where: {
        teacherId: teacher.id,
        classId,
        sessionId,
        termId,
      },
      select: { id: true },
    });

    if (!classTeacher) {
      return {
        ok: false,
        message:
          "Only the assigned class teacher can enter affective and psychomotor scores for this class.",
      };
    }

    const validRows = rows.filter((row) => {
      const values = [
        row.punctuality,
        row.neatness,
        row.politeness,
        row.honesty,
        row.relationshipWithOthers,
        row.handwriting,
        row.sportsAndGames,
        row.drawingAndPainting,
        row.musicalSkills,
        row.verbalFluency,
      ];
      return values.some((value) => value !== null);
    });

    if (!validRows.length) {
      return { ok: false, message: "No scores to save." };
    }

    const studentIds = validRows.map((row) => row.studentId);

    const classHistories = await prisma.studentClassHistory.findMany({
      where: {
        classId,
        sessionId,
        termId,
        studentId: { in: studentIds },
      },
      select: { studentId: true },
    });

    const allowedStudentIds = new Set(classHistories.map((history) => history.studentId));

    let savedCount = 0;
    let skippedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const row of validRows) {
        if (!allowedStudentIds.has(row.studentId)) {
          skippedCount += 1;
          continue;
        }

        const existing = await tx.studentDomainRecord.findUnique({
          where: {
            studentId_classId_sessionId_termId: {
              studentId: row.studentId,
              classId,
              sessionId,
              termId,
            },
          },
          select: { id: true },
        });

        if (!existing) {
          await tx.studentDomainRecord.create({
            data: {
              studentId: row.studentId,
              classId,
              sessionId,
              termId,
              punctuality: row.punctuality,
              neatness: row.neatness,
              politeness: row.politeness,
              honesty: row.honesty,
              relationshipWithOthers: row.relationshipWithOthers,
              handwriting: row.handwriting,
              sportsAndGames: row.sportsAndGames,
              drawingAndPainting: row.drawingAndPainting,
              musicalSkills: row.musicalSkills,
              verbalFluency: row.verbalFluency,
              createdByTeacherId: teacher.id,
            },
          });
          savedCount += 1;
          continue;
        }

        await tx.studentDomainRecord.update({
          where: { id: existing.id },
          data: {
            punctuality: row.punctuality,
            neatness: row.neatness,
            politeness: row.politeness,
            honesty: row.honesty,
            relationshipWithOthers: row.relationshipWithOthers,
            handwriting: row.handwriting,
            sportsAndGames: row.sportsAndGames,
            drawingAndPainting: row.drawingAndPainting,
            musicalSkills: row.musicalSkills,
            verbalFluency: row.verbalFluency,
            updatedByTeacherId: teacher.id,
          },
        });

        savedCount += 1;
      }
    });

    revalidatePath("/teacher/domains");
    revalidatePath("/teacher/results");
    revalidatePath("/student/result");
    revalidatePath("/parent/results");
    revalidatePath("/admin/results");

    if (!savedCount && skippedCount > 0) {
      return {
        ok: false,
        message:
          "No scores were saved because selected students are not in this current class term.",
      };
    }

    const message =
      skippedCount > 0
        ? `Saved ${savedCount} student domain record(s). Skipped ${skippedCount} student(s).`
        : `Saved ${savedCount} student domain record(s).`;
    return { ok: true, message };
  } catch (error) {
    console.error("upsertTeacherDomainScoresAction failed", error);
    if (isDatabaseUnavailableError(error)) {
      return {
        ok: false,
        message: "Database is temporarily unavailable. Please try again shortly.",
      };
    }
    return { ok: false, message: "Unable to save domain scores right now." };
  }
}
