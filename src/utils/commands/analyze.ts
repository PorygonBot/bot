import { Message, Client } from "discord.js";
import axios from 'axios';
import { Prisma } from "..";
import { ReplayTracker } from '../track'
import { Command } from "../../types";

export default {
	name: "analyze",
	description: "Analyzes Pokemon Showdown replays.",
	aliases: ["analyse"],
	usage: "[replay link]",
	async execute(message: Message, args: string[], client: Client) {
		const channel = message.channel;

		channel.send("Analyzing...");
		for (let arg of args) {
			let link = arg + ".log";
			let response = await axios.get(link, {
				headers: { "User-Agent": "PorygonTheBot" },
			});
			let data = response.data;

			//Getting the rules
			let rules = await Prisma.getRules(channel.id);

			let replayer = new ReplayTracker(arg, rules);
			await replayer.track(data);
			console.log(`${link} has been analyzed!`);
		}
	},
} as Command;
