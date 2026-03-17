import AcademicRolloverClient from "@/components/academic-rollover/AcademicRolloverClient";
import type { ClassOption, SessionOption } from "@/components/academic-rollover/types";
import { prisma } from "@/lib/prisma";

const AcademicRolloverPage = async () => {
  const [sessions, classes] = await Promise.all([
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

  return (
    <AcademicRolloverClient initialSessions={initialSessions} initialClasses={initialClasses} />
  );
};

export default AcademicRolloverPage;
