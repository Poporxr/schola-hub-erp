import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get("assignmentId")?.trim();

  if (!assignmentId) {
    return Response.json({ error: "Assignment ID is required." }, { status: 400 });
  }

  const assignment = await prisma.classFeeAssignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      class: { select: { name: true } },
      feeStructure: { select: { name: true } },
    },
  });

  if (!assignment) {
    return Response.json({ error: "Assignment not found." }, { status: 404 });
  }

  const payments = await prisma.payment.findMany({
    where: { assignmentId },
    orderBy: [{ paymentDate: "desc" }],
    select: {
      id: true,
      amount: true,
      status: true,
      paymentDate: true,
      student: { select: { user: { select: { firstName: true, lastName: true } } } },
      parent: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  return Response.json({
    assignment,
    payments: payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      paymentDate: payment.paymentDate,
      studentName: `${payment.student.user.firstName} ${payment.student.user.lastName}`,
      parentName: payment.parent
        ? `${payment.parent.user.firstName} ${payment.parent.user.lastName}`
        : null,
    })),
  });
}
