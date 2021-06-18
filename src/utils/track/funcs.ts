import { Guild } from 'discord.js';

const getChannel = (server: Guild, channelID: string) => {
	return server.channels.cache.get(channelID);
};

const genMessage = (matchJson: {[key: string]: any}) => {
	//retrieving info from the json object
	let psPlayer1 = Object.keys(matchJson.players)[0];
	let psPlayer2 = Object.keys(matchJson.players)[1];
	let killJson1 = matchJson.players[psPlayer1].kills;
	let deathJson1 = matchJson.players[psPlayer1].deaths;
	let killJson2 = matchJson.players[psPlayer2].kills;
	let deathJson2 = matchJson.players[psPlayer2].deaths;
	let combinePD = matchJson.combinePD;

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

const genCSV = (matchJson: {[key: string]: any}) => {
	//retrieving info from the json object
	let psPlayer1 = Object.keys(matchJson.players)[0];
	let psPlayer2 = Object.keys(matchJson.players)[1];
	let killJson1 = matchJson.players[psPlayer1].kills;
	let deathJson1 = matchJson.players[psPlayer1].deaths;
	let killJson2 = matchJson.players[psPlayer2].kills;
	let deathJson2 = matchJson.players[psPlayer2].deaths;
	let combinePD = matchJson.combinePD;

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

const genTour = (matchJson: {[key: string]: any}) => {
	//retrieving info from the json object
	let psPlayer1 = Object.keys(matchJson.players)[0];
	let psPlayer2 = Object.keys(matchJson.players)[1];
	let killJson1 = matchJson.players[psPlayer1].kills;
	let deathJson1 = matchJson.players[psPlayer1].deaths;
	let killJson2 = matchJson.players[psPlayer2].kills;
	let deathJson2 = matchJson.players[psPlayer2].deaths;
	let combinePD = matchJson.combinePD;

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

const genSheets = (matchJson: {[key: string]: any}) => {
	//retrieving info from the json object
	let psPlayer1 = Object.keys(matchJson.players)[0];
	let psPlayer2 = Object.keys(matchJson.players)[1];
	let killJson1 = matchJson.players[psPlayer1].kills;
	let deathJson1 = matchJson.players[psPlayer1].deaths;
	let killJson2 = matchJson.players[psPlayer2].kills;
	let deathJson2 = matchJson.players[psPlayer2].deaths;
	let combinePD = matchJson.combinePD;

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

const genAppend = (matchJson: {[key: string]: any}) => {
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
		spreadsheetId: matchJson.sheetId,
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

const funcs = {
    getChannel,
    genMessage,
    genCSV,
    genTour,
    genSheets,
    genAppend
}

export default funcs;