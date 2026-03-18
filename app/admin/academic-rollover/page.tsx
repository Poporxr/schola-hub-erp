import AcademicRolloverClient from "@/components/academic-rollover/AcademicRolloverClient";
import type { ClassOption, SessionOption } from "@/components/academic-rollover/types";
import { prisma } from "@/lib/prisma";

const AcademicRolloverPage = async () => {
  const [sessions, classes, currentSession] = await Promise.all([
    prisma.academicSession.findMany({
      select: { id: true, name: true },
      orderBy: [{ startDate: "desc" }, { name: "desc" }],
    }),
    prisma.class.findMany({
      select: {
        id: true,
        name: true,
        promotionTrack: true,
        promotionRank: true,
        isTerminal: true,
      },
      orderBy: [
        { promotionTrack: "asc" },
        { promotionRank: "asc" },
        { name: "asc" },
      ],
    }),
    prisma.academicSession.findFirst({
      where: { isCurrent: true },
      select: { id: true, name: true, startDate: true, endDate: true },
    }),
  ]);

  const initialSessions: SessionOption[] = sessions.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  const initialClasses: ClassOption[] = classes.map((item) => ({
    id: item.id,
    name: item.name,
    promotionTrack: item.promotionTrack,
    promotionRank: item.promotionRank,
    isTerminal: item.isTerminal,
  }));

  const currentSessionView = currentSession
    ? {
        id: currentSession.id,
        name: currentSession.name,
        startDate: currentSession.startDate.toISOString().split("T")[0],
        endDate: currentSession.endDate.toISOString().split("T")[0],
      }
    : null;

  return (
    <AcademicRolloverClient
      initialSessions={initialSessions}
      initialClasses={initialClasses}
      currentSession={currentSessionView}
    />
  );
};

export default AcademicRolloverPage;
