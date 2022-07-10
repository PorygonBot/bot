import { Message, Client } from "discord.js";
import axios from 'axios';
import { Prisma, update, ReplayTracker } from "../utils";
import { Command } from "../types";

export default {
	name: "analyze",
	description: "Analyzes Pokemon Showdown replays.",
	aliases: ["analyse"],
	usage: "[replay link]",
	async execute(message: Message, args: string[], client: Client) {
		const channel = message.channel;

		channel.send("Analyzing...");
		for (let arg of args) {
			if (!arg.includes("replay")) {
				await message.channel.send(`:x: ${arg} is not a replay.`)
			}
			let link = arg + ".log";
			let response = await axios.get(link, {
				headers: { "User-Agent": "PorygonTheBot" },
			});
			let data = response.data;

			//Getting the rules
			let rules = await Prisma.getRules(channel.id);

			let replayer = new ReplayTracker(arg, rules);
			const matchJson = await replayer.track(data);

			await update(matchJson, message)
			await message.channel.send(
				`Battle between \`${matchJson.playerNames[0]}\` and \`${matchJson.playerNames[1]}\` is complete and info has been updated!`
			);
			console.log(`${link} has been analyzed!`);
		}
	},
} as Command;
