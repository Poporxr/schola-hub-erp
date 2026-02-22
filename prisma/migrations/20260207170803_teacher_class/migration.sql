-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "classId" TEXT;

-- CreateIndex
CREATE INDEX "Teacher_classId_idx" ON "Teacher"("classId");

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
