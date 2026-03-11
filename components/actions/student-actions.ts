"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import {
  createStudentSchema,
  studentSchema,
} from "@/components/modals/zod-schemas/studentForm";

type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

type ClerkApiError = {
  errors?: Array<{
    code?: string;
    message?: string;
  }>;
};

function pad(value: number, length = 4) {
  return String(value).padStart(length, "0");
}

function toClerkUsernameFromAdmissionNumber(admissionNumber: string) {
  return admissionNumber
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toBoolean(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "on";
}

function isPrismaUniqueError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function isClerkIdentifierExistsError(error: unknown) {
  const clerkErrors =
    typeof error === "object" && error !== null && "errors" in error
      ? (error as ClerkApiError).errors
      : undefined;

  return Boolean(
    clerkErrors?.some(
      (item) =>
        item?.code === "form_identifier_exists" ||
        item?.message?.toLowerCase().includes("username is taken")
    )
  );
}

function extractClerkMessage(error: unknown) {
  const clerkErrors =
    typeof error === "object" && error !== null && "errors" in error
      ? (error as ClerkApiError).errors
      : undefined;

  if (!Array.isArray(clerkErrors) || clerkErrors.length === 0) {
    return "Unable to create student account in Clerk.";
  }

  const fetchFailed = clerkErrors.some(
    (item) =>
      item?.code === "unexpected_error" &&
      item?.message?.toLowerCase().includes("fetch failed")
  );

  if (fetchFailed) {
    return "Unable to reach Clerk API from the server. Check CLERK_SECRET_KEY and outbound network access.";
  }

  return clerkErrors
    .map(
      (item) =>
        `${item?.code ?? "clerk_error"}: ${
          item?.message?.trim() ?? "Unknown error"
        }`
    )
    .join(" | ");
}

function revalidateStudentPaths(studentId?: string, parentId?: string) {
  revalidatePath("/admin/students");
  revalidatePath("/admin/classes");
  revalidatePath("/admin/parents");
  revalidatePath("/admin/results");

  if (studentId) {
    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath(`/admin/students/${studentId}/parents`);
  }

  if (parentId) {
    revalidatePath(`/admin/parents/${parentId}`);
    revalidatePath(`/admin/parents/${parentId}/students`);
  }
}

async function generateAdmissionNumber(sessionName?: string) {
  const prefix = sessionName ? `ADM/${sessionName}/` : "ADM/GENERAL/";

  const latest = await prisma.student.findFirst({
    where: { admissionNumber: { startsWith: prefix } },
    orderBy: { admissionNumber: "desc" },
    select: { admissionNumber: true },
  });

  const currentNumber = latest?.admissionNumber.match(/(\d+)$/)?.[1];
  const nextNumber = pad(
    (currentNumber ? Number.parseInt(currentNumber, 10) : 0) + 1,
    4
  );

  return `${prefix}${nextNumber}`;
}

async function createClerkStudentUser({
  firstName,
  lastName,
  admissionNumber,
  email,
}: {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  email?: string | null;
}) {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is missing. Set it in your server environment.");
  }

  const client = await clerkClient();
  const tempPassword = admissionNumber;
  const username = toClerkUsernameFromAdmissionNumber(admissionNumber);

  if (!username) {
    throw new Error(
      "Admission number cannot be converted to a valid Clerk username."
    );
  }

  let lastError: unknown = null;
  const payloadVariants: Array<Record<string, unknown>> = [
    {
      firstName,
      lastName,
      username,
      ...(email ? { emailAddress: [email] } : {}),
      password: tempPassword,
      publicMetadata: {
        role: "student",
      },
    },
    {
      firstName,
      lastName,
      username,
      ...(email ? { emailAddress: [email] } : {}),
      password: tempPassword,
      publicMetadata: {
        role: "student",
      },
    },
    {
      firstName,
      lastName,
      username,
      password: tempPassword,
      publicMetadata: {
        role: "student",
      },
    },
  ];

  for (const payload of payloadVariants) {
    try {
      const user = await client.users.createUser(payload);
      await client.users.updateUser(user.id, {
        publicMetadata: {
          role: "student",
        },
      });
      return {
        user,
        tempPassword,
        username,
      };
    } catch (error) {
      lastError = error;

      const clerkErrors =
        typeof error === "object" && error !== null && "errors" in error
          ? (error as ClerkApiError).errors
          : undefined;

      const hasUnknownField = clerkErrors?.some(
        (item) =>
          item?.code === "form_param_unknown" ||
          item?.message?.toLowerCase().includes("unknown")
      );

      if (hasUnknownField) {
        continue;
      }

      throw new Error(extractClerkMessage(error));
    }
  }

  const message = extractClerkMessage(lastError);
  if (message.includes("form_username_invalid_character")) {
    throw new Error(`${message} (normalized username: ${username})`);
  }
  throw new Error(message);
}

