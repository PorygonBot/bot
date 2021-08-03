/*
  Warnings:

  - The `system` column on the `League` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `recoil` column on the `Rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `suicide` column on the `Rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `abilityitem` column on the `Rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `selfteam` column on the `Rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `db` column on the `Rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `forfeit` column on the `Rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `format` column on the `Rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `timeOfPing` column on the `Rules` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "System" AS ENUM ('D', 'C', 'DM', 'S', 'DL');

-- CreateEnum
CREATE TYPE "KillType" AS ENUM ('D', 'P', 'N');

-- CreateEnum
CREATE TYPE "PingTime" AS ENUM ('SENT', 'FIRST');

-- CreateEnum
CREATE TYPE "StatsFormat" AS ENUM ('D', 'CSV', 'SPACE');

-- AlterTable
ALTER TABLE "League" DROP COLUMN "system",
ADD COLUMN     "system" "System" NOT NULL DEFAULT E'D';

-- AlterTable
ALTER TABLE "Rules" DROP COLUMN "recoil",
ADD COLUMN     "recoil" "KillType" NOT NULL DEFAULT E'D',
DROP COLUMN "suicide",
ADD COLUMN     "suicide" "KillType" NOT NULL DEFAULT E'D',
DROP COLUMN "abilityitem",
ADD COLUMN     "abilityitem" "KillType" NOT NULL DEFAULT E'P',
DROP COLUMN "selfteam",
ADD COLUMN     "selfteam" "KillType" NOT NULL DEFAULT E'N',
DROP COLUMN "db",
ADD COLUMN     "db" "KillType" NOT NULL DEFAULT E'P',
DROP COLUMN "forfeit",
ADD COLUMN     "forfeit" "KillType" NOT NULL DEFAULT E'N',
DROP COLUMN "format",
ADD COLUMN     "format" "StatsFormat" NOT NULL DEFAULT E'D',
DROP COLUMN "timeOfPing",
ADD COLUMN     "timeOfPing" "PingTime" NOT NULL DEFAULT E'FIRST';
