-- CreateEnum
CREATE TYPE "PromotionTrack" AS ENUM ('NURSERY', 'PRIMARY', 'JSS', 'SSS', 'OTHER');

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "isTerminal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promotionRank" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promotionTrack" "PromotionTrack" NOT NULL DEFAULT 'OTHER';

-- CreateIndex
CREATE INDEX "Class_promotionTrack_promotionRank_idx" ON "Class"("promotionTrack", "promotionRank");

-- CreateIndex
CREATE INDEX "Class_isTerminal_idx" ON "Class"("isTerminal");
