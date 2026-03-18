/*
  Warnings:

  - You are about to drop the column `venueId` on the `TimetableEntry` table. All the data in the column will be lost.
  - You are about to drop the `Venue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TimetableEntry" DROP CONSTRAINT "TimetableEntry_venueId_fkey";

-- DropIndex
DROP INDEX "TimetableEntry_venueId_idx";

-- AlterTable
ALTER TABLE "TimetableEntry" DROP COLUMN "venueId";

-- DropTable
DROP TABLE "Venue";
