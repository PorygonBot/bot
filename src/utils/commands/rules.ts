import { Message, MessageEmbed, Client } from "discord.js";
import { Rules } from "../../types";
import Prisma from "../prisma";

export default {
    name: "rules",
    description: "Gets a list of the custom kill rules that a league has set.",
    async execute(message: Message, args: string[], client: Client) {
        const channel = message.channel;

        //Getting the rules
        let rules = await Prisma.getRules(channel.id) as Rules;
        //Getting the league's info
        let league = await Prisma.getLeague(channel.id);
        let leagueName = league?.name;

        let rulesEmbed = new MessageEmbed()
            .setTitle(`${leagueName}'s Rules`)
            .setDescription(
                `The rules that have been attributed to ${leagueName}.`
            )
            .setColor(0xffc0cb);

        for (let rule of Object.keys(rules)) {
            rulesEmbed.addField(
                rule,
                rules[rule as keyof Rules] === "" ? "None" : rules[rule as keyof Rules] || false
            );
        }

        return channel.send(rulesEmbed);
    },
};
