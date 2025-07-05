import {
    CommandInteraction,
    PermissionResolvable,
    TextChannel,
    User,
} from "discord.js";
import { Stats } from "../types/index.js";
import { League } from "@prisma/client";
import Prisma from "./prisma.js";
import funcs from "./funcs.js";
import client from "./client.js";
import { google } from "googleapis";
//Message Generators
const genMessage = (matchJson: { [key: string]: any }) => {
    //retrieving info from the json object
    let psPlayer1 = matchJson.playerNames[0];
    let psPlayer2 = matchJson.playerNames[1];
    let killJson1 = matchJson.players[psPlayer1].kills;
    let deathJson1 = matchJson.players[psPlayer1].deaths;
    let killJson2 = matchJson.players[psPlayer2].kills;
    let deathJson2 = matchJson.players[psPlayer2].deaths;
    let combinePD = matchJson.info.rules.combine;

    let message1 = "";
    let message2 = "";

    //Drafting the message to be sent to the users\
    if (!combinePD) {
        for (let pokemon of Object.keys(killJson1)) {
            message1 += `${pokemon} has ${killJson1[pokemon].direct} direct kills, ${killJson1[pokemon].passive} passive kills, and ${deathJson1[pokemon]} deaths. \n`;
        }

        for (let pokemon of Object.keys(killJson2)) {
            message2 += `${pokemon} has ${killJson2[pokemon].direct} direct kills, ${killJson2[pokemon].passive} passive kills, and ${deathJson2[pokemon]} deaths. \n`;
        }
    } else {
        for (let pokemon of Object.keys(killJson1)) {
            message1 += `${pokemon} has ${
                killJson1[pokemon].direct + killJson1[pokemon].passive
            } kills and ${deathJson1[pokemon]} deaths. \n`;
        }

        for (let pokemon of Object.keys(killJson2)) {
            message2 += `${pokemon} has ${
                killJson2[pokemon].direct + killJson2[pokemon].passive
            } kills and ${deathJson2[pokemon]} deaths. \n`;
        }
    }

    return [message1, message2];
};
const genCSV = (matchJson: { [key: string]: any }) => {
    //retrieving info from the json object
    let psPlayer1 = matchJson.playerNames[0];
    let psPlayer2 = matchJson.playerNames[1];
    let killJson1 = matchJson.players[psPlayer1].kills;
    let deathJson1 = matchJson.players[psPlayer1].deaths;
    let killJson2 = matchJson.players[psPlayer2].kills;
    let deathJson2 = matchJson.players[psPlayer2].deaths;
    let combinePD = matchJson.info.rules.combine;

    let message1 = "";
    let message2 = "";

    //Drafting the message to be sent to the users\
    if (!combinePD) {
        for (let pokemon of Object.keys(killJson1)) {
            message1 += `${pokemon},${killJson1[pokemon].direct},${killJson1[pokemon].passive},${deathJson1[pokemon]}\n`;
        }

        for (let pokemon of Object.keys(killJson2)) {
            message2 += `${pokemon},${killJson2[pokemon].direct},${killJson2[pokemon].passive},${deathJson2[pokemon]}\n`;
        }
    } else {
        for (let pokemon of Object.keys(killJson1)) {
            message1 += `${pokemon},${
                killJson1[pokemon].direct + killJson1[pokemon].passive
            },${deathJson1[pokemon]}\n`;
        }

        for (let pokemon of Object.keys(killJson2)) {
            message2 += `${pokemon},${
                killJson2[pokemon].direct + killJson2[pokemon].passive
            },${deathJson2[pokemon]}\n`;
        }
    }

    return [message1, message2];
};
const genTour = (matchJson: { [key: string]: any }) => {
    //retrieving info from the json object
    let psPlayer1 = matchJson.playerNames[0];
    let psPlayer2 = matchJson.playerNames[1];
    let killJson1 = matchJson.players[psPlayer1].kills;
    let deathJson1 = matchJson.players[psPlayer1].deaths;
    let killJson2 = matchJson.players[psPlayer2].kills;
    let deathJson2 = matchJson.players[psPlayer2].deaths;
    let combinePD = matchJson.info.rules.combine;

    let message1 = "";

    //Drafting the message to be sent to the users\
    if (!combinePD) {
        for (let pokemon of Object.keys(killJson1)) {
            message1 += `${pokemon},${killJson1[pokemon].direct},${killJson1[pokemon].passive},${deathJson1[pokemon]}\n`;
        }

        for (let pokemon of Object.keys(killJson2)) {
            message1 += `${pokemon},${killJson2[pokemon].direct},${killJson2[pokemon].passive},${deathJson2[pokemon]}\n`;
        }
    } else {
        for (let pokemon of Object.keys(killJson1)) {
            message1 += `${pokemon},${
                killJson1[pokemon].direct + killJson1[pokemon].passive
            },${deathJson1[pokemon]}\n`;
        }

        for (let pokemon of Object.keys(killJson2)) {
            message1 += `${pokemon},${
                killJson2[pokemon].direct + killJson2[pokemon].passive
            },${deathJson2[pokemon]}\n`;
        }
    }

    return [message1, ""];
};
const genSheets = (matchJson: { [key: string]: any }) => {
    //retrieving info from the json object
    let psPlayer1 = matchJson.playerNames[0];
    let psPlayer2 = matchJson.playerNames[1];
    let killJson1 = matchJson.players[psPlayer1].kills;
    let deathJson1 = matchJson.players[psPlayer1].deaths;
    let killJson2 = matchJson.players[psPlayer2].kills;
    let deathJson2 = matchJson.players[psPlayer2].deaths;
    let combinePD = matchJson.info.rules.combine;

    let message1 = "";
    let message2 = "";

    //Drafting the message to be sent to the users\
    if (!combinePD) {
        for (let pokemon of Object.keys(killJson1)) {
            message1 += `${pokemon} ${killJson1[pokemon].direct} ${killJson1[pokemon].passive} ${deathJson1[pokemon]}\n`;
        }

        for (let pokemon of Object.keys(killJson2)) {
            message2 += `${pokemon} ${killJson2[pokemon].direct} ${killJson2[pokemon].passive} ${deathJson2[pokemon]}\n`;
        }
    } else {
        for (let pokemon of Object.keys(killJson1)) {
            message1 += `${pokemon} ${
                killJson1[pokemon].direct + killJson1[pokemon].passive
            } ${deathJson1[pokemon]}\n`;
        }

        for (let pokemon of Object.keys(killJson2)) {
            message2 += `${pokemon} ${
                killJson2[pokemon].direct + killJson2[pokemon].passive
            } ${deathJson2[pokemon]}\n`;
        }
    }

    return [message1, message2];
};
const genAppend = (matchJson: { [key: string]: any }, league: League) => {
    //retrieving info from the json object
    let info = matchJson.info;
    let player1 = Object.keys(matchJson.players)[0];
    let player2 = Object.keys(matchJson.players)[1];
    let killJson1 = matchJson.players[player1].kills;
    let deathJson1 = matchJson.players[player1].deaths;
    let killJson2 = matchJson.players[player2].kills;
    let deathJson2 = matchJson.players[player2].deaths;

    //To generate the giant list of values
    let values = [];
    //Team 1
    for (let i = 0; i < 6; i++) {
        let pokemon = Object.keys(killJson1)[i] || "";
        values.push(
            pokemon,
            pokemon ? killJson1[pokemon].direct : "",
            pokemon ? killJson1[pokemon].passive : "",
            pokemon ? deathJson1[pokemon] : ""
        );
    }
    //Team 2
    for (let i = 0; i < 6; i++) {
        let pokemon = Object.keys(killJson2)[i] || "";
        values.push(
            pokemon,
            pokemon ? killJson2[pokemon].direct : "",
            pokemon ? killJson2[pokemon].passive : "",
            pokemon ? deathJson2[pokemon] : ""
        );
    }

    return {
        spreadsheetId: league.sheetId,
        range: `'Raw Stats'!A2:BA2`,
        responseValueRenderOption: "FORMATTED_VALUE",
        valueInputOption: "USER_ENTERED",
        resource: {
            range: `'Raw Stats'!A2:BA2`,
            values: [
                [
                    player1,
                    player2,
                    info.winner,
                    ...values,
                    info.replay,
                    info.turns,
                ],
            ],
        },
    };
};

