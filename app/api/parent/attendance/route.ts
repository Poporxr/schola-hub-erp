import { auth } from "@clerk/nextjs/server";
import { getParentAttendanceData } from "@/lib/parentAttendance";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) {
    return Response.json({ error: "Missing studentId" }, { status: 400 });
  }

  const result = await getParentAttendanceData({ userId, studentId });
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json(result.data);
}
