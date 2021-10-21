import { Message, MessageEmbed, Client } from "discord.js";
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

        let rulesEmbed = new MessageEmbed()
            .setTitle(`${leagueName}'s Rules`)
            .setDescription(
                `The rules that have been attributed to ${leagueName}.`
            )
            .setColor(0xffc0cb)
            .addField("Channel", `<#${rules.channelId}>`)
            .addField("Recoil", rules.recoil)
            .addField("Suicide", rules.suicide)
            .addField("Ability/Item", rules.abilityitem)
            .addField("Self/Team", rules.selfteam)
            .addField("Destiny Bond", rules.db)
            .addField("Spoiler", rules.spoiler.toString())
            .addField("Ping", rules.ping || "None")
            .addField("Forfeit", rules.forfeit)
            .addField("Format", rules.format)
            .addField("Quirks", rules.quirks.toString())
            .addField("No Talk", rules.notalk.toString())
            .addField("Tidbits", rules.tb.toString())
            .addField("Combine P/D", rules.combine.toString())
            .addField("Redirect Channel", rules.redirect || "None");

        return channel.send({ embeds: [rulesEmbed] });
    },
};