//Updaters
const discordUpdate = async (
    matchJson: Stats,
    channel: TextChannel,
    league: League | null,
    author: User
) => {
    let info = matchJson.info;
    let system = league?.system || "D";
    let channelId = league ? league.resultsChannelId : channel.id;

    let messages = [];
    if (info.rules?.format === "CSV") messages = genCSV(matchJson);
    else if (info.rules?.format === "SPACE") messages = genSheets(matchJson);
    else if (info.rules?.format === "TOUR") messages = genTour(matchJson);
    else messages = genMessage(matchJson);

    let psPlayer1 = matchJson.playerNames[0];
    let psPlayer2 = matchJson.playerNames[1];
    let message1 = messages[0];
    let message2 = messages[1];

    let finalMessage = "";

    //finally sending players the info
    if (info.rules.format === "TOUR") {
        if (info.rules.spoiler) finalMessage = `||${message1}||`;
        else finalMessage = message1;
    } else {
        if (info.rules.spoiler)
            finalMessage = `**${psPlayer1}**: ||\n${message1}|| \n**${psPlayer2}**: ||\n${message2}||`;
        else
            finalMessage = `**${psPlayer1}**: \n${message1} \n**${psPlayer2}**: \n${message2}`;
    }

    if (info.rules.tb) {
        finalMessage = `**Result:** ${
            info.rules.spoiler ? `|| ${info.result}||` : info.result
        }\n\n${finalMessage}\n**Replay: **<${info.replay}>\n**History: **${
            info.history
        }`;
    }

    if (!client.user) {
        console.log("what the hell is going on");
        return;
    }

    if (system === "DM") await author.send(finalMessage);
    else if (system === "C" && channelId && channel.guild) {
        let streamChannel = funcs.getChannel(channel.guild, channelId);

        if (!streamChannel)
            return await channel.send(
                ":x: Something went wrong with the channel you provided. Please check if it exists and try running the mode command again to re-set up the bot."
            );

        const botGuildMember = await streamChannel.guild.members.fetch(
            client.user.id
        );

        if (
            !streamChannel.isDMBased() &&
            !streamChannel
                .permissionsFor(botGuildMember)
                ?.has("ViewChannel") &&
            !streamChannel
                .permissionsFor(botGuildMember)
                ?.has("SendMessages")
        ) {
            return await channel.send(
                `:x: I do not have permission to send messages in ${streamChannel.name}.`
            );
        }

        if (streamChannel.isTextBased())
            return await streamChannel.send(finalMessage);
    } else {
        //If notalk is enabled, it just DM's the author
        if (!info.rules.notalk) {
            if (!channel.permissionsFor(client.user)?.has("SendMessages")) {
                return await channel.send(
                    ":x: I do not have permission to send messages in this channel."
                );
            }

            if (channel.isTextBased()) return await channel.send(finalMessage);
        } else
            return await author.send(
                '***_Porygon doesn\'t have "Send Messages" permissions in the live links channel. Please give it those permissions and set the "notalk" rule to "true" in the channel._***\n\n' +
                    finalMessage
            );
    }
};
const sheetsUpdate = async (
    matchJson: Stats,
    channel: TextChannel,
    league: League,
    author: User
) => {
    //Sheets authentication
    const creds = process.env.GOOGLE_SERVICE_ACCOUNT;
    const serviceAuth = new google.auth.GoogleAuth({
        credentials: JSON.parse(creds as string),
        scopes: [
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/spreadsheets",
        ],
    });
    google.options({ auth: serviceAuth });
    const drive = google.drive({
        version: "v3",
        auth: serviceAuth,
    });
    const sheets = google.sheets({
        version: "v4",
        auth: serviceAuth,
    });

    let psPlayer1 = matchJson.playerNames[0];
    let psPlayer2 = matchJson.playerNames[1];
    let info = matchJson.info;
    const final = genAppend(matchJson, league);

    // Check if I have editing permissions first
    const permissionResponse = await drive.files.get({
        fileId: final.spreadsheetId || "",
        fields: "capabilities(canEdit)",
    });

    if (
        permissionResponse.data.capabilities &&
        !permissionResponse.data.capabilities.canEdit
    ) {
        return channel.send(
            ":x: I do not have permission to edit the file you provided. If you want me to automatically update your sheet, please give full editing permissions to `master@porygonthebot.iam.gserviceaccount.com`."
        );
    }

    let res = await sheets.spreadsheets.values
        .append(final as any)
        .catch((e) => {
            if (e.code === 400 && e.message.includes("Unable to parse range")) {
                return channel.send(
                    ":x: Please add a tab called `Raw Stats` to your sheet. That is where I will put the stats."
                );
            } else {
                console.error(e);
            }
        });

    if (info.rules.redirect && league) {
        league.resultsChannelId = info.rules.redirect;
        league.system = "C";
        await discordUpdate(matchJson, channel, league, author);
    } else {
        return channel.send(
            `Battle between \`${psPlayer1}\` and \`${psPlayer2}\` is complete and info has been updated!\n**Replay:** ${matchJson.info.replay}\n**History:** ${matchJson.info.history}`
        );
    }
};

