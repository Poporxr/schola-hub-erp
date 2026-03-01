"use server";

import { prisma } from "@/lib/prisma";

export async function deleteTeacherAction(
) {


  // OPTIONAL: confirm phrase check
  // You’ll pass label from client, so we can’t reconstruct phrase here safely.
  // Instead, check confirmText on the client *or* pass confirmPhrase hidden input.
  // Better: pass confirmPhrase hidden.
  //
  // For now, skip phrase check or implement with hidden input.

  // ✅ do DB delete here (example)
  // await prisma.teacher.delete({ where: { id: parsed.data.id } });

  return { ok: true, message: "Deleted successfully." };
}


export async function createClassAction(formData: FormData) {
  console.log('created')
}

export async function updateClassAction(formData: FormData) {
  console.log('updated')
}
export async function createTeacherAction(formData: FormData) {
  console.log('created')
}

export async function updateTeacherAction(formData: FormData) {
  console.log('updated')
}
export async function createStudentAction(formData: FormData) {
  console.log('created')
}

export async function updateStudentAction(formData: FormData) {
  console.log('updated')
}

export async function createSubjectAction(formData: FormData) {
  console.log("created");
}

export async function updateSubjectAction(formData: FormData) {
  console.log("updated");
}

export async function createParentAction(formData: FormData) {
  console.log("created parent");
}

export async function getUserDetails(userId: string) {
  const student = await prisma.student.findUnique({
    where: { id: userId },
    select: {
      id: true,
      admissionNumber: true,
      user: {
        select: { image: true, firstName: true, lastName: true }
      },
    }
  });
 return Response.json({
    firstName: student?.user.firstName,
    lastName: student?.user.lastName,
    adminNo: student?.admissionNumber,
    image: student?.user.image
  })
}
