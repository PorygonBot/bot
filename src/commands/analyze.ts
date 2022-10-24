import {
    CommandInteractionOptionResolver,
    CommandInteraction,
} from "discord.js";
import axios from "axios";
import { Prisma, ReplayTracker, slashAnalyzeUpdate } from "../utils/index.js";
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

        if (!(replayLink.includes("replay") && links)) {
            return await interaction.reply(`:x: ${replayLink} is not a replay.`);
        }
        interaction.deferReply();

        let link = replayLink + ".log";
        let response = await axios.get(link, {
            headers: { "User-Agent": "PorygonTheBot" },
        });
        let data = response.data;

        //Getting the rules
        let rules = await Prisma.getRules(interaction.channel?.id as string);

        let replayer = new ReplayTracker(replayLink, rules);
        const matchJson = await replayer.track(data);

        await slashAnalyzeUpdate(matchJson, interaction);
        console.log(`${link} has been analyzed!`);
    },
} as Command;
