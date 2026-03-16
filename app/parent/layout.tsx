import ParentShell from "@/components/parent/ParentShell";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const parent = userId
    ? await prisma.parent.findFirst({
        where: { OR: [{ id: userId }, { userId }] },
        select: {
          id: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              image: true,
              status: true,
            },
          },
          parentStudents: { select: { id: true } },
        },
      })
    : null;

  const parentInfo = parent
    ? {
        name: `${parent.user.firstName ?? ""} ${parent.user.lastName ?? ""}`.trim() || "Parent",
        image: parent.user.image ?? null,
        status: parent.user.status ?? "ACTIVE",
        childrenCount: parent.parentStudents.length,
      }
    : null;

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen ">
      <ParentShell parentInfo={parentInfo}>
        {children}
      </ParentShell>
    </main>
  );
}
