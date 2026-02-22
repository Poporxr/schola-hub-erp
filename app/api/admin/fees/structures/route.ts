import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { FeeStatus } from "@/generated/prisma/client";

type CreateStructurePayload = {
  name?: string;
  sessionId?: string;
  termId?: string;
  levelId?: string;
  status?: FeeStatus;
  items?: { name?: string; amount?: number; isOptional?: boolean }[];
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as CreateStructurePayload;
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

  const created = await prisma.feeStructure.create({
    data: {
      name,
      sessionId,
      termId,
      levelId,
      status,
      createdBy: userId,
      items: {
        create: filteredItems,
      },
    },
    select: { id: true },
  });

  return Response.json({ ok: true, id: created.id });
}
