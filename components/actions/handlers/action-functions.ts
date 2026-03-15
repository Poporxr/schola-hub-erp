import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type ClerkApiError = {
  errors?: Array<{
    code?: string;
    message?: string;
  }>;
};

export type SchoolRole = "student" | "teacher" | "parent";

function pad(value: number, length = 4) {
  return String(value).padStart(length, "0");
}

export function normalizeIdentifierForClerkUsername(identifier: string) {
  return identifier
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizePasswordForClerk(value: string) {
  const normalizedBase = value
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  const base = normalizedBase || "schola_user";
  return `${base.slice(0, 3).toLowerCase()}${base.slice(3)}`;
}

export function getCurrentSessionCode(sessionName?: string) {
  if (sessionName?.trim()) {
    return sessionName.replace(/\s+/g, "");
  }

  const year = new Date().getFullYear();
  return `${year}/${year + 1}`;
}

export function buildRoleIdentifier(
  role: SchoolRole,
  sequence: number,
  sessionName?: string
) {
  if (role === "teacher") {
    return `TCH-${pad(sequence, 4)}`;
  }

  const sessionCode = getCurrentSessionCode(sessionName);
  const prefix = role === "student" ? "STU" : "PTA";
  return `${prefix}/${sessionCode}/${pad(sequence, 4)}`;
}

export function toBoolean(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "on";
}

export function isPrismaUniqueError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function generateStudentAdmissionNumber(sessionName?: string) {
  const sessionCode = getCurrentSessionCode(sessionName);
  const prefix = `STU/${sessionCode}/`;

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

export async function generateTeacherId() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const latest = await prisma.teacher.findFirst({
      where: { teacherId: { startsWith: "TCH-" } },
      orderBy: { teacherId: "desc" },
      select: { teacherId: true },
    });

    const currentNumber = latest?.teacherId.match(/(\d+)$/)?.[1];
    const nextSequence =
      (currentNumber ? Number.parseInt(currentNumber, 10) : 0) + 1;
    const candidate = buildRoleIdentifier("teacher", nextSequence);

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

export async function generateParentIdentifier(
  sessionName: string | undefined,
  offset = 0
) {
  const baseCount = await prisma.parent.count();
  return buildRoleIdentifier("parent", baseCount + offset + 1, sessionName);
}

export function isClerkIdentifierExistsError(error: unknown) {
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

export function extractClerkMessage(error: unknown, fallback?: string) {
  const clerkErrors =
    typeof error === "object" && error !== null && "errors" in error
      ? (error as ClerkApiError).errors
      : undefined;

  if (!Array.isArray(clerkErrors) || clerkErrors.length === 0) {
    return fallback ?? "Unable to create account in Clerk.";
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

export function revalidateStudentPaths(
  studentId?: string,
  parentId?: string,
  teacherId?: string
) {
  revalidatePath("/admin/students");
  revalidatePath("/admin/classes");
  revalidatePath("/admin/parents");
  revalidatePath("/admin/results");
  revalidatePath("/admin/teachers");

  if (studentId) {
    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath(`/admin/students/${studentId}/parents`);
  }

  if (parentId) {
    revalidatePath(`/admin/parents/${parentId}`);
    revalidatePath(`/admin/parents/${parentId}/students`);
  }

  if (teacherId) {
    revalidatePath(`/admin/teachers/${teacherId}`);
  }
}
