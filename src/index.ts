// Importing required modules
import * as dotenv from 'dotenv';
import axios from 'axios';
import { Message } from 'discord.js';
import { client, Prisma, ReplayTracker } from './utils';
// Setting things up
dotenv.config();

// Listening for interactions for slash commands
// client.ws.on('INTERACTION_CREATE' as WSEventType, async (interaction) => {
// 	const link = interaction.data.options[0].value + '.log';
// 	const response = await axios
// 		.get(link, {
// 			headers: { 'User-Agent': 'PorygonTheclient' },
// 		})
// 		.catch((e: Error) => console.error(e));
// 	let data;
// 	if (response) data = response.data;
// 	else
// 		return client.api.interactions(interaction.id, interaction.token).callback.post({
// 			data: {
// 				type: 4,
// 				data: {
// 					content: ':x: Replay is invalid. Please try again or use a different replay.',
// 				},
// 			},
// 		});

// 	//Getting the rules
// 	//let rulesId = await utils.findRulesId(interaction.channel_id);
// 	//let rules = await utils.getRules(rulesId);
// 	//rules.isSlash = true;

// 	const messagePlaceholder = {
// 		channel: {
// 			async send(message: Message) {
// 				return message;
// 			},
// 		},
// 	};

// 	//let replayer = new ReplayTracker(interaction.data.options[0].value, messagePlaceholder, rules, interaction);
// 	//await replayer.track(data, client);
// 	console.log(`${link} has been analyzed!`);
// });

// When the client boots up
client.on('ready', () => {
	console.log(`${client.user!.username} is online!`);
	client.user!.setActivity('f!hug me plz. I need it.');
});

//When a message is sent at any time
client.on('message', async (message: Message) => {
	const channel = message.channel;
	const msgStr = message.content;
	const prefix = 'porygon, use ';

	//If it's a DM, analyze the replay
	if (channel.type === 'dm') {
		if (msgStr.includes('replay.pokemonshowdown.com') && message.author.id !== client.user!.id) {
			const urlRegex = /(https?:\/\/[^ ]*)/;
			const links = msgStr.match(urlRegex);
			let link = '';
			if (links) link = links[0];

			let response = await axios
				.get(link + '.log', {
					headers: { 'User-Agent': 'PorygonTheBot' },
				})
				.catch((e) => console.error(e));
			let data = response?.data;

			//Getting the rules
			let rules = await Prisma.getRules(channel.id);

			//Analyzing the replay
			let replayer = new ReplayTracker(link, message, rules);
			const matchJson = await replayer.track(data);

			await channel.send(JSON.stringify(matchJson));
			console.log(`${link} has been analyzed!`);
		}
	}
});

// Log the client in.
client.login(process.env.TOKEN);
