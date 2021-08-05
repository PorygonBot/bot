import { Message, MessageEmbed, Client } from "discord.js";
import { Rules } from "../../types";
import Prisma from "../prisma";

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
            .addField("Spoiler", rules.spoiler)
            .addField("Ping", rules.ping || "None")
            .addField("Forfeit", rules.forfeit)
            .addField("Format", rules.format)
            .addField("Quirks", rules.quirks)
            .addField("No Talk", rules.notalk)
            .addField("Tidbits", rules.tb)
            .addField("Combine P/D", rules.combine)
            .addField("Redirect Channel", rules.redirect || "None");

        return channel.send(rulesEmbed);
    },
};
