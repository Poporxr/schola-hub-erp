import { LevelType, PrismaClient, Status, TermType, UserRole } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // ------------------------------------------------------------
  // DANGER: destructive seed (clears tables). Good for dev/staging.
  // ------------------------------------------------------------
  await prisma.attendance.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.notice.deleteMany();

  await prisma.affectiveDomainScore.deleteMany();
  await prisma.psychomotorDomainScore.deleteMany();
  await prisma.result.deleteMany();

  await prisma.subjectTeacher.deleteMany();
  await prisma.classTeacher.deleteMany();
  await prisma.classSubject.deleteMany();

  await prisma.studentClassHistory.deleteMany();
  await prisma.parentStudent.deleteMany();

  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.level.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicSession.deleteMany();

  const currentSession = await prisma.academicSession.create({
    data: {
      name: "2025/2026",
      startDate: new Date("2025-09-01T00:00:00.000Z"),
      endDate: new Date("2026-07-31T23:59:59.000Z"),
      isCurrent: true,
    },
  });

  const currentTerm = await prisma.term.create({
    data: {
      sessionId: currentSession.id,
      type: TermType.FIRST,
      name: "1st Term",
      startDate: new Date("2025-09-01T00:00:00.000Z"),
      endDate: new Date("2025-12-15T23:59:59.000Z"),
      isCurrent: true,
    },
  });

  const levels = await prisma.$transaction([
    prisma.level.create({
      data: {
        name: "Primary Level",
        type: LevelType.PRIMARY,
      },
    }),
    prisma.level.create({
      data: {
        name: "Secondary Level",
        type: LevelType.SECONDARY,
      },
    }),
  ]);

  const adminUser = await prisma.user.create({
    data: {
      id: "user_39YjiSfpnAlKmVvMRVhzNmXytjy",
      email: "admin@schola.local",
      passwordHash: "dev_only_change_me",
      role: UserRole.ADMIN,
      firstName: "System",
      lastName: "Admin",
      phone: "+2348000000000",
      status: Status.ACTIVE,
      admin: {
        create: {
          staffId: "ADM-001",
        },
      },
    },
    include: { admin: true },
  });

  console.log("Seed completed");
  console.log({
    adminUserId: adminUser.id,
    levels: levels.map((level) => ({ id: level.id, name: level.name, type: level.type })),
    session: { id: currentSession.id, name: currentSession.name, isCurrent: currentSession.isCurrent },
    term: { id: currentTerm.id, name: currentTerm.name, type: currentTerm.type, isCurrent: currentTerm.isCurrent },
  });
}

main()
  .catch((error) => {
    console.error("Seed failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
