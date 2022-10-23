import { KillType, StatsFormat } from "@prisma/client";

interface Rules {
    channelId: string;
    leagueName: string;
    recoil: KillType;
    suicide: KillType;
    abilityitem: KillType;
    selfteam: KillType;
    db: KillType;
    spoiler: boolean;
    ping: string;
    forfeit: KillType;
    format: StatsFormat;
    quirks: boolean;
    notalk: boolean;
    tb: boolean;
    combine: boolean;
    redirect: string;
    isSlash?: boolean;
}

export default Rules;
