import { google } from "googleapis";
import { League } from "@prisma/client";
import { Message } from "discord.js";
import { Stats } from "../types";
import Prisma from "./prisma";
import { funcs } from "./track";
import axios from "axios";

//Message Generators
const genMessage = (matchJson: { [key: string]: any }) => {
    //retrieving info from the json object
    let psPlayer1 = Object.keys(matchJson.players)[0];
    let psPlayer2 = Object.keys(matchJson.players)[1];
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
    let psPlayer1 = Object.keys(matchJson.players)[0];
    let psPlayer2 = Object.keys(matchJson.players)[1];
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
    let psPlayer1 = Object.keys(matchJson.players)[0];
    let psPlayer2 = Object.keys(matchJson.players)[1];
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
    let psPlayer1 = Object.keys(matchJson.players)[0];
    let psPlayer2 = Object.keys(matchJson.players)[1];
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
    message: Message,
    league: League | null
) => {
    let info = matchJson.info;
    let system = league?.system || 'D';
    let channelId = league?.resultsChannelId;

    let messages = [];
    if (info.rules?.format === "CSV") messages = genCSV(matchJson);
    else if (info.rules?.format === "SPACE") messages = genSheets(matchJson);
    else if (info.rules?.format === "TOUR") messages = genTour(matchJson);
    else messages = genMessage(matchJson);

    console.log(matchJson);

    let psPlayer1 = matchJson.playerNames[0];
    let psPlayer2 = matchJson.playerNames[1];
    let message1 = messages[0];
    let message2 = messages[1];

    let finalMessage = "";

    //finally sending players the info
    if (info.rules.format === "Tour") {
        if (info.rules.spoiler) finalMessage = `||${message1}||`;
        else finalMessage = message1;
    } else {
        if (info.rules.spoiler)
            finalMessage = `||**${psPlayer1}**: \n${message1}|| \n||**${psPlayer2}**: \n${message2}||`;
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

    if (system === "DM") await message.author.send(finalMessage);
    else if (system === "C" && channelId && message.guild) {
        const channel = funcs.getChannel(message.guild, channelId);
        if (channel?.isText())
            //Checking if it's a text channel instead of a voice channel
            await channel?.send(finalMessage);
    } else {
        await message.channel.send(finalMessage);
    }
};
const sheetsUpdate = async (
    matchJson: Stats,
    message: Message,
    league: League
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
    let sheets = google.sheets({
        version: "v4",
        auth: serviceAuth,
    });

    let psPlayer1 = matchJson.playerNames[0];
    let psPlayer2 = matchJson.playerNames[1];
    let info = matchJson.info;
    const final = genAppend(matchJson, league);

    let res = await sheets.spreadsheets.values
        .append(final as any)
        .catch((e: Error) => {
            message.channel.send(
                ":x: I do not have permission to edit the file you provided. If you want me to automatically update your sheet, please give full editing permissions to `master@porygonthebot.iam.gserviceaccount.com`."
            );
            console.error(e);
        });

    if (info.rules.redirect && league) {
        league.resultsChannelId = info.rules.redirect.substring(
            2,
            info.rules.redirect.length - 1
        );
        league.system = "C";
        league.resultsChannelId = info.rules.redirect.substring(2, info.rules.redirect.length - 1);
        await discordUpdate(matchJson, message, league);
    } else {
        message.channel.send(
            `Battle between \`${psPlayer1}\` and \`${psPlayer2}\` is complete and info has been updated!\n**Replay:** ${matchJson.info.replay}\n**History:** ${matchJson.info.history}`
        );
    }
};
const dlUpdate = async (matchJson: Stats, message: Message, league: League) => {
    let psPlayer1 = matchJson.playerNames[0];
    let psPlayer2 = matchJson.playerNames[1];
    let info = matchJson.info;

    try {
        //Getting league data
        const leagueResponse = await axios.get(
            `${process.env.DL_API_URL}/league/${league.dlId}?key=${process.env.DL_API_KEY}`,
            {
                headers: { "User-Agent": "PorygonTheBot" },
            }
        );
        const leagueData = leagueResponse.data;
        console.log("League recieved.");

        //Getting the Discord user player from their Discord ID
        const authorID = message.author.id;
        const playerResponse = await axios.get(
            `${process.env.DL_API_URL}/league/${league.dlId}/player/<@${authorID}>?key=${process.env.DL_API_KEY}`,
            {
                headers: { "User-Agent": "PorygonTheBot" },
            }
        );
        const discordPlayerData = playerResponse.data;
        //Check which player the Discord user is.
        const discordUserPS = Object.keys(
            matchJson.players[psPlayer1].kills
        ).some((item) => discordPlayerData.pokemon.includes(item))
            ? psPlayer1
            : psPlayer2;
        const nonDiscordUserPS =
            discordUserPS === Object.keys(matchJson.players)[0]
                ? Object.keys(matchJson.players)[1]
                : Object.keys(matchJson.players)[0];

        //Getting the Match ID based on opponent's pokemon
        const matchURL = `${process.env.DL_API_URL}/league/${
            league.dlId
        }/player/<@${authorID}>?pokemon=${Object.keys(
            matchJson.players[nonDiscordUserPS].kills
        )
            .join(",")
            .replace("’", "")}&key=${process.env.DL_API_KEY}`;
        const matchResponse = await axios.get(matchURL, {
            headers: { "User-Agent": "PorygonTheBot" },
        });
        const matchData = matchResponse.data;

        matchJson.players[discordUserPS].league_id = discordPlayerData.id;
        matchJson.players[nonDiscordUserPS].league_id = matchData.opponent;

        const final = {
            ...matchJson,
            ...matchData,
            discord_user: discordUserPS,
            headers: { "User-Agent": "PorygonTheBot" },
        };

        //Making the submission
        const submissionResponse = await axios.post(
            `${process.env.DL_API_URL}/submission?key=${process.env.DL_API_KEY}`,
            final
        );

        //Posting to the replay webhook
        let result = matchJson.info.result
            .toLowerCase()
            .startsWith(discordUserPS)
            ? matchJson.info.result.substring(matchJson.info.result.length - 3)
            : `${matchJson.info.result.substring(
                  matchJson.info.result.length - 1
              )}-${matchJson.info.result.substring(
                  matchJson.info.result.length - 3,
                  matchJson.info.result.length - 2
              )}`;
        await axios.post(leagueData.replay_webhook, {
            content: `A match in the ${leagueData.league_name} between the ${discordPlayerData.team_name} and the ${matchData.opponent_team_name} has just been submitted by Porygon Automatic Import.\nReplay: <${matchJson.info.replay}>\nResult: ||${result}||`,
        });
        if (info.rules.redirect) {
            league.resultsChannelId = info.rules.redirect.substring(
                2,
                info.rules.redirect.length - 1
            );
            league.system = "C";
            league.resultsChannelId = info.rules.redirect.substring(2, info.rules.redirect.length - 1);
            discordUpdate(matchJson, message, league);
        } else {
            await message.channel.send(
                `Battle between \`${psPlayer1}\` and \`${psPlayer2}\` is complete and info has been updated!`
            );
        }
    } catch (e) {
        await message.channel.send(
            `:x: Error with match number \`${
                matchJson.info.battleId
            }\`. I will be unable to analyze this match until you screenshot this message and send it to the Porygon server's bugs-and-help channel and ping harbar20 in the same channel.\n\n**Error:**\`\`\`${JSON.stringify(
                e.response.data
            )}\nLine number: ${
                e.stack.split(":")[2]
            }\`\`\`\nPlease paste these stats instead: `
        );
        console.error(e);
        //Send the stats
        league.system = "D";
        discordUpdate(matchJson, message, league);
    }
};
const update = async (matchJson: Stats, message: Message) => {
    const league = await Prisma.getLeague(message.channel.id);
    let system = league?.system;

    if (league) {
        if (system === "S") await sheetsUpdate(matchJson, message, league);
        else if (system === "DL") await dlUpdate(matchJson, message, league);
        else await discordUpdate(matchJson, message, league);
    } else await discordUpdate(matchJson, message, league);
};

export default update;
