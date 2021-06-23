import { League } from "@prisma/client";
import { Message } from "discord.js";
import { Stats } from "../types";
import Prisma from "./prisma";
import { funcs } from "./track";

//Message Generators
const genMessage = (matchJson: { [key: string]: any }) => {
	//retrieving info from the json object
	let psPlayer1 = Object.keys(matchJson.players)[0];
	let psPlayer2 = Object.keys(matchJson.players)[1];
	let killJson1 = matchJson.players[psPlayer1].kills;
	let deathJson1 = matchJson.players[psPlayer1].deaths;
	let killJson2 = matchJson.players[psPlayer2].kills;
	let deathJson2 = matchJson.players[psPlayer2].deaths;
	let combinePD = matchJson.combinePD;

	// console.log(matchJson.players[psPlayer1]);
	// console.log(matchJson.players[psPlayer2]);

	let message1 = '';
	let message2 = '';

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
			message1 += `${pokemon} has ${killJson1[pokemon].direct + killJson1[pokemon].passive} kills and ${
				deathJson1[pokemon]
			} deaths. \n`;
		}

		for (let pokemon of Object.keys(killJson2)) {
			message2 += `${pokemon} has ${killJson2[pokemon].direct + killJson2[pokemon].passive} kills and ${
				deathJson2[pokemon]
			} deaths. \n`;
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
	let combinePD = matchJson.combinePD;

	let message1 = '';
	let message2 = '';

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
			message1 += `${pokemon},${killJson1[pokemon].direct + killJson1[pokemon].passive},${deathJson1[pokemon]}\n`;
		}

		for (let pokemon of Object.keys(killJson2)) {
			message2 += `${pokemon},${killJson2[pokemon].direct + killJson2[pokemon].passive},${deathJson2[pokemon]}\n`;
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
	let combinePD = matchJson.combinePD;

	let message1 = '';

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
			message1 += `${pokemon},${killJson1[pokemon].direct + killJson1[pokemon].passive},${deathJson1[pokemon]}\n`;
		}

		for (let pokemon of Object.keys(killJson2)) {
			message1 += `${pokemon},${killJson2[pokemon].direct + killJson2[pokemon].passive},${deathJson2[pokemon]}\n`;
		}
	}

	return [message1, ''];
};
const genSheets = (matchJson: { [key: string]: any }) => {
	//retrieving info from the json object
	let psPlayer1 = Object.keys(matchJson.players)[0];
	let psPlayer2 = Object.keys(matchJson.players)[1];
	let killJson1 = matchJson.players[psPlayer1].kills;
	let deathJson1 = matchJson.players[psPlayer1].deaths;
	let killJson2 = matchJson.players[psPlayer2].kills;
	let deathJson2 = matchJson.players[psPlayer2].deaths;
	let combinePD = matchJson.combinePD;

	let message1 = '';
	let message2 = '';

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
			message1 += `${pokemon} ${killJson1[pokemon].direct + killJson1[pokemon].passive} ${deathJson1[pokemon]}\n`;
		}

		for (let pokemon of Object.keys(killJson2)) {
			message2 += `${pokemon} ${killJson2[pokemon].direct + killJson2[pokemon].passive} ${deathJson2[pokemon]}\n`;
		}
	}

	return [message1, message2];
};
const genAppend = (matchJson: { [key: string]: any }) => {
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
		let pokemon = Object.keys(killJson1)[i] || '';
		values.push(
			pokemon,
			pokemon ? killJson1[pokemon].direct : '',
			pokemon ? killJson1[pokemon].passive : '',
			pokemon ? deathJson1[pokemon] : ''
		);
	}
	//Team 2
	for (let i = 0; i < 6; i++) {
		let pokemon = Object.keys(killJson2)[i] || '';
		values.push(
			pokemon,
			pokemon ? killJson2[pokemon].direct : '',
			pokemon ? killJson2[pokemon].passive : '',
			pokemon ? deathJson2[pokemon] : ''
		);
	}

	return {
		spreadsheetId: matchJson.sheetId,
		range: `'Raw Stats'!A2:BA2`,
		responseValueRenderOption: 'FORMATTED_VALUE',
		valueInputOption: 'USER_ENTERED',
		resource: {
			range: `'Raw Stats'!A2:BA2`,
			values: [[player1, player2, info.winner, ...values, info.replay, info.turns]],
		},
	};
};

//Updaters
const discordUpdate = async (matchJson: Stats, message: Message, league?: League | null) => {
    let info = matchJson.info;
    let system = league?.system
    let channelId = league?.resultsChannelId;

    let messages = [];
    if (info.rules.format === "Csv")
        messages = genCSV(matchJson);
    else if (info.rules.format === "Sheets")
        messages = genSheets(matchJson);
    else if (info.rules.format === "Tour")
        messages = genTour(matchJson);
    else
        messages = genMessage(matchJson);

    let psPlayer1 = Object.keys(matchJson.players)[0];
    let psPlayer2 = Object.keys(matchJson.players)[1];
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

    if (system === 'DM')
        await message.author.send(finalMessage);
    else if (system === 'C' && channelId && message.guild) {
        const channel = funcs.getChannel(message.guild, channelId);
        if (channel?.isText()) //Checking if it's a text channel instead of a voice channel
            await channel?.send(finalMessage);
    }
    else {
        await message.channel.send(finalMessage);
    }
}
const sheetsUpdate = async (matchJson: Stats, message: Message, league?: League | null) => {

}
const dlUpdate = async (matchJson: Stats, message: Message, league?: League | null) => {

}
const update = async (matchJson: Stats, message: Message) => {
    const league = await Prisma.getLeague(message.channel.id);
    let system = league?.system

    if (system === 'S')
        await sheetsUpdate(matchJson, message, league);
    else if (system === 'DL')
        await dlUpdate(matchJson, message, league);
    else
        await discordUpdate(matchJson, message, league);
}

export default update;