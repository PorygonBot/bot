import { Message, Client } from "discord.js";

import { Prisma } from "../utils";

export default {
    name: "rename",
    description: "Renames your league in the Porygon database",
    usage: "[new name, including spaces and all special characters]",
    async execute(message: Message, args: string[], client: Client) {
        const channel = message.channel;
        const newName = args.join(" ");

        //Getting league info
        const league = await Prisma.getLeague(channel.id);

        //Updating the league's record with the new name
		if (league) {
			await Prisma.upsertLeague({
				channelId: league.channelId,
				system: league.system,
				leagueName: newName,
			});

			return await channel.send(
				`Changed this league's name from \`${league.name}\` to \`${newName}\`!`
			);
		}
		else {
			return await channel.send(":x: There is no valid league in this channel.")
		}
    },
};
