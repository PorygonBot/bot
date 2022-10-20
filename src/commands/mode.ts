import axios from "axios";
import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    TextBasedChannel,
    GuildMember,
} from "discord.js";
import { System } from "@prisma/client";

import { Prisma } from "../utils/index.js";

const updateDb = async (
    interaction: CommandInteraction,
    channel: TextBasedChannel,
    mode: System,
    updateObj: {
        channelId: string;
        system: string;
        leagueName?: string;
        guildId?: string;
        resultsChannelId?: string;
        dlId?: string;
        sheetId?: string;
        rolesChannels?: {};
    }
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
        return await interaction.reply(
            `\`${league.name}\`'s mode has been changed to ${
                modes[mode] || "Default"
            } mode! ${
                modes[mode] === "Sheets"
                    ? "Please give full editing permissions to `master@porygonthebot.iam.gserviceaccount.com`; I won't be able to work without it."
                    : ""
            }`
        );
    } else {
        // Gives league a default name
        let leagueName = channel.id;
        updateObj.leagueName = leagueName;
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
                    ? "Please give full editing permissions to `master@porygonthebot.iam.gserviceaccount.com`; I won't be able to work without it."
                    : ""
            }`,
            ephemeral: true,
        });
    }
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

        if (author && !author.permissions.has("ManageRoles")) {
            return interaction.reply({
                content:
                    ":x: You're not a moderator. Ask a moderator to set the mode of this league for you.",
                ephemeral: true,
            });
        }

        let mode = options.getString("method") as System;
        let streamChannel = options.getChannel("channel");
        let sheetsID = "";
        let dlID = "";
        let rolesChannels = {} as { [key: string]: string };
        switch (mode) {
            case "C":
                if (!streamChannel) {
                    return interaction.reply(
                        ":x: You didn't link a valid channel. Please run the command again and link the channel you'd like the stats to be put in."
                    );
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
                    return interaction.reply(
                        ":x: This is not a Google Sheets link. Please copy-paste the URL of your Google Sheets file."
                    );
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
                    return interaction.reply(
                        ":x: This is not a valid draft-league.nl public URL."
                    );
                }

                let dlParams = new URLSearchParams(dlLink.split("?")[1]);
                let dlIDTemp = dlParams.get("league");
                if (!dlIDTemp)
                    return interaction.reply(":x: League ID not found.");
                dlID = dlIDTemp;

                const dlResponse = await axios.get(
                    `${process.env.DL_API_URL}/league/${dlID}?key=${process.env.DL_API_KEY}`,
                    {
                        headers: { "User-Agent": "PorygonTheBot" },
                    }
                );
                const dlData = dlResponse.data;
                if (!dlData.mod_discords.includes(`<@${author.id}>`)) {
                    return interaction.reply(
                        ":x: You're not a moderator on the website for the given league."
                    );
                }
                break;
            case "R":
                //TODO find a way to implement roles
                break;
            default:
                break;
        }

        await updateDb(interaction, channel, mode, {
            channelId: channel.id,
            system: mode,
            guildId: interaction.guild?.id,
            resultsChannelId: streamChannel?.id,
            dlId: dlID,
            sheetId: sheetsID,
            rolesChannels: rolesChannels,
        });
    },
};
