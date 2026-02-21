import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const term = await prisma.term.findFirst({
    where: { isCurrent: true, session: { isCurrent: true } },
    select: { id: true, name: true, session: { select: { name: true } } },
  });

  if (!term) {
    return Response.json({ error: "No current term configured" }, { status: 404 });
  }

  return Response.json({
    id: term.id,
    name: term.name,
    sessionName: term.session?.name ?? null,
  });
}
