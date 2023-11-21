import { PrismaClient, League, Rules } from "@prisma/client";

//Database!
const prisma = new PrismaClient();

class Prisma {
    static async upsertLeague(obj: League) {
        const league = await this.getLeague(obj.channelId);

        await prisma.league.upsert({
            where: {
                channelId: obj.channelId,
            },
            update: {
                system: obj.system,
                name: obj.name == "" ? league?.name : obj.name,
                resultsChannelId: obj.resultsChannelId,
                dlId: obj.dlId,
                sheetId: obj.sheetId,
                rolesChannels: obj.rolesChannels ?? [],
            },
            create: {
                name: obj.name,
                guildId: obj.guildId,
                channelId: obj.channelId,
                system: obj.system,
                resultsChannelId: obj.resultsChannelId,
                dlId: obj.dlId,
                sheetId: obj.sheetId,
                rolesChannels: obj.rolesChannels ?? [],
            },
        });
    }

    static async leagueWhere<T>(prop: keyof League, value: T) {
        let obj: { [key: string]: T } = {};
        obj[prop] = value;
        const leagues = await prisma.league.findMany({
            where: obj,
        });

        return leagues;
    }

    static async getLeague(channelId: string) {
        const league = await prisma.league.findUnique({
            where: {
                channelId: channelId,
            },
        }) as League;

        return league;
    }

    static async deleteLeague(channelId: string) {
        let league = await this.getLeague(channelId);
        if (league) {
            await prisma.league.delete({
                where: {
                    channelId: channelId,
                },
            });

            await prisma.rules
                .delete({
                    where: {
                        channelId: channelId,
                    },
                })
                .catch((e) =>
                    console.log(
                        `${league?.name} doesn't have any rules to delete.`
                    )
                );
        }
    }

    static async upsertRules(channelId: string, name?: string, rules?: Rules) {
        await prisma.rules.upsert({
            where: {
                channelId: channelId,
            },
            update: {
                ...rules,
            },
            create: {
                channelId: channelId,
                leagueName: name ?? "",
                ...rules,
            },
        });
    }

    static async getRules(channelId: string) {
        let rules: Rules = {
            channelId: channelId,
            leagueName: "Default",
            recoil: "D",
            suicide: "D",
            abilityitem: "P",
            selfteam: "N",
            db: "P",
            spoiler: true,
            ping: "",
            forfeit: "N",
            format: "D",
            quirks: true,
            notalk: false,
            tb: true,
            combine: false,
            redirect: "",
        };

        const numLeagues = await prisma.rules.count({
            where: {
                channelId: channelId,
            },
        });

        if (numLeagues >= 1) {
            let prismaRules = await prisma.rules
                .findUnique({
                    where: {
                        channelId: channelId,
                    },
                })
                .catch((e: Error) => {
                    console.error(e);
                });

            if (prismaRules) rules = prismaRules;
        }

        return rules;
    }

    static async getAll() {
        const leagues = await prisma.league.findMany();
        const rules = await prisma.rules.findMany();

        return {
            rules: rules,
            leagues: leagues,
        };
    }
}

export default Prisma;
