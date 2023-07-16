-- CreateEnum
CREATE TYPE "KillType" AS ENUM ('D', 'P', 'N');

-- CreateEnum
CREATE TYPE "StatsFormat" AS ENUM ('D', 'CSV', 'SPACE', 'TOUR');

-- CreateEnum
CREATE TYPE "System" AS ENUM ('D', 'C', 'DM', 'S', 'DL', 'R');

-- CreateTable
CREATE TABLE "League" (
    "name" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "resultsChannelId" TEXT,
    "dlId" TEXT,
    "sheetId" TEXT,
    "system" "System" NOT NULL DEFAULT 'D',
    "rolesChannels" JSONB,

    CONSTRAINT "League_pkey" PRIMARY KEY ("channelId")
);

-- CreateTable
CREATE TABLE "Rules" (
    "channelId" TEXT NOT NULL,
    "spoiler" BOOLEAN NOT NULL DEFAULT true,
    "ping" TEXT NOT NULL DEFAULT '',
    "quirks" BOOLEAN NOT NULL DEFAULT true,
    "tb" BOOLEAN NOT NULL DEFAULT true,
    "combine" BOOLEAN NOT NULL DEFAULT false,
    "redirect" TEXT NOT NULL DEFAULT '',
    "recoil" "KillType" NOT NULL DEFAULT 'D',
    "suicide" "KillType" NOT NULL DEFAULT 'D',
    "abilityitem" "KillType" NOT NULL DEFAULT 'P',
    "selfteam" "KillType" NOT NULL DEFAULT 'N',
    "db" "KillType" NOT NULL DEFAULT 'P',
    "forfeit" "KillType" NOT NULL DEFAULT 'N',
    "format" "StatsFormat" NOT NULL DEFAULT 'D',
    "leagueName" TEXT NOT NULL,
    "notalk" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Rules_pkey" PRIMARY KEY ("channelId")
);

