/*
  Warnings:

  - You are about to drop the column `stopTalking` on the `Rules` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Rules" DROP COLUMN "stopTalking",
ADD COLUMN     "notalk" BOOLEAN NOT NULL DEFAULT false;