async function deleteClerkUserIfExists(clerkUserId: string) {
  const client = await clerkClient();

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await client.users.deleteUser(clerkUserId);
      return;
    } catch (error: unknown) {
      const clerkErrors =
        typeof error === "object" && error !== null && "errors" in error
          ? (error as ClerkApiError).errors
          : undefined;

      const notFound = clerkErrors?.some(
        (item) =>
          item?.code === "resource_not_found" ||
          item?.message?.toLowerCase().includes("not found")
      );

      if (notFound) {
        // Already removed in Clerk: treat as successful cleanup.
        return;
      }

      if (attempt === 3) {
        console.error("Failed to delete Clerk user after retries", {
          clerkUserId,
          error,
        });
        throw error;
      }
    }
  }
}

export async function deleteStudentAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  void prevState;

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { ok: false, message: "Student id is required." };
  }

  const student = await prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      parentStudents: {
        select: {
          parentId: true,
          parent: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    return { ok: false, message: "Student not found." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const linkedParents = student.parentStudents.map((link) => ({
        parentId: link.parentId,
        parentUserId: link.parent.userId,
      }));

      await tx.parentStudent.deleteMany({
        where: { studentId: student.id },
      });

      await tx.student.delete({
        where: { id: student.id },
      });

      await tx.user.delete({
        where: { id: student.userId },
      });

      const uniqueParentIds = [...new Set(linkedParents.map((item) => item.parentId))];

      for (const parentId of uniqueParentIds) {
        const remainingLinks = await tx.parentStudent.count({
          where: { parentId },
        });

        if (remainingLinks > 0) continue;

        const parentRecord = linkedParents.find((item) => item.parentId === parentId);
        if (!parentRecord) continue;

        await tx.parent.delete({
          where: { id: parentId },
        });

        await tx.user.delete({
          where: { id: parentRecord.parentUserId },
        });
      }
    });

    try {
      await deleteClerkUserIfExists(student.userId);
    } catch {
      return {
        ok: false,
        message:
          "Student was deleted from the database, but Clerk cleanup failed. Please remove the Clerk user manually.",
      };
    }

    revalidateStudentPaths();
    return { ok: true, message: "Deleted successfully." };
  } catch (error) {
    console.error("deleteStudentAction failed", error);
    return { ok: false, message: "Failed to delete student." };
  }
}

