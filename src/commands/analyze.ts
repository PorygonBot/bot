import {
    CommandInteractionOptionResolver,
    CommandInteraction,
    TextChannel,
    GuildMember,
    PermissionResolvable,
} from "discord.js";
import axios from "axios";
import { Prisma, ReplayTracker, update } from "../utils/index.js";
import { Command } from "../types/index.js";

export default {
    name: "analyze",
    description: "Analyzes Pokemon Showdown replays.",
    aliases: ["analyse"],
    usage: "[replay link]",
    async execute(
        interaction: CommandInteraction,
        options: CommandInteractionOptionResolver
    ) {
        const replayLink = options.getString("replay") as string;
        const urlRegex = /(https?:\/\/[^ ]*)/;
        const links = replayLink.match(urlRegex);

        // Discord interaction message limit is 2000, so if it errors, it has to error properly
        if (replayLink.length >= 1950) {
            return await interaction.reply({
                content: `:x: Your replay length is too long.`,
                ephemeral: true,
            });
        }

        // Checks if given link is a valid replay
        if (!(replayLink.includes("replay") && links)) {
            return await interaction.reply({
                content: `:x: ${replayLink} is not a replay.`,
                ephemeral: true,
            });
        }
        // Checks if bot has send messages perms
        let channel = interaction.channel;
        const hasSendMessages =
            channel &&
            !channel.isDMBased() &&
            channel
                .permissionsFor(interaction.guild?.members.me as GuildMember)
                .has("SendMessages" as PermissionResolvable);
        if (!hasSendMessages) {
            return await interaction.reply(
                ":x: I can't send messages in this channel."
            );
        }

        await interaction.reply("Analyzing...");

        // Gets the replay plog
        let link = replayLink + ".log";
        let response = await axios
            .get(link, {
                headers: { "User-Agent": "PorygonTheBot" },
            })
            .catch(async (e) => {
                await interaction.editReply(
                    ":x: Something went wrong. Please check your reply link."
                );
                return;
            });
        if (!(response && interaction.channel))
            return await interaction.editReply(
                ":x: Something went wrong. Please check your reply link."
            );
        let data = response.data;

        //Getting the rules
        let rules = await Prisma.getRules(interaction.channel?.id as string);

        // Starts analyzing
        let replayer = new ReplayTracker(replayLink, rules);
        const matchJson = await replayer.track(data);

        // Any error
        if (matchJson.error) {
            return await interaction.editReply(matchJson.error);
        }

        // Updates
        await update(
            matchJson,
            interaction.channel as TextChannel,
            interaction.user
        );
        console.log(`${link} has been analyzed!`);
    },
} as Command;
