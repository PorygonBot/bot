/*
  Warnings:

  - You are about to drop the column `timeOfPing` on the `Rules` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Rules" DROP COLUMN "timeOfPing";

-- DropEnum
DROP TYPE "PingTime";
