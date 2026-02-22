import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: {
        id: true,
        teacherId: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
          }
        }
      }
    })

  if (!teacher) {
    return Response.json({ error: "Teacher record not found" }, { status: 404 });
  }

  return Response.json({
    firstName: teacher.user.firstName,
    lastName: teacher.user.lastName,
    staffId: teacher.teacherId,
    image: teacher.user.image,
  });
}
