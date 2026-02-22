import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

type AssignPayload = {
  feeStructureId?: string;
  classId?: string;
  classIds?: string[];
  dueDate?: string | null;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as AssignPayload;
  const feeStructureId = payload.feeStructureId?.trim();
  const classIds = Array.isArray(payload.classIds)
    ? payload.classIds.map((id) => id.trim()).filter(Boolean)
    : payload.classId
      ? [payload.classId.trim()]
      : [];

  if (!feeStructureId || classIds.length === 0) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  const currentSession = await prisma.academicSession.findFirst({
    where: { isCurrent: true },
    select: { id: true },
  });
  const currentTerm = currentSession
    ? await prisma.term.findFirst({
        where: { sessionId: currentSession.id, isCurrent: true },
        select: { id: true },
      })
    : null;

  if (!currentSession || !currentTerm) {
    return Response.json({ error: "No active session/term configured." }, { status: 400 });
  }

  try {
    const result = await prisma.classFeeAssignment.createMany({
      data: classIds.map((classId) => ({
        feeStructureId,
        classId,
        sessionId: currentSession.id,
        termId: currentTerm.id,
      })),
      skipDuplicates: true,
    });

    return Response.json({ ok: true, count: result.count });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "This class is already assigned." }, { status: 409 });
    }
    return Response.json({ error: "Failed to assign structure." }, { status: 500 });
  }
}
