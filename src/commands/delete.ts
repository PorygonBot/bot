import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRow,
    MessageActionRowComponent,
    GuildMember,
} from "discord.js";
import { Prisma } from "../utils/index.js";
import { Command } from "../types/index.js";

export default {
    name: "delete",
    description: "Deletes the league's record from the Porygon database",
    async execute(
        interaction: CommandInteraction,
        options: CommandInteractionOptionResolver
    ) {
        const channel = interaction.channel;
        const author = interaction.member as GuildMember;

        if (author && !author.permissions.has("ManageRoles")) {
            return interaction.reply({
                content:
                    ":x: You're not a moderator. Ask a moderator to set the mode of this league for you.",
                ephemeral: true,
            });
        }

        const league = await Prisma.getLeague(channel?.id as string);

        if (league) {
            const row = new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setCustomId("delete-yes")
                    .setLabel("Yes")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("delete-no")
                    .setLabel("No")
                    .setStyle(ButtonStyle.Primary),
            ]).data as ActionRow<MessageActionRowComponent>;

            await interaction.reply({
                content: `Are you sure you want to delete ${league.name}`,
                components: [row],
            });
        } else {
            return await interaction.reply(
                ":x: There is no valid league in this channel."
            );
        }
    },
} as Command;
