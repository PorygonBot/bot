import { Client, Message } from "discord.js";

export default {
	name: "ping",
	description: "Tests the server and API ping of the bot.",
	async execute(message: Message, args: string[], client: Client) {
		let m = await message.channel.send("Ping?");
		m.edit(
			`Pong! Latency is ${
				m.createdTimestamp - message.createdTimestamp
			}ms. API Latency is ${Math.round(client.ws.ping)}ms`
		);
	},
};
