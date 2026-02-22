/*
  Warnings:

  - You are about to drop the column `classId` on the `Teacher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_classId_fkey";

-- DropIndex
DROP INDEX "Teacher_classId_idx";

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "classId";

-- CreateIndex
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
