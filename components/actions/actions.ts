"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { parentSchema } from "@/components/modals/zod-schemas/parentForm";
import type { Status } from "@/generated/prisma/client";
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

function hashPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toStatus(value: string): Status {
  if (value === "suspended") return "SUSPENDED";
  if (value === "on_leave") return "INACTIVE";
  return "ACTIVE";
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

export async function createClassAction(formData: FormData) {
  console.log("created", formData);
}

export async function updateClassAction(formData: FormData) {
  console.log("updated", formData);
}

export async function createTeacherAction(formData: FormData) {
  const firstName = getString(formData, "firstName");
  const lastName = getString(formData, "lastName");
  const email = getString(formData, "email");
  const phone = getString(formData, "phone");
  const department = getString(formData, "department");
  const statusValue = getString(formData, "status");

  if (!firstName || !lastName || !email) {
    throw new Error("First name, last name, and email are required.");
  }
  const normalizedFirstName = normalizeHumanName(firstName);
  const normalizedLastName = normalizeHumanName(lastName);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("Email already exists.");
  }

  const teacherId = await generateTeacherId();

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
            passwordHash: hashPassword(tempPassword),
            role: "TEACHER",
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            phone: phone || null,
            status: toStatus(statusValue),
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
  const id = getString(formData, "id");
  const firstName = getString(formData, "firstName");
  const lastName = getString(formData, "lastName");
  const email = getString(formData, "email");
  const phone = getString(formData, "phone");
  const department = getString(formData, "department");
  const statusValue = getString(formData, "status");

  if (!id) {
    throw new Error("Teacher id is required.");
  }

  if (!firstName || !lastName || !email) {
    throw new Error("First name, last name, and email are required.");
  }
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
          phone: phone || null,
          status: toStatus(statusValue),
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
  console.log("created", formData);
}

export async function updateSubjectAction(formData: FormData) {
  console.log("updated", formData);
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
            passwordHash: hashPassword(clerkUserResult.tempPassword),
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
