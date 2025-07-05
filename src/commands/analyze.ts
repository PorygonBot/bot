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
        let replayLink = options.getString("replay") as string;
        const urlRegex = /(https?:\/\/[^ ]*)/;
        const links = replayLink.match(urlRegex);

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

        // Discord interaction message limit is 2000, so if it errors, it has to error properly
        if (replayLink.length >= 1950) {
            return await interaction.editReply({
                content: `:x: Your replay length is too long.`
            });
        }

        // Checks if given link is a valid replay
        if (!(replayLink.includes("replay") && links)) {
            return await interaction.editReply({
                content: `:x: ${replayLink} is not a replay.`
            });
        }

        // EXTRA CODE FOR POKEATHLON ONLY
        if (replayLink.includes("pokeathlon")) {
            const replayID = replayLink.split("=")[1]
            replayLink = "https://sim.pokeathlon.com/replays/" + replayID;
        }

        // Gets the replay plog
        let link = replayLink + ".log";
        let response = await axios
            .get(link, {
                headers: { "User-Agent": "PorygonTheBot" },
            })
            .catch(async (e) => {
                await interaction.editReply(
                    ":x: Something went wrong. Please check your replay link."
                );
                return;
            });
        if (!(response && interaction.channel))
            return await interaction.editReply(
                ":x: Something went wrong. Please check your replay link."
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


/**
 * SELECT student_id, meeting_id, title, recording_number
 * FROM  (
 *      watched AS w JOIN (SELECT * FROM meeting WHERE course_id = 'CS451') AS m ON m.meeting_id = w.meeting_id
 * ) JOIN (SELECT * FROM attended WHERE )
 * ORDER BY student_id;
 */