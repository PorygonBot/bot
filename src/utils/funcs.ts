import { Guild, GuildChannel } from 'discord.js';

const getChannel = (server: Guild, channelID: string) => {
	return server.channels.cache.get(channelID) as GuildChannel | undefined;
};

const randomElement = (list: string[]) => {
	return list[Math.round(Math.random() * (list.length - 1))];
};

const funcs = {
	getChannel,
	randomElement,
};

export default funcs;
