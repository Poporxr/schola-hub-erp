"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createStudentSchema,
  studentSchema,
} from "@/components/modals/zod-schemas/studentForm";

function hashPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function splitFullName(fullName: string, fallbackLastName = "Guardian") {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "Parent", lastName: fallbackLastName };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: fallbackLastName };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function pad(value: number, length = 3) {
  return String(value).padStart(length, "0");
}

async function generateAdmissionNumber(sessionName?: string) {
  const prefix = sessionName ? `ADM/${sessionName}/` : "ADM/GENERAL/";

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const latest = await prisma.student.findFirst({
      where: { admissionNumber: { startsWith: prefix } },
      orderBy: { admissionNumber: "desc" },
      select: { admissionNumber: true },
    });

    const currentNumber = latest?.admissionNumber.match(/(\d+)$/)?.[1];
    const nextNumber = pad((currentNumber ? Number.parseInt(currentNumber, 10) : 0) + 1);
    const candidate = `${prefix}${nextNumber}`;

    const existing = await prisma.student.findUnique({
      where: { admissionNumber: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique admission number");
}

async function resolveParentUserEmail(
  preferredEmail: string | undefined,
  guardianName: string,
  guardianPhone: string
) {
  if (preferredEmail) {
    const existingUser = await prisma.user.findUnique({
      where: { email: preferredEmail },
      select: { id: true, parent: { select: { id: true } } },
    });

    if (!existingUser || existingUser.parent) {
      return preferredEmail;
    }
  }

  const phoneSlug = digitsOnly(guardianPhone) || "guardian";
  const nameSlug = slugify(guardianName) || "guardian";
  return `${nameSlug}.${phoneSlug}@schola.local`;
}

export async function deleteTeacherAction(
  prevState: { ok: boolean; message?: string; fieldErrors?: Record<string, string> },
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
  } catch (error) {
    console.error("deleteTeacherAction failed", error);
    return { ok: false, message: "Failed to delete teacher." };
  }

  revalidatePath("/admin/teachers");
  revalidatePath("/admin/classes");
  revalidatePath("/admin/subjects");

  return { ok: true, message: "Deleted successfully." };
}

export async function deleteStudentAction(
  prevState: { ok: boolean; message?: string; fieldErrors?: Record<string, string> },
  formData: FormData
) {
  void prevState;

  const id = String(formData.get("id") ?? "");
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
      await tx.student.delete({
        where: { id: student.id },
      });

      await tx.user.delete({
        where: { id: student.userId },
      });

      for (const link of student.parentStudents) {
        const remainingLinks = await tx.parentStudent.count({
          where: { parentId: link.parentId },
        });

        if (remainingLinks === 0) {
          await tx.parent.delete({
            where: { id: link.parentId },
          });

          await tx.user.delete({
            where: { id: link.parent.userId },
          });
        }
      }
    });
  } catch (error) {
    console.error("deleteStudentAction failed", error);
    return { ok: false, message: "Failed to delete student." };
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/classes");
  revalidatePath("/admin/parents");
  revalidatePath("/admin/results");

  return { ok: true, message: "Deleted successfully." };
}

export async function createClassAction(formData: FormData) {
  console.log("created", formData);
}

export async function updateClassAction(formData: FormData) {
  console.log("updated", formData);
}

export async function createTeacherAction(formData: FormData) {
  console.log("created", formData);
}

export async function updateTeacherAction(formData: FormData) {
  console.log("updated", formData);
}

export async function createStudentAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = createStudentSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid student data");
  }

  const values = parsed.data;
  const parentEmail = await resolveParentUserEmail(
    values.guardianEmail,
    values.guardianName,
    values.guardianPhone
  );
  const parentPasswordHash = hashPassword(digitsOnly(values.guardianPhone) || values.guardianName);
  const guardianName = splitFullName(values.guardianName, values.lastName || "Guardian");

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

  const admissionNumber = await generateAdmissionNumber(currentSession?.name);
  const studentPasswordHash = hashPassword(admissionNumber);

  await prisma.$transaction(async (tx) => {
    const student = await tx.student.create({
      data: {
        admissionNumber,
        dateOfBirth: new Date(values.dateOfBirth),
        gender: values.gender,
        address: values.guardianAddress,
        user: {
          create: {
            email: values.email,
            passwordHash: studentPasswordHash,
            role: "STUDENT",
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.guardianPhone,
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

    const existingParentUser = await tx.user.findUnique({
      where: { email: parentEmail },
      select: { id: true, parent: { select: { id: true } } },
    });

    let parentId: string;

    if (existingParentUser?.parent) {
      parentId = existingParentUser.parent.id;

      await tx.user.update({
        where: { id: existingParentUser.id },
        data: {
          firstName: guardianName.firstName,
          lastName: guardianName.lastName,
          phone: values.guardianPhone,
        },
      });
    } else {
      const parent = await tx.parent.create({
        data: {
          user: {
            create: {
              email: parentEmail,
              passwordHash: parentPasswordHash,
              role: "PARENT",
              firstName: guardianName.firstName,
              lastName: guardianName.lastName,
              phone: values.guardianPhone,
            },
          },
        },
        select: { id: true },
      });

      parentId = parent.id;
    }

    await tx.parentStudent.create({
      data: {
        parentId,
        studentId: student.id,
        relation: values.guardianRelationship,
        isPrimary: true,
      },
    });
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/parents");
  revalidatePath("/admin/classes");
}

export async function updateStudentAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = studentSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid student data");
  }

  console.log("updated", parsed.data);
}

export async function createSubjectAction(formData: FormData) {
  console.log("created", formData);
}

export async function updateSubjectAction(formData: FormData) {
  console.log("updated", formData);
}

export async function createParentAction(formData: FormData) {
  console.log("created parent", formData);
}

export async function getUserDetails(userId: string) {
  const student = await prisma.student.findUnique({
    where: { id: userId },
    select: {
      id: true,
      admissionNumber: true,
      user: {
        select: { image: true, firstName: true, lastName: true },
      },
    },
  });

  return Response.json({
    firstName: student?.user.firstName,
    lastName: student?.user.lastName,
    adminNo: student?.admissionNumber,
    image: student?.user.image,
  });
}