const roleUpdate = async (
    matchJson: Stats,
    channel: TextChannel,
    league: League,
    author: User
) => {
    let info = matchJson.info;

    try {
        channel.guild.roles.cache.forEach((role) => {
            if (
                league.rolesChannels &&
                Object.keys(
                    JSON.parse(JSON.stringify(league.rolesChannels))
                ).includes(role.id)
            ) {
                const channelId = JSON.parse(
                    JSON.stringify(league.rolesChannels)
                )[role.id];

                let messages = [];
                if (info.rules?.format === "CSV") messages = genCSV(matchJson);
                else if (info.rules?.format === "SPACE")
                    messages = genSheets(matchJson);
                else if (info.rules?.format === "TOUR")
                    messages = genTour(matchJson);
                else messages = genMessage(matchJson);

                let psPlayer1 = matchJson.playerNames[0];
                let psPlayer2 = matchJson.playerNames[1];
                let message1 = messages[0];
                let message2 = messages[1];

                let finalMessage = "";

                //finally sending players the info
                if (info.rules?.format === "TOUR") {
                    if (info.rules.spoiler) finalMessage = `||${message1}||`;
                    else finalMessage = message1;
                } else {
                    if (info.rules.spoiler)
                        finalMessage = `**${psPlayer1}**: ||\n${message1}|| \n**${psPlayer2}**: ||\n${message2}||`;
                    else
                        finalMessage = `**${psPlayer1}**: \n${message1} \n**${psPlayer2}**: \n${message2}`;
                }

                if (info.rules.tb) {
                    finalMessage = `**Result:** ${
                        info.rules.spoiler ? `|| ${info.result}||` : info.result
                    }\n\n${finalMessage}\n**Replay: **<${
                        info.replay
                    }>\n**History: **${info.history}`;
                }

                if (channelId && channel.guild) {
                    return channel.send(finalMessage);
                }
            }
        });
    } catch (e: any) {
        console.error(e);
        await channel.send(
            `There was an error trying to update \`${matchJson.info.battleId}\`!\n\n\`\`\`${e.stack}\`\`\`\n Use these stats instead.`
        );
        //Send the stats
        league.system = "D";
        discordUpdate(matchJson, channel, league, author);
    }
};
const slashAnalyzeUpdate = async (
    matchJson: Stats,
    interaction: CommandInteraction
) => {
    let info = matchJson.info;

    let messages = [];
    if (info.rules?.format === "CSV") messages = genCSV(matchJson);
    else if (info.rules?.format === "SPACE") messages = genSheets(matchJson);
    else if (info.rules?.format === "TOUR") messages = genTour(matchJson);
    else messages = genMessage(matchJson);

    let psPlayer1 = matchJson.playerNames[0];
    let psPlayer2 = matchJson.playerNames[1];
    let message1 = messages[0];
    let message2 = messages[1];

    let finalMessage = "";

    //finally sending players the info
    if (info.rules.format === "TOUR") {
        if (info.rules.spoiler) finalMessage = `||${message1}||`;
        else finalMessage = message1;
    } else {
        if (info.rules.spoiler)
            finalMessage = `**${psPlayer1}**: ||\n${message1}|| \n**${psPlayer2}**: ||\n${message2}||`;
        else
            finalMessage = `**${psPlayer1}**: \n${message1} \n**${psPlayer2}**: \n${message2}`;
    }

    if (info.rules.tb) {
        finalMessage = `**Result:** ${
            info.rules.spoiler ? `|| ${info.result}||` : info.result
        }\n\n${finalMessage}\n**Replay: **<${info.replay}>\n**History: **${
            info.history
        }`;
    }

    // if (info.rules.redirect) {
    //     league.resultsChannelId = info.rules.redirect.substring(
    //         2,
    //         info.rules.redirect.length - 1
    //     );
    //     league.system = "C";
    //     league.resultsChannelId = info.rules.redirect.substring(
    //         2,
    //         info.rules.redirect.length - 1
    //     );
    //     discordUpdate(matchJson, message, league);
    // }

    if (interaction.deferred || interaction.replied)
        return await interaction.editReply(finalMessage);

    return await interaction.reply(finalMessage);
};
const update = async (matchJson: Stats, channel: TextChannel, author: User) => {
    const league = await Prisma.getLeague(channel.id);
    let system = league?.system;

    if (matchJson.error) return await channel.send(matchJson.error);

    try {
        if (league) {
            if (system === "S")
                return await sheetsUpdate(matchJson, channel, league, author);
            else if (system === "R")
                return await roleUpdate(matchJson, channel, league, author);
            else return await discordUpdate(matchJson, channel, league, author);
        } else return await discordUpdate(matchJson, channel, league, author);
    } catch (e: any) {
        console.error(e);
        return await channel.send(
            `There was an error trying to update this match!\n\n\`\`\`${e.stack}\`\`\``
        );
    }
};

export { update, slashAnalyzeUpdate };
