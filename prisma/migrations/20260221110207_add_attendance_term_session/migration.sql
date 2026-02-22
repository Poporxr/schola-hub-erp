-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "termId" TEXT;

-- CreateIndex
CREATE INDEX "Attendance_sessionId_termId_idx" ON "Attendance"("sessionId", "termId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
