// Importing required modules
import * as dotenv from 'dotenv';
import axios from 'axios';
import { Message } from 'discord.js';
import { client, Prisma, ReplayTracker, LiveTracker, sockets, funcs, consts } from './utils';
import { Battle } from './types';
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
			let replayer = new ReplayTracker(link, rules);
			const matchJson = await replayer.track(data);

			await channel.send(JSON.stringify(matchJson));
			console.log(`${link} has been analyzed!`);
		}
	}

	//If it's sent in a validly-named live links channel, join the battle
	else if (channel.name.includes('live-links') || channel.name.includes('live-battles')) {
		try {
			//Extracting battlelink from the message
			const urlRegex = /(https?:\/\/[^ ]*)/;
			const links = msgStr.match(urlRegex);
			let battlelink = '';
			if (links) battlelink = links[0];
			let battleId = battlelink && battlelink.split('/')[3];

			if (Battle.battles.includes(battleId)) {
				return channel.send(
					`:x: I'm already tracking this battle. If you think this is incorrect, send a replay of this match in the #bugs-and-help channel in the Porygon server.`
				);
			}

			if (
				battlelink &&
				!(
					battlelink.includes('google') ||
					battlelink.includes('replay') ||
					battlelink.includes('draft-league.nl') ||
					battlelink.includes('porygonbot.xyz')
				)
			) {
				console.log('hi 1');
				let server = Object.values(sockets).filter((socket) => battlelink.startsWith(socket.link))[0];
				if (!server) {
					return channel.send('This link is not a valid Pokemon Showdown battle url.');
				}
				console.log('hi 2');

				//Getting the rules
				let rules = await Prisma.getRules(channel.id);

				if (!rules.stopTalking) await channel.send('Joining the battle...').catch((e) => console.error(e));

				Battle.incrementBattles(battleId);
				client.user!.setActivity(`${Battle.numBattles} PS Battles in ${client.guilds.cache.size} servers.`, {
					type: 'WATCHING',
				});
				const tracker = new LiveTracker(battleId, server.name, rules, server.socket);
				console.log('hi 3');

				server.socket.send(`|/join ${battleId}`);
				if (!rules.stopTalking)
					await message.channel.send(`Battle joined! Keeping track of stats now. ${rules.ping}`);
				console.log('hi 4');

				console.log('hi 5');
				server.socket.send(
					`${battleId}|${
						rules.quirks
							? funcs.randomElement(consts.quirkyMessages.start)
							: 'Battled joined! Keeping track of stats now.'
					}`
				);
				console.log('hi 6');

				//Websocket tracking time!
				console.log('hi 7');
				server.socket.on('message', tracker.track);
				console.log('hi 8');
			}
		} catch (e) {
			console.error(e);
		}
	}
});

// Log the client in.
client.login(process.env.TOKEN);
