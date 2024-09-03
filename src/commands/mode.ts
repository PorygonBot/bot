import axios from "axios";
import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    TextBasedChannel,
    GuildMember,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    GuildBasedChannel,
    ModalBuilder,
    Role,
} from "discord.js";
import { System, League } from "@prisma/client";
import { Prisma } from "../utils/index.js";

const updateDb = async (
    interaction: CommandInteraction,
    channel: TextBasedChannel,
    mode: System,
    updateObj: League
) => {
    let league = await Prisma.getLeague(channel.id);
    const modes = {
        D: "Default",
        C: "Channel",
        DM: "DM",
        S: "Sheets",
        DL: "DL",
        R: "Roles",
        "": "Default",
    };

    if (league) {
        await Prisma.upsertLeague(updateObj);

        console.log(
            `${league.name}'s mode has been changed to ${
                modes[mode] || "Default"
            } mode!`
        );
        return await interaction.reply({
            content: `\`${league.name}\`'s mode has been changed to ${
                modes[mode] || "Default"
            } mode! ${
                modes[mode] === "Sheets"
                    ? "Please give full editing permissions to `master@porygonthebot.iam.gserviceaccount.com`; I won't be able to work without it."
                    : ""
            }`,
            ephemeral: true,
        });
    } else {
        // Gives league a default name
        let leagueName = channel.id;
        updateObj.name = leagueName;
        await Prisma.upsertLeague(updateObj);

        console.log(
            `${leagueName}'s mode has been set to ${
                modes[mode] || "Default"
            } mode!`
        );
        return await interaction.reply({
            content: `\`${leagueName}\`'s mode has been set to ${
                modes[mode] || "Default"
            } mode! ${
                modes[mode] === "Sheets"
                    ? "Please give full editing permissions to `master@porygonthebot.iam.gserviceaccount.com` and have a tab called \`Raw Stats\`; I won't be able to work without it."
                    : ""
            }`,
            ephemeral: true,
        });
    }
};

const generateRolesModal = async (interaction: CommandInteraction) => {
    // Checking if the server exists
    if (!interaction.guild) {
        await interaction.reply({
            content:
                ":x: This is an invalid server. Please try in another server.",
            ephemeral: true,
        });

        return;
    }

    const rolesModal = new ModalBuilder()
        .setCustomId("mode-roles-modal")
        .setTitle("Roles Mode Chooser");

    // Maximum number of rows in a modal is 5.
    // 2 rows per role-channel set means 2 sets per modal.
    // I will generate more modals if the user requests it in the modal response.
    for (let i = 0; i < 2; i++) {
        // Creates the select menu for the roles
        let pingRow: ActionRowBuilder<StringSelectMenuBuilder> =
            new ActionRowBuilder();
        let pingSelect = new StringSelectMenuBuilder()
            .setCustomId("mode-roles-pings")
            .setPlaceholder("");
        // Gets all roles in the server that can be player roles
        const rolesWithPing = interaction.guild.roles.cache.filter(
            (role: Role) =>
                role.name.toLowerCase().includes("player") ||
                role.name.toLowerCase().includes("coach") ||
                role.name.toLowerCase().includes("participant")
        );
        // Checks if there are any such roles
        if (rolesWithPing.size == 0) {
            await interaction.reply({
                content:
                    ":x: There are no roles in your server with `player`, `coach`, or `participant` in its name.",
                ephemeral: true,
            });

            return;
        }
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
        pingRow.addComponents(pingSelect);

        // Creates the select menu for the channels
        let channelRow: ActionRowBuilder<StringSelectMenuBuilder> =
            new ActionRowBuilder();
        let channelSelect = new StringSelectMenuBuilder()
            .setCustomId("mode-roles-channels")
            .setPlaceholder("");
        // Gets all channels in the server that can be results channels
        const channelsWithName = interaction.guild.channels.cache.filter(
            (channel: GuildBasedChannel) =>
                (channel.name.toLowerCase().includes("replays") ||
                    channel.name.toLowerCase().includes("results")) &&
                channel.isTextBased()
        );
        // Checks if there are any such channels
        if (channelsWithName.size == 0) {
            await interaction.reply({
                content:
                    ":x: There are no channels in your server with `replays` or `results` in its name.",
                ephemeral: true,
            });

            return;
        }
        // Adds each channel as a select option
        channelsWithName.forEach((channel: GuildBasedChannel) =>
            channelSelect.addOptions([
                {
                    label: channel.name,
                    description: channel.parent?.name,
                    value: channel.id,
                    default: false,
                },
            ])
        );
        channelRow.addComponents(channelSelect);

        // TODO: When Discord implements select menus in modal components, uncomment below.
        // rolesModal.addComponents(pingRow);
        // rolesModal.addComponents(channelRow);
    }

    return rolesModal;
};

