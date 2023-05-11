import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildMember,
    ButtonInteraction,
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

        if (!channel)
            return await interaction.reply({
                content: ":x: Command was not run in a channel..",
                ephemeral: true,
            });

        const league = await Prisma.getLeague(channel.id);

        if (league) {
            const row = new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setCustomId("delete-yes")
                    .setLabel("Yes")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("delete-no")
                    .setLabel("No")
                    .setStyle(ButtonStyle.Danger),
            ]) as ActionRowBuilder<ButtonBuilder>;

            await interaction.reply({
                content: `Are you sure you want to delete ${league.name}`,
                components: [row],
                ephemeral: true,
            });
        } else {
            return await interaction.reply({
                content: ":x: There is no valid league in this channel.",
                ephemeral: true,
            });
        }
    },
    async buttonResponse(interaction: ButtonInteraction) {
        const name = interaction.customId;

        if (!interaction.channel)
            return await interaction.reply({
                content: ":x: Command was not run in a channel..",
                ephemeral: true,
            });
        const league = await Prisma.getLeague(interaction.channel.id);

        if (!league)
            return await interaction.reply({
                content: ":x: There is no valid league in this channel.",
                ephemeral: true,
            });

        if (name.endsWith("yes")) {
            await interaction.reply({
                content: "Deleting...",
                ephemeral: true,
            });

            await Prisma.deleteLeague(interaction.channel.id);

            return await interaction.editReply(
                `\`${league.name}\` has been deleted.`
            );
        }

        return await interaction.reply({
            content: "Command cancelled.",
            ephemeral: true,
        });
    },
} as Command;
