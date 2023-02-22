import { League } from "@prisma/client";
import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    GuildMember,
    TextBasedChannel,
} from "discord.js";

import { Prisma } from "../utils/index.js";

export default {
    name: "rename",
    description: "Renames your league in the Porygon database",
    usage: "[new name, including spaces and all special characters]",
    async execute(
        interaction: CommandInteraction,
        options: CommandInteractionOptionResolver
    ) {
        const channel = interaction.channel as TextBasedChannel;
        const newName = options.getString("name") as string;
        const author = interaction.member as GuildMember;

        if (author && !author.permissions.has("ManageRoles")) {
            return interaction.reply({
                content:
                    ":x: You're not a moderator. Ask a moderator to set the mode of this league for you.",
                ephemeral: true,
            });
        }

        if (newName.length >= 256) {
            return interaction.reply({
                content:
                    ":x: The name provided is too long. Please use a shorter name.",
                ephemeral: true,
            });
        }

        //Getting league info
        const league = await Prisma.getLeague(channel.id);
        //Updating the league's record with the new name
        if (league) {
            await Prisma.upsertLeague({
                channelId: league.channelId,
                system: league.system,
                name: newName,
            } as League);

            return await interaction.reply({
                content: `Changed this league's name from \`${league.name}\` to \`${newName}\`!`,
                ephemeral: true,
            });
        } else {
            return await interaction.reply(
                ":x: There is no valid league in this channel."
            );
        }
    },
};
