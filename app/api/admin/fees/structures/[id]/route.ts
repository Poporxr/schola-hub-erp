import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { FeeStatus, Prisma } from "@/generated/prisma/client";
import { NextRequest } from "next/server";

type UpdatePayload = {
  name?: string;
  sessionId?: string;
  termId?: string;
  levelId?: string;
  status?: FeeStatus;
  items?: { name?: string; amount?: number; isOptional?: boolean }[];
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
  const name = payload.name?.trim();
  const sessionId = payload.sessionId?.trim();
  const termId = payload.termId?.trim();
  const levelId = payload.levelId?.trim();
  const status = payload.status === "ACTIVE" ? FeeStatus.ACTIVE : FeeStatus.DRAFT;
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (!name || !sessionId || !termId || !levelId) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  const filteredItems = items
    .map((item) => ({
      name: item.name?.trim() ?? "",
      amount: Number(item.amount ?? 0),
      isOptional: Boolean(item.isOptional),
    }))
    .filter((item) => item.name && item.amount >= 0);

  if (filteredItems.length === 0) {
    return Response.json({ error: "Add at least one fee item." }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.feeStructureItem.deleteMany({ where: { feeStructureId: id } });
    return tx.feeStructure.update({
      where: { id },
      data: {
        name,
        sessionId,
        termId,
        levelId,
        status,
        items: { create: filteredItems },
      },
      select: { id: true },
    });
  });

  return Response.json({ ok: true, id: updated.id });
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
    const assignmentIds = await prisma.classFeeAssignment.findMany({
      where: { feeStructureId: id },
      select: { id: true },
    });
    if (assignmentIds.length) {
      const assignmentIdList = assignmentIds.map((a) => a.id);
      const paymentCount = await prisma.payment.count({
        where: { assignmentId: { in: assignmentIdList } },
      });
      if (paymentCount > 0) {
        const [assignmentRows, paymentGroups] = await Promise.all([
          prisma.classFeeAssignment.findMany({
            where: { id: { in: assignmentIdList } },
            select: { id: true, class: { select: { name: true } } },
          }),
          prisma.payment.groupBy({
            by: ["assignmentId"],
            where: { assignmentId: { in: assignmentIdList } },
            _count: { _all: true },
          }),
        ]);

        const paymentMap = new Map(
          paymentGroups.map((row) => [row.assignmentId, row._count._all])
        );
        const samples = assignmentRows
          .map((row) => ({
            className: row.class.name,
            count: paymentMap.get(row.id) ?? 0,
          }))
          .filter((row) => row.count > 0)
          .slice(0, 3)
          .map((row) => `${row.className} (${row.count})`)
          .join(", ");

        return Response.json(
          {
            error: `Cannot delete: payments exist for this structure (assignments: ${assignmentIds.length}, payments: ${paymentCount}).${samples ? ` Examples: ${samples}` : ""}`,
          },
          { status: 409 }
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.classFeeAssignment.deleteMany({ where: { feeStructureId: id } });
      await tx.feeStructureItem.deleteMany({ where: { feeStructureId: id } });
      await tx.feeStructure.delete({
        where: { id },
        select: { id: true },
      });
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return Response.json({ error: "Fee structure not found." }, { status: 404 });
      }
      if (error.code === "P2003") {
        return Response.json({ error: "Remove related records before deleting." }, { status: 409 });
      }
    }
    return Response.json({ error: "Failed to delete fee structure." }, { status: 500 });
  }
}
