/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "Profile";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "League" (
    "name" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "resultsChannelId" TEXT,
    "dlId" TEXT,
    "sheetId" TEXT,
    "system" TEXT NOT NULL DEFAULT E'',

    PRIMARY KEY ("channelId")
);

-- CreateTable
CREATE TABLE "Rules" (
    "channelId" TEXT NOT NULL,
    "recoil" TEXT NOT NULL DEFAULT E'd',
    "suicide" TEXT NOT NULL DEFAULT E'd',
    "abilityitem" TEXT NOT NULL DEFAULT E'p',
    "selfteam" TEXT NOT NULL DEFAULT E'n',
    "db" TEXT NOT NULL DEFAULT E'p',
    "spoiler" BOOLEAN NOT NULL DEFAULT true,
    "ping" TEXT NOT NULL DEFAULT E'',
    "forfeit" TEXT NOT NULL DEFAULT E'n',
    "format" TEXT NOT NULL DEFAULT E'default',
    "quirks" BOOLEAN NOT NULL DEFAULT true,
    "stopTalking" BOOLEAN NOT NULL DEFAULT false,
    "tb" BOOLEAN NOT NULL DEFAULT true,
    "combine" BOOLEAN NOT NULL DEFAULT false,
    "redirect" TEXT NOT NULL DEFAULT E'',
    "timeOfPing" TEXT NOT NULL DEFAULT E'first',

    PRIMARY KEY ("channelId")
);
