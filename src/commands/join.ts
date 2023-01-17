import {
    CommandInteractionOptionResolver,
    CommandInteraction,
    PermissionResolvable,
    GuildMember,
    ActivityType,
    TextChannel
} from "discord.js";
import { client, LiveTracker, Prisma, sockets } from "../utils/index.js";
import { Battle, Command } from "../types/index.js";

export default {
    name: "join",
    description: "Joins and analyzes live Showdown battles.",
    usage: "[live link]",
    async execute(
        interaction: CommandInteraction,
        options: CommandInteractionOptionResolver
    ) {
        const msgStr = options.getString("link") as string;
        const channel = interaction.channel as TextChannel;

        const hasSendMessages = channel && !(
            channel.isDMBased() ||
            channel
                .permissionsFor(interaction.guild?.members.me as GuildMember)
                .has("SendMessages" as PermissionResolvable)
        );

        try {
            //Extracting battlelink from the message
            const urlRegex = /(https?:\/\/[^ ]*)/;
            const links = msgStr.match(urlRegex);
            let battlelink = "";
            if (links) battlelink = links[0];
            let battleId = battlelink && battlelink.split("/")[3];

            if (Battle.battles.includes(battleId) && battleId !== "") {
                return await interaction.reply(
                    `:x: I'm already tracking battle \`${battleId}\`. If you think this is incorrect, send a replay of this match in the #bugs-and-help channel in the Porygon server.`
                );
            }

            if (
                battlelink &&
                !(
                    battlelink.includes("google") ||
                    battlelink.includes("replay") ||
                    battlelink.includes("draft-league.nl") ||
                    battlelink.includes("porygonbot.xyz")
                )
            ) {
                let server = Object.values(sockets).filter((socket) =>
                    battlelink.includes(socket.link)
                )[0];
                if (!server) {
                    return await interaction.reply(
                        "This link is not a valid Pokemon Showdown battle url."
                    );
                }

                //Getting the rules
                let rules = await Prisma.getRules(interaction.channel?.id as string);

                //Check if bot has SEND_MESSAGES perms in the channel
                if (hasSendMessages) {
                    rules.notalk = true;
                }

                if (!rules.notalk)
                    await interaction
                        .reply(`Watch the battle here:\n${battlelink}\n\nJoining the battle...`)
                        .catch((e: Error) => console.error(e));

                Battle.incrementBattles(battleId);
                client.user!.setActivity(
                    `${Battle.numBattles} PS Battles in ${client.guilds.cache.size} servers.`,
                    {
                        type: ActivityType.Watching,
                    }
                );
                let tracker = new LiveTracker(
                    battleId,
                    server.name,
                    rules,
                    channel,
                    interaction.user
                );
                await tracker.track();
            }
        } catch (e) {
            console.error(e);
        }
    },
} as Command;
