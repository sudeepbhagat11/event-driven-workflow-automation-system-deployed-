/*
  Warnings:

  - You are about to drop the column `metadata` on the `Trigger` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Zap` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Zap" DROP CONSTRAINT "Zap_userId_fkey";

-- AlterTable
ALTER TABLE "Trigger" DROP COLUMN "metadata";

-- AlterTable
ALTER TABLE "Zap" DROP COLUMN "userId";
