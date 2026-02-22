// app/api/student/me/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { userId }, // ⚠️ must be userId, not id
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
  });
}