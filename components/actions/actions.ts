"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { parentSchema } from "@/components/modals/zod-schemas/parentForm";
import type { Status } from "@/generated/prisma/client";

type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

type SchoolRole = "teacher" | "parent";
type ClerkApiError = {
  errors?: Array<{
    code?: string;
    message?: string;
  }>;
};

function hashPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function pad(value: number, length = 3) {
  return String(value).padStart(length, "0");
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

function toClerkUsername(identifier: string) {
  const normalized = identifier
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (normalized) {
    return normalized;
  }

  return `user_${createHash("sha1").update(identifier).digest("hex").slice(0, 12)}`;
}

function buildTempPassword(identifier: string) {
  const normalized = toClerkUsername(identifier);
  return `${normalized}@Schola2026`;
}

function extractClerkMessage(error: unknown, fallback: string) {
  const clerkErrors =
    typeof error === "object" && error !== null && "errors" in error
      ? (error as ClerkApiError).errors
      : undefined;

  if (!Array.isArray(clerkErrors) || clerkErrors.length === 0) {
    return fallback;
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

function getCurrentSessionCode(sessionName?: string) {
  if (sessionName?.trim()) {
    return sessionName.replace(/\s+/g, "");
  }

  const year = new Date().getFullYear();
  return `${year}/${year + 1}`;
}

function buildParentIdentifier(sessionCode: string, sequence: number) {
  return `PTA/${sessionCode}/${pad(sequence, 4)}`;
}

async function generateTeacherId() {
  const prefix = "TCH-";

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const latest = await prisma.teacher.findFirst({
      where: { teacherId: { startsWith: prefix } },
      orderBy: { teacherId: "desc" },
      select: { teacherId: true },
    });

    const currentNumber = latest?.teacherId.match(/(\d+)$/)?.[1];
    const nextNumber = pad(
      (currentNumber ? Number.parseInt(currentNumber, 10) : 0) + 1,
      4
    );
    const candidate = `${prefix}${nextNumber}`;

    const existing = await prisma.teacher.findUnique({
      where: { teacherId: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique teacher id.");
}

async function createClerkUser({
  firstName,
  lastName,
  identifier,
  role,
}: {
  firstName: string;
  lastName: string;
  identifier: string;
  role: SchoolRole;
}) {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is missing. Set it in your server environment.");
  }

  const client = await clerkClient();
  const username = toClerkUsername(identifier);
  const tempPassword = buildTempPassword(identifier);

  try {
    const user = await client.users.createUser({
      firstName,
      lastName,
      username,
      password: tempPassword,
      publicMetadata: {
        role,
        identifier,
      },
    });

    return {
      user,
      username,
      tempPassword,
    };
  } catch (error: unknown) {
    const clerkErrors =
      typeof error === "object" && error !== null && "errors" in error
        ? (error as { errors?: Array<{ code?: string; message?: string }> }).errors
        : undefined;

    const fetchFailed = clerkErrors?.some(
      (item) => item?.code === "unexpected_error" && item?.message?.toLowerCase().includes("fetch failed")
    );

   /* console.error(
      "Clerk createUser failed:",
      JSON.stringify(
        {
          identifier,
          username,
          role,
          error,
        },
        null,
        2
      )
    ); */

    if (fetchFailed) {
      throw new Error(
        "Unable to reach Clerk API from the server (fetch failed). Check internet egress/firewall and CLERK_SECRET_KEY."
      );
    }

    throw error;
  }
}

async function createParentClerkUser({
  firstName,
  lastName,
  email,
  identifier,
}: {
  firstName: string;
  lastName: string;
  email: string;
  identifier: string;
}) {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is missing. Set it in your server environment.");
  }

  const client = await clerkClient();
  const username = toClerkUsername(identifier);
  const tempPassword = identifier;

  if (!username) {
    throw new Error("Generated parent identifier cannot be converted to a valid Clerk username.");
  }

  const payloadVariants: Array<Record<string, unknown>> = [
    {
      firstName,
      lastName,
      username,
      emailAddress: [email],
      password: tempPassword,
      publicMetadata: {
        role: "parent",
        identifier,
      },
    },
    {
      firstName,
      lastName,
      username,
      password: tempPassword,
      publicMetadata: {
        role: "parent",
        identifier,
      },
    },
  ];

  let lastError: unknown = null;

  for (const payload of payloadVariants) {
    try {
      const user = await client.users.createUser(payload);
      await client.users.updateUser(user.id, {
        publicMetadata: {
          role: "parent",
          identifier,
        },
      });

      return { user, tempPassword, username };
    } catch (error: unknown) {
      lastError = error;

      if (isClerkIdentifierExistsError(error)) {
        throw error;
      }

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

      throw new Error(
        extractClerkMessage(error, "Unable to create parent account in Clerk.")
      );
    }
  }

  throw new Error(
    extractClerkMessage(lastError, "Unable to create parent account in Clerk.")
  );
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

  await client.users.updateUser(clerkUserId, {
    firstName,
    lastName,
    publicMetadata: {
      role,
      identifier,
    },
  });
}

async function deleteClerkUserIfExists(clerkUserId: string) {
  const client = await clerkClient();

  try {
    await client.users.deleteUser(clerkUserId);
  } catch (error) {
    /*console.error("Failed to delete Clerk user", { clerkUserId, error });*/
    throw error;
  }
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

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("Email already exists.");
  }

  const teacherId = await generateTeacherId();

  const { user: clerkUser, tempPassword } = await createClerkUser({
    firstName,
    lastName,
    identifier: teacherId,
    role: "teacher",
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
            firstName,
            lastName,
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
    firstName,
    lastName,
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
          firstName,
          lastName,
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

  const sessionCode = getCurrentSessionCode(currentSession?.name);
  const baseCount = await prisma.parent.count();

  let clerkUserResult:
    | {
        user: { id: string };
        tempPassword: string;
        username: string;
      }
    | undefined;
  let parentIdentifier = "";
  let createError: unknown = null;

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const sequence = baseCount + attempt + 1;
    const candidateIdentifier = buildParentIdentifier(sessionCode, sequence);

    try {
      clerkUserResult = await createParentClerkUser({
        firstName,
        lastName,
        email,
        identifier: candidateIdentifier,
      });
      parentIdentifier = candidateIdentifier;
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
            firstName,
            lastName,
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
    message: `Parent created successfully. Login username and password: ${parentIdentifier}`,
  };
}
