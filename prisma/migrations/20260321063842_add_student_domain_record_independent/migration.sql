-- CreateTable
CREATE TABLE "StudentDomainRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "punctuality" INTEGER,
    "neatness" INTEGER,
    "politeness" INTEGER,
    "honesty" INTEGER,
    "relationshipWithOthers" INTEGER,
    "handwriting" INTEGER,
    "sportsAndGames" INTEGER,
    "drawingAndPainting" INTEGER,
    "musicalSkills" INTEGER,
    "verbalFluency" INTEGER,
    "createdByTeacherId" TEXT NOT NULL,
    "updatedByTeacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentDomainRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentDomainRecord_classId_sessionId_termId_idx" ON "StudentDomainRecord"("classId", "sessionId", "termId");

-- CreateIndex
CREATE INDEX "StudentDomainRecord_studentId_sessionId_termId_idx" ON "StudentDomainRecord"("studentId", "sessionId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentDomainRecord_studentId_classId_sessionId_termId_key" ON "StudentDomainRecord"("studentId", "classId", "sessionId", "termId");

-- AddForeignKey
ALTER TABLE "StudentDomainRecord" ADD CONSTRAINT "StudentDomainRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDomainRecord" ADD CONSTRAINT "StudentDomainRecord_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDomainRecord" ADD CONSTRAINT "StudentDomainRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDomainRecord" ADD CONSTRAINT "StudentDomainRecord_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDomainRecord" ADD CONSTRAINT "StudentDomainRecord_createdByTeacherId_fkey" FOREIGN KEY ("createdByTeacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDomainRecord" ADD CONSTRAINT "StudentDomainRecord_updatedByTeacherId_fkey" FOREIGN KEY ("updatedByTeacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
