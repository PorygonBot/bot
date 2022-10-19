import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    TextBasedChannel,
    GuildMember,
    ActionRowBuilder,
    SelectMenuBuilder,
    Role,
    GuildBasedChannel,
} from "discord.js";
import { consts, Prisma } from "../utils/index.js";
import { Rule, Rules } from "../types/index.js";

export default {
    name: "rule",
    description:
        "Creates a custom kill rule depending on the parameters. Run command without parameters for more info.",
    usage: "[rule name with hyphen] [parameter]",
    async execute(
        interaction: CommandInteraction,
        options: CommandInteractionOptionResolver
    ) {
        const channel = interaction.channel as TextBasedChannel;
        const author = interaction.member as GuildMember;

        // If author is not a mod
        if (author && !author.permissions.has("ManageRoles")) {
            return interaction.reply({
                content:
                    ":x: You're not a moderator. Ask a moderator to set the mode of this league for you.",
                ephemeral: true,
            });
        }

        // If interaction is not run in a server
        if (!interaction.guild) {
            return interaction.reply({
                content: ":x: You are not running this command in a server.",
                ephemeral: true,
            });
        }

        //Getting rules
        let rules: Rules = await Prisma.getRules(channel.id);
        let ruleName: Rule = options.getString("rule") as Rule;

        // let row: ActionRow<MessageActionRowComponent>;
        let row: ActionRowBuilder<SelectMenuBuilder> = new ActionRowBuilder();
        if (consts.battleRules.includes(ruleName as unknown as string)) {
            row.addComponents(
                new SelectMenuBuilder()
                    .setCustomId("rule-battle")
                    .setPlaceholder(rules[ruleName] as string)
                    .addOptions([
                        {
                            label: "Direct",
                            description:
                                "When this type of death occurs, it gives a direct kill.",
                            value: "D",
                        },
                        {
                            label: "Passive",
                            description:
                                "When this type of death occurs, it gives a passive kill.",
                            value: "P",
                        },
                        {
                            label: "None",
                            description:
                                "When this type of death occurs, it doesn't give a kill.",
                            value: "N",
                        },
                    ])
            );
        } else if (consts.boolRules.includes(ruleName)) {
            row.addComponents(
                new SelectMenuBuilder()
                    .setCustomId("rule-bool")
                    .setPlaceholder(rules[ruleName] as string)
                    .addOptions([
                        { label: "True", description: "True", value: "true" },
                        {
                            label: "False",
                            description: "False",
                            value: "false",
                        },
                    ])
            );
        } else if (ruleName === "ping") {
            let pingSelect = new SelectMenuBuilder()
                .setCustomId("rule-ping")
                .setPlaceholder(rules[ruleName] as string);

            //Gets all roles in the server
            const rolesWithPing = interaction.guild.roles.cache.filter(
                (role: Role) => role.name.toLowerCase().includes("ping")
            );
            //Adds each role as a select option
            rolesWithPing.forEach((role: Role) =>
                pingSelect.addOptions([
                    {
                        label: role.name,
                        description: role.name,
                        value: role.toString(),
                    },
                ])
            );

            row.addComponents(pingSelect);
        } else if (ruleName === "redirect") {
            let channelSelect = new SelectMenuBuilder()
                .setCustomId("rule-redirect")
                .setPlaceholder(rules[ruleName] as string);

            //Gets all channels in the server
            const channelsWithName = interaction.guild.channels.cache.filter(
                (channel: GuildBasedChannel) =>
                    (channel.name.toLowerCase().includes("live-links") ||
                        channel.name.toLowerCase().includes("live-battles")) &&
                    channel.isTextBased()
            );
            //Adds each channel as a select option
            channelsWithName.forEach((channel: GuildBasedChannel) =>
                channelSelect.addOptions([
                    {
                        label: channel.name,
                        description: channel.parent?.name,
                        value: channel.id,
                    },
                ])
            );

            row.addComponents(channelSelect);
        } else {
            return await interaction.reply({
                content: ":x: Not a valid rule.",
                ephemeral: true,
            });
        }

        // //Updating the rules
        // await Prisma.upsertRules(
        //     channel.id,
        //     rules.leagueName,
        //     rules as unknown as { [key: string]: string | boolean }
        // );

        // return await interaction.reply({
        //     content: "Your rules have been set!",
        //     ephemeral: true,
        // });
    },
};
