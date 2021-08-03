/*
  Warnings:

  - Added the required column `leagueName` to the `Rules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rules" ADD COLUMN     "leagueName" TEXT NOT NULL;
