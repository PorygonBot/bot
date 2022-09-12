import { Message, EmbedBuilder, Client } from "discord.js";
import { Rules } from "../types";
import { Prisma } from "../utils";

export default {
    name: "rules",
    description: "Gets a list of the custom kill rules that a league has set.",
    async execute(message: Message, args: string[], client: Client) {
        const channel = message.channel;

        //Getting the rules
        let rules = (await Prisma.getRules(channel.id)) as Rules;
        //Getting the league's info
        let league = await Prisma.getLeague(channel.id);
        let leagueName = league?.name;

        let rulesEmbed = new EmbedBuilder()
            .setTitle(`${leagueName}'s Rules`)
            .setDescription(
                `The rules that have been attributed to ${leagueName}.`
            )
            .setColor(0xffc0cb)
            .addFields([
                { name: "Channel", value: `<#${rules.channelId}>` },
                { name: "Recoil", value: rules.recoil },
                { name: "Suicide", value: rules.suicide },
                { name: "Ability/Item", value: rules.abilityitem },
                { name: "Self/Team", value: rules.selfteam },
                { name: "Destiny Bond", value: rules.db },
                { name: "Spoiler", value: rules.spoiler.toString() },
                { name: "Ping", value: rules.ping || "None" },
                { name: "Forfeit", value: rules.forfeit },
                { name: "Format", value: rules.format },
                { name: "Quirks", value: rules.quirks.toString() },
                { name: "No Talk", value: rules.notalk.toString() },
                { name: "Tidbits", value: rules.tb.toString() },
                { name: "Combine P/D", value: rules.combine.toString() },
                { name: "Redirect Channel", value: rules.redirect || "None" },
            ]);

        return channel.send({ embeds: [rulesEmbed] });
    },
};
