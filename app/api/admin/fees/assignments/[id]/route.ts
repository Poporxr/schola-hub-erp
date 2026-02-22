import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NextRequest } from "next/server";

type UpdatePayload = {
  feeStructureId?: string;
  classId?: string;
  dueDate?: string | null;
};

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as UpdatePayload;
  const feeStructureId = payload.feeStructureId?.trim();
  const classId = payload.classId?.trim();

  if (!feeStructureId || !classId) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    const updated = await prisma.classFeeAssignment.update({
      where: { id },
      data: { feeStructureId, classId },
      select: { id: true },
    });
    return Response.json({ ok: true, id: updated.id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "This class is already assigned." }, { status: 409 });
    }
    return Response.json({ error: "Failed to update assignment." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const paymentCount = await prisma.payment.count({
      where: { assignmentId: id },
    });
    if (paymentCount > 0) {
      return Response.json(
        { error: `Cannot delete: payments exist for this assignment (${paymentCount}).` },
        { status: 409 }
      );
    }

    await prisma.classFeeAssignment.delete({
      where: { id },
      select: { id: true },
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return Response.json({ error: "Assignment not found." }, { status: 404 });
      }
      if (error.code === "P2003") {
        return Response.json({ error: "Remove related records before deleting." }, { status: 409 });
      }
    }
    return Response.json({ error: "Failed to delete assignment." }, { status: 500 });
  }
}