export default {
    name: "mode",
    description:
        "Sets the stats updating mode. Run without any parameters to get more info.",
    usage: "[mode name with hyphen] [parameter]",
    async execute(
        interaction: CommandInteraction,
        options: CommandInteractionOptionResolver
    ) {
        const channel = interaction.channel as TextBasedChannel;
        const author = interaction.member as GuildMember;

        if (!interaction.guild) {
            return await interaction.reply({
                content:
                    ":x: This is an invalid server. Please try in another server.",
                ephemeral: true,
            });
        }

        if (author && !author.permissions.has("ManageRoles")) {
            return await interaction.reply({
                content:
                    ":x: You're not a moderator. Ask a moderator to set the mode of this league for you.",
                ephemeral: true,
            });
        }

        let mode: System = options.getString("method") as System;
        let streamChannel = options.getChannel("channel");
        let sheetsID = "";
        let dlID = "";
        let rolesChannels = {} as { [key: string]: string };
        switch (mode) {
            case "C":
                if (!streamChannel) {
                    return interaction.reply({
                        content:
                            ":x: You didn't link a valid channel. Please run the command again and link the channel you'd like the stats to be put in.",
                        ephemeral: true,
                    });
                }
                break;
            case "DM":
                break;
            case "S":
                let sheetsLink = options.getString("url");
                if (
                    !(
                        sheetsLink &&
                        sheetsLink.includes(
                            "https://docs.google.com/spreadsheets/d"
                        )
                    )
                ) {
                    return interaction.reply({
                        content:
                            ":x: This is not a Google Sheets link. Please copy-paste the URL of your Google Sheets file.",
                        ephemeral: true,
                    });
                }
                sheetsID = sheetsLink.split("/")[5];

                break;
            case "DL":
                let dlLink = options.getString("url");
                if (
                    !(
                        dlLink &&
                        dlLink.startsWith(
                            "https://draft-league.nl/public/pages/league.php?league="
                        )
                    )
                ) {
                    return interaction.reply({
                        content:
                            ":x: This is not a valid draft-league.nl public URL.",
                        ephemeral: true,
                    });
                }

                let dlParams = new URLSearchParams(dlLink.split("?")[1]);
                let dlIDTemp = dlParams.get("league");
                if (!dlIDTemp)
                    return interaction.reply({
                        content: ":x: League ID not found.",
                        ephemeral: true,
                    });
                dlID = dlIDTemp;

                const dlResponse = await axios.get(
                    `${process.env.DL_API_URL}/league/${dlID}?key=${process.env.DL_API_KEY}`,
                    {
                        headers: { "User-Agent": "PorygonTheBot" },
                    }
                );
                const dlData = dlResponse.data;
                if (!dlData.mod_discords.includes(`<@${author.id}>`)) {
                    return interaction.reply({
                        content:
                            ":x: You're not a moderator on the website for the given league.",
                        ephemeral: true,
                    });
                }
                break;
            case "R":
                // Until discord implements select menus in modal components, THIS CODE WILL NOT WORK

                const rolesModal = await generateRolesModal(interaction);

                if (!rolesModal) {
                    return await interaction.reply({
                        content:
                            ":x: Something went wrong while trying to build the select menus. Please try again.",
                        ephemeral: true,
                    });
                }

                await interaction.showModal(rolesModal);
                break;
            default:
                break;
        }

        await updateDb(interaction, channel, mode, {
            name: "",
            channelId: channel.id,
            system: mode,
            guildId: interaction.guild.id,
            resultsChannelId: streamChannel?.id || "",
            dlId: dlID,
            sheetId: sheetsID,
            rolesChannels: rolesChannels,
        });
    },
};
