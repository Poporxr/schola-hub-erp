"use server";

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


export async function createFeeStructure(formData: FormData) {
  // read basic fields
  const name = String(formData.get("name") || "");
  const session = String(formData.get("session") || "");
  const term = String(formData.get("term") || "");
  const level = String(formData.get("level") || "");

  // line items arrays (name[], amount[])
  const itemNames = formData.getAll("itemName").map(String);
  const itemAmounts = formData.getAll("itemAmount").map((v) => Number(v) || 0);

  // TODO: validate + write to DB
  // await prisma.feeStructure.create(...)

  return { ok: true };
}

export async function assignFeeToClass(formData: FormData) {
  const feeStructureId = String(formData.get("feeStructureId") || "");
  const classId = String(formData.get("classId") || "");
  const dueDate = String(formData.get("dueDate") || "");

  // TODO: validate + write to DB
  return { ok: true };
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
