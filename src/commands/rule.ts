import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    TextBasedChannel,
    GuildMember,
    ActionRowBuilder,
    Role,
    GuildBasedChannel,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    StringSelectMenuInteraction,
} from "discord.js";
import { KillType, Rules, StatsFormat } from "@prisma/client";
import { consts, Prisma } from "../utils/index.js";
import { Rule } from "../types/index.js";

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

        let row: ActionRowBuilder<StringSelectMenuBuilder> =
            new ActionRowBuilder();
        if (consts.battleRules.includes(ruleName)) {
            row.addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`rule-${ruleName}`)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Direct")
                            .setDescription(
                                "When this type of death occurs, it gives a direct kill."
                            )
                            .setValue(KillType.D)
                            .setDefault(rules[ruleName] === KillType.D),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Passive")
                            .setDescription(
                                "When this type of death occurs, it gives a passive kill."
                            )
                            .setValue(KillType.P)
                            .setDefault(rules[ruleName] === KillType.P),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("None")
                            .setDescription(
                                "When this type of death occurs, it doesn't give a kill."
                            )
                            .setValue(KillType.N)
                            .setDefault(rules[ruleName] === KillType.N)
                    )
            );
        } else if (consts.boolRules.includes(ruleName)) {
            row.addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`rule-${ruleName}`)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("True")
                            .setDescription("True")
                            .setValue("true")
                            .setDefault(rules[ruleName] == true),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("False")
                            .setDescription("False")
                            .setValue("false")
                            .setDefault(rules[ruleName] == false)
                    )
            );
        } else if (ruleName === "ping") {
            let pingSelect = new StringSelectMenuBuilder().setCustomId(
                "rule-ping"
            );

            //Gets all roles in the server
            const rolesWithPing = interaction.guild.roles.cache.filter(
                (role: Role) => role.name.toLowerCase().includes("ping")
            );

            if (rolesWithPing.size == 0) {
                return await interaction.reply({
                    content:
                        ":x: There are no roles in your server with `ping`in its name.",
                    ephemeral: true,
                });
            }
            //Adds each role as a select option
            rolesWithPing.forEach((role: Role) =>
                pingSelect.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(role.name)
                        .setDescription(role.name)
                        .setValue(role.toString())
                )
            );

            row.addComponents(pingSelect);
        } else if (ruleName === "redirect") {
            let channelSelect = new StringSelectMenuBuilder().setCustomId(
                "rule-redirect"
            );

            //Gets all channels in the server that can be results channels
            const channelsWithName = interaction.guild.channels.cache.filter(
                (channel: GuildBasedChannel) =>
                    (channel.name.toLowerCase().includes("replays") ||
                        channel.name.toLowerCase().includes("results")) &&
                    channel.isTextBased()
            );

            if (channelsWithName.size == 0) {
                return await interaction.reply({
                    content:
                        ":x: There are no channels in your server with `replays` or `results` in its name.",
                    ephemeral: true,
                });
            }
            //Adds each channel as a select option
            channelsWithName.forEach((channel: GuildBasedChannel) =>
                channelSelect.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(channel.name)
                        .setDescription(channel.parent?.name || "")
                        .setValue(channel.id)
                        .setDefault(rules[ruleName] === channel.id)
                )
            );

            row.addComponents(channelSelect);
        } else if (ruleName === "format") {
            row.addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`rule-${ruleName}`)
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Default")
                            .setDescription("The default formatting for stats.")
                            .setValue(StatsFormat.D)
                            .setDefault(rules[ruleName] === StatsFormat.D),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("CSV")
                            .setDescription("Stats separated by commas.")
                            .setValue(StatsFormat.CSV)
                            .setDefault(rules[ruleName] === StatsFormat.CSV),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Spaced")
                            .setDescription("Stats separated by spaces.")
                            .setValue(StatsFormat.SPACE)
                            .setDefault(rules[ruleName] === StatsFormat.SPACE),
                        new StringSelectMenuOptionBuilder()
                            .setLabel("Tour")
                            .setDescription(
                                "All stast stacked with CSV without any spacing or tidbits."
                            )
                            .setValue(StatsFormat.TOUR)
                            .setDefault(rules[ruleName] === StatsFormat.TOUR)
                    )
            );
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
    async buttonResponse(interaction: StringSelectMenuInteraction) {
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
            let killRuleValue = ruleValue as KillType;
            // rules[ruleKey] = killRuleValue;
            switch (ruleKey) {
                case "recoil":
                    rules.recoil = killRuleValue;
                    break;
                case "suicide":
                    rules.suicide = killRuleValue;
                    break;
                case "selfteam":
                    rules.selfteam = killRuleValue;
                    break;
                case "abilityitem":
                    rules.abilityitem = killRuleValue;
                    break;
                case "db":
                    rules.db = killRuleValue;
                    break;
                case "forfeit":
                    rules.forfeit = killRuleValue;
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
            rules
        );

        return await interaction.reply({
            content: "Your rule has been set!",
            ephemeral: true,
        });
    },
};
