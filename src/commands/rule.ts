import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    TextBasedChannel,
    GuildMember,
    ActionRowBuilder,
    SelectMenuBuilder,
    Role,
    GuildBasedChannel,
    SelectMenuInteraction,
} from "discord.js";
import { consts, Prisma } from "../utils/index.js";
import { Rule, Rules } from "../types/index.js";
import { RegularExpressionLiteral } from "typescript";
import { StatsFormat } from "@prisma/client";

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

        let row: ActionRowBuilder<SelectMenuBuilder> = new ActionRowBuilder();
        if (consts.battleRules.includes(ruleName as unknown as string)) {
            row.addComponents(
                new SelectMenuBuilder()
                    .setCustomId(`rule-${ruleName}`)
                    // .setPlaceholder(rules[ruleName] as string)
                    .addOptions([
                        {
                            label: "Direct",
                            description:
                                "When this type of death occurs, it gives a direct kill.",
                            value: "D",
                            default: rules[ruleName] === "D",
                        },
                        {
                            label: "Passive",
                            description:
                                "When this type of death occurs, it gives a passive kill.",
                            value: "P",
                            default: rules[ruleName] === "P",
                        },
                        {
                            label: "None",
                            description:
                                "When this type of death occurs, it doesn't give a kill.",
                            value: "N",
                            default: rules[ruleName] === "N",
                        },
                    ])
            );
        } else if (consts.boolRules.includes(ruleName)) {
            row.addComponents(
                new SelectMenuBuilder()
                    .setCustomId(`rule-${ruleName}`)
                    // .setPlaceholder(rules[ruleName] as string)
                    .addOptions([
                        {
                            label: "True",
                            description: "True",
                            value: "true",
                            default: rules[ruleName] == true,
                        },
                        {
                            label: "False",
                            description: "False",
                            value: "false",
                            default: rules[ruleName] == false,
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
            console.log(rules[ruleName]);
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
                    (channel.name.toLowerCase().includes("replays") ||
                        channel.name.toLowerCase().includes("results")) &&
                    channel.isTextBased()
            );
            //Adds each channel as a select option
            channelsWithName.forEach((channel: GuildBasedChannel) =>
                channelSelect.addOptions([
                    {
                        label: channel.name,
                        description: channel.parent?.name,
                        value: channel.id,
                        default: rules[ruleName] === channel.id,
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
        return await interaction.reply({
            content: `What would you like \`${ruleName}\` to be?`,
            components: [row],
            ephemeral: true,
        });
    },
    async buttonResponse(interaction: SelectMenuInteraction) {
        if (!interaction.channel)
            return await interaction.reply({
                content: ":x: Command was not run in a channel.",
                ephemeral: true,
            });
        if (!interaction.message.interaction) {
            return await interaction.reply({
                content: ":x: This is not a reply to a previous interaction.",
                ephemeral: true,
            });
        }

        let rules: Rules = await Prisma.getRules(interaction.channel.id);
        let ruleKey: Rule = interaction.customId.split("-")[1] as Rule;
        let ruleValue = interaction.values[0];
        if (ruleValue === "D" || ruleValue === "P" || ruleValue === "N") {
            // rules[ruleKey] = ruleValue;
            switch (ruleKey) {
                case "recoil":
                    rules.recoil = ruleValue;
                    break;
                case "suicide":
                    rules.suicide = ruleValue;
                    break;
                case "selfteam":
                    rules.selfteam = ruleValue;
                    break;
                case "abilityitem":
                    rules.abilityitem = ruleValue;
                    break;
                case "db":
                    rules.db = ruleValue;
                    break;
                case "forfeit":
                    rules.forfeit = ruleValue;
                    break;
            }
        } else if (ruleValue === "true" || ruleValue === "false") {
            let boolRuleValue = ruleValue === "true";
            switch (ruleKey) {
                case "spoiler":
                    rules.spoiler = boolRuleValue;
                    break;
                case "quirks":
                    rules.quirks = boolRuleValue;
                    break;
                case "notalk":
                    rules.notalk = boolRuleValue;
                    break;
                case "tb":
                    rules.tb = boolRuleValue;
                    break;
                case "combine":
                    rules.combine = boolRuleValue;
                    break;
            }
        } else {
            switch (ruleKey) {
                case "ping":
                    rules.ping = ruleValue;
                    break;
                case "format":
                    rules.format = ruleValue as StatsFormat;
                    break;
                case "redirect":
                    rules.redirect = ruleValue;
                    break;
            }
        }

        //Updating the rules
        await Prisma.upsertRules(
            interaction.channel.id,
            rules.leagueName,
            rules as unknown as { [key: string]: string | boolean }
        );

        return await interaction.reply({
            content: "Your rule has been set!",
        });
    },
};
