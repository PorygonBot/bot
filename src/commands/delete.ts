import { Message, Client } from "discord.js";
import { Prisma } from "../utils";
import { Command } from "../types";

export default {
    name: "delete",
    description: "Deletes the league's record from the Porygon database",
    async execute(message: Message, args: string[], client: Client) {
        const channel = message.channel;

        const league = await Prisma.getLeague(channel.id);

        if (league) {
            //Asking for confirmation
            const filter = (m: Message) => m.author === message.author;
            let collector = channel.createMessageCollector({
                filter,
                max: 1,
            });
            await channel.send(
                `Are you sure you want to delete \`${league.name}\` from the database? All your custom rules and modes will be deleted and cannot be undone (respond with "yes").`
            );
            collector.on("end", async (collected, reason) => {
                // if (m.content.toLowerCase() === "yes" && m.author === message.author) {
                //     /* Deleting the rules record first. */
                //     await Prisma.deleteLeague(channel.id);

                //     return await channel.send(
                //         `\`${league.name}\`'s records have been deleted from the Porygon database permanently.`
                //     );
				// } else {
				// 	return await channel.send("Command ignored. If you'd still like to delete this league, run the command again.")
				// }
                console.log(collected);
            });
		} else {
			return await channel.send(':x: There is no valid league in this channel.')
		}
    },
} as Command;
