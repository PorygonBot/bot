// Importing required modules
import * as dotenv from 'dotenv';
import axios from 'axios';
import querystring from 'querystring';
import WebSocket from 'ws';
import { Message } from 'discord.js';
import { client, Prisma, ReplayTracker, LiveTracker, funcs, consts } from './utils';
import { Battle, Socket } from './types';
// Setting things up
dotenv.config();
const sockets: { [key: string]: Socket } = {
	showdown: {
		name: 'Showdown',
		link: 'https://play.pokemonshowdown.com',
		ip: 'sim3.psim.us:8000',
		server: 'ws://sim3.psim.us:8000/showdown/websocket',
		socket: new WebSocket('ws://sim3.psim.us:8000/showdown/websocket'),
	},
	sports: {
		name: 'Sports',
		link: 'http://sports.psim.us',
		ip: '34.222.148.43:8000',
		server: 'ws://34.222.148.43:8000/showdown/websocket',
		socket: new WebSocket('ws://34.222.148.43:8000/showdown/websocket'),
	},
	automatthic: {
		name: 'Automatthic',
		link: 'http://automatthic.psim.us',
		ip: '185.224.89.75:8000',
		server: 'ws://34.222.148.43:8000/showdown/websocket',
		socket: new WebSocket('ws://34.222.148.43:8000/showdown/websocket'),
	},
	dawn: {
		name: 'Dawn',
		link: 'http://dawn.psim.us',
		ip: 'oppai.azure.lol:80',
		server: 'ws://oppai.azure.lol:80/showdown/websocket',
		socket: new WebSocket('ws://oppai.azure.lol:80/showdown/websocket'),
	},
	drafthub: {
		name: 'Drafthub',
		link: 'http://drafthub.psim.us',
		ip: '128.199.170.203:8000',
		server: 'ws://128.199.170.203:8000/showdown/websocket',
		socket: new WebSocket('ws://128.199.170.203:8000/showdown/websocket'),
	},
	clover: {
		name: 'Clover',
		link: 'https://clover.weedl.es',
		ip: 'clover.weedl.es:8000',
		server: 'ws://clover.weedl.es:8000/showdown/websocket',
		socket: new WebSocket('ws://clover.weedl.es:8000/showdown/websocket'),
	},
	radicalred: {
		name: 'Radical Red',
		link: 'https://play.radicalred.net',
		ip: 'sim.radicalred.net:8000',
		server: 'ws://sim.radicalred.net:8000/showdown/websocket',
		socket: new WebSocket('ws://sim.radicalred.net:8000/showdown/websocket'),
	},
};
let tracker: LiveTracker;
let returnData: {
	[key: string]: {
		[key: string]:
			| { [key: string]: string | { [key: string]: { [key: string]: number } | number } }
			| string
			| number;
	} | string;
};

for (let socket of Object.values(sockets)) {
	socket.socket.on('message', async (data) => {
		let realdata = data.toString()?.split('\n');
		let dataArr = [];

		for (const line of realdata) {
			dataArr.push(line);

			//Once the server connects, the bot logs in and joins the battle
			if (line.startsWith('|challstr|')) {
				//Logging in
				const psUrl = `https://play.pokemonshowdown.com/~~${socket.name.toLowerCase()}/action.php`;
				const loginData = querystring.stringify({
					act: 'login',
					name: process.env.PS_USERNAME,
					pass: process.env.PS_PASSWORD,
					challstr: line.substring(10),
				});
				const response = await axios.post(psUrl, loginData);
				const json = JSON.parse(response.data.substring(1));
				const assertion = json.assertion;
				if (assertion) {
					socket.socket.send(`|/trn ${process.env.PS_USERNAME},0,${assertion}|`);
				} else {
					return;
				}
			}

			//Tracking as normal
			else {
				if (tracker && tracker.battle) returnData = await tracker.track(line, dataArr);
			}
		}

		if (returnData && !returnData.error) {
			console.log(returnData);
		}
	});
}

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
				tracker = new LiveTracker(battleId, server.name, rules, server.socket);

				server.socket.send(`|/join ${battleId}`);
				if (!rules.stopTalking)
					await message.channel.send(`Battle joined! Keeping track of stats now. ${rules.ping}`);

				server.socket.send(
					`${battleId}|${
						rules.quirks
							? funcs.randomElement(consts.quirkyMessages.start)
							: 'Battled joined! Keeping track of stats now.'
					}`
				);

				//Websocket tracking time!
				server.socket.on('message', tracker.track);
			}
		} catch (e) {
			console.error(e);
		}
	}
});

// Log the client in.
client.login(process.env.TOKEN);
