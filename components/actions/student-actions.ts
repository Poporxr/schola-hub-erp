"use server";


import { prisma } from "@/lib/prisma";
import {
  createStudentSchema,
  studentSchema,
} from "@/components/modals/zod-schemas/studentForm";
import {
  revalidateStudentPaths,
  generateStudentAdmissionNumber,
  isPrismaUniqueError,
  toBoolean,
  isClerkIdentifierExistsError,
  normalizeHumanName,
} from "./handlers/action-functions";
import { createClerkUser, deleteClerkUserIfExists } from "./handlers/clerk-helpers";

type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

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
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = createStudentSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Invalid student data",
      };
    }

    const values = parsed.data;
    const normalizedFirstName = normalizeHumanName(values.firstName);
    const normalizedLastName = normalizeHumanName(values.lastName);

    if (values.email) {
      const existingStudentUser = await prisma.user.findUnique({
        where: { email: values.email },
        select: { id: true },
      });

      if (existingStudentUser) {
        return { ok: false, message: "Student email already exists." };
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
        const admissionNumber = await generateStudentAdmissionNumber(
          currentSession?.name
        );

        const { user: clerkUser, tempPassword, username } =
          await createClerkUser({
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            identifier: admissionNumber,
            email: values.email,
            role: "student",
            password: admissionNumber,
          });

        createdClerkUserId = clerkUser.id;

        await prisma.$transaction(async (tx) => {
          const student = await tx.student.create({
            data: {
              admissionNumber,
              dateOfBirth: new Date(values.dateOfBirth),
              gender: values.gender,
              address: values.address,
              user: {
                create: {
                  id: clerkUser.id,
                  email: values.email,
                  passwordHash: tempPassword,
                  phone: values.phoneNumber ?? null,
                  role: "STUDENT",
                  firstName: normalizedFirstName,
                  lastName: normalizedLastName,
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

        if (isPrismaUniqueError(error) || isClerkIdentifierExistsError(error)) {
          continue;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Unable to create student account.";

        console.error("createStudentAction failed", error);
        return { ok: false, message };
      }
    }

    return {
      ok: false,
      message: "Unable to generate a unique student identifier. Please try again.",
    };
  } catch (error) {
    console.error("createStudentAction unexpected failure", error);
    return {
      ok: false,
      message: "Unexpected error while creating student. Please try again.",
    };
  }
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