export async function createStudentAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = createStudentSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid student data");
  }

  const values = parsed.data;

  if (values.email) {
    const existingStudentUser = await prisma.user.findUnique({
      where: { email: values.email },
      select: { id: true },
    });

    if (existingStudentUser) {
      throw new Error("Student email already exists.");
    }
  }

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true, name: true },
  });

  const currentTerm = currentSession
    ? await prisma.term.findFirst({
        where: { sessionId: currentSession.id, isCurrent: true },
        select: { id: true },
      })
    : null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    let createdClerkUserId: string | null = null;

    try {
      const admissionNumber = await generateAdmissionNumber(currentSession?.name);

      const { user: clerkUser, tempPassword, username } =
        await createClerkStudentUser({
          firstName: values.firstName,
          lastName: values.lastName,
          admissionNumber,
          email: values.email,
        });

      createdClerkUserId = clerkUser.id;

      await prisma.$transaction(async (tx) => {
        const student = await tx.student.create({
          data: {
            admissionNumber,
            dateOfBirth: new Date(values.dateOfBirth),
            gender: values.gender,
            address: null,
            user: {
              create: {
                id: clerkUser.id,
                email: values.email,
                passwordHash: tempPassword,
                role: "STUDENT",
                firstName: values.firstName,
                lastName: values.lastName,
                phone: null,
              },
            },
          },
          select: { id: true },
        });

        if (currentSession && currentTerm) {
          await tx.studentClassHistory.create({
            data: {
              studentId: student.id,
              classId: values.classId,
              sessionId: currentSession.id,
              termId: currentTerm.id,
            },
          });
        }
      });

      revalidateStudentPaths();

      return {
        ok: true,
        message: "Student created successfully.",
        credentials: {
          username,
          tempPassword,
          admissionNumber,
        },
      };
    } catch (error) {
      if (createdClerkUserId) {
        try {
          await deleteClerkUserIfExists(createdClerkUserId);
        } catch (rollbackError) {
          console.error("Student create rollback failed", rollbackError);
        }
      }

      if (isPrismaUniqueError(error)) {
        continue;
      }
      if (isClerkIdentifierExistsError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to generate a unique admission number. Please try again.");
}

export async function linkParentStudentAction(
  formData: FormData
): Promise<ActionState> {
  const parentId = String(formData.get("parentId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const relation =
    String(formData.get("relation") ?? "Guardian").trim() || "Guardian";
  const isPrimary = toBoolean(String(formData.get("isPrimary") ?? ""));

  if (!parentId || !studentId) {
    return { ok: false, message: "Parent id and student id are required." };
  }

  const [parentExists, studentExists] = await Promise.all([
    prisma.parent.findUnique({
      where: { id: parentId },
      select: { id: true },
    }),
    prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    }),
  ]);

  if (!parentExists) {
    return { ok: false, message: "Parent not found." };
  }

  if (!studentExists) {
    return { ok: false, message: "Student not found." };
  }

  let wasExistingLink = false;

  try {
    await prisma.$transaction(async (tx) => {
      const existingLink = await tx.parentStudent.findUnique({
        where: {
          parentId_studentId: {
            parentId,
            studentId,
          },
        },
        select: { id: true },
      });

      wasExistingLink = Boolean(existingLink);

      if (isPrimary) {
        await tx.parentStudent.updateMany({
          where: { studentId },
          data: { isPrimary: false },
        });
      }

      if (existingLink) {
        await tx.parentStudent.update({
          where: { id: existingLink.id },
          data: {
            relation,
            isPrimary,
          },
        });
        return;
      }

      await tx.parentStudent.create({
        data: {
          parentId,
          studentId,
          relation,
          isPrimary,
        },
      });
    });

    revalidateStudentPaths(studentId, parentId);

    return {
      ok: true,
      message: wasExistingLink
        ? "Parent link updated successfully."
        : "Parent linked successfully.",
    };
  } catch (error) {
    console.error("linkParentStudentAction failed", error);
    return { ok: false, message: "Failed to link parent and student." };
  }
}

export async function unlinkParentStudentAction(
  formData: FormData
): Promise<ActionState> {
  const parentId = String(formData.get("parentId") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();

  if (!parentId || !studentId) {
    return { ok: false, message: "Parent id and student id are required." };
  }

  const existingLink = await prisma.parentStudent.findUnique({
    where: {
      parentId_studentId: {
        parentId,
        studentId,
      },
    },
    select: { id: true, isPrimary: true },
  });

  if (!existingLink) {
    return { ok: false, message: "Parent-student link not found." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.parentStudent.delete({
        where: { id: existingLink.id },
      });

      if (existingLink.isPrimary) {
        const fallbackLink = await tx.parentStudent.findFirst({
          where: { studentId },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });

        if (fallbackLink) {
          await tx.parentStudent.update({
            where: { id: fallbackLink.id },
            data: { isPrimary: true },
          });
        }
      }
    });

    revalidateStudentPaths(studentId, parentId);
    return { ok: true, message: "Parent unlinked successfully." };
  } catch (error) {
    console.error("unlinkParentStudentAction failed", error);
    return { ok: false, message: "Failed to unlink parent from student." };
  }
}

export async function updateStudentAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = studentSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid student data");
  }

  console.log("updated", parsed.data);
}

export async function getUserDetails(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      admissionNumber: true,
      user: {
        select: {
          image: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return Response.json({
    firstName: student?.user.firstName ?? null,
    lastName: student?.user.lastName ?? null,
    adminNo: student?.admissionNumber ?? null,
    image: student?.user.image ?? null,
  });
}
