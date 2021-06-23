// Importing required modules
import * as dotenv from 'dotenv';
import axios from 'axios';
import querystring from 'querystring';
import WebSocket from 'ws';
import { Message } from 'discord.js';
import { client, Prisma, ReplayTracker, LiveTracker, funcs, consts, sockets } from './utils';
import { Battle, Socket, Stats } from './types';
// Setting things up
dotenv.config();

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
			//Extracting URL
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
				let server = Object.values(sockets).filter((socket) => battlelink.startsWith(socket.link))[0];
				if (!server) {
					return channel.send('This link is not a valid Pokemon Showdown battle url.');
				}

				//Getting the rules
				let rules = await Prisma.getRules(channel.id);

				if (!rules.stopTalking) await channel.send('Joining the battle...').catch((e) => console.error(e));

				Battle.incrementBattles(battleId);
				client.user!.setActivity(`${Battle.numBattles} PS Battles in ${client.guilds.cache.size} servers.`, {
					type: 'WATCHING',
				});
				let tracker = new LiveTracker(battleId, server.name, rules, message);
				await tracker.track();
			}
		} catch (e) {
			console.error(e);
		}
	}
});

// Log the client in.
client.login(process.env.TOKEN);
