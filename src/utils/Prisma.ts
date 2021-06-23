import { PrismaClient } from '@prisma/client';
import { Rules } from '../types';

const prisma = new PrismaClient();

class Prisma {
	static async upsertLeague(obj: {
		channelId: string,
		system: string,
		leagueName?: string,
		guildId?: string,
		resultsChannelId?: string,
		dlId?: string,
		sheetId?: string
	}) {
		await prisma.league.upsert({
			where: {
				channelId: obj.channelId,
			},
			update: {
				system: obj.system as 'D' | 'DM' | 'C' | 'S' | 'DL',
				resultsChannelId: obj.resultsChannelId ?? '',
				dlId: obj.dlId ?? '',
				sheetId: obj.sheetId ?? '',
			},
			create: {
				name: obj.leagueName ?? '',
				guildId: obj.guildId ?? '',
				channelId: obj.channelId,
				system: obj.system as 'D' | 'DM' | 'C' | 'S' | 'DL',
				resultsChannelId: obj.resultsChannelId ?? '',
				dlId: obj.dlId ?? '',
				sheetId: obj.sheetId ?? '',
			},
		});
	}

	static async getLeague(channelId: string) {
		const league = await prisma.league.findUnique({
			where: {
				channelId: channelId,
			},
		});

		return league;
	}

	static async deleteLeague(channelId: string) {
		await prisma.league.delete({
			where: {
				channelId: channelId,
			},
		});

		await prisma.rules.delete({
			where: {
				channelId: channelId,
			},
		});
	}

	static async upsertRules(channelId: string, name?: string, rules?: { [key: string]: string | Boolean }) {
		await prisma.rules.upsert({
			where: {
				channelId: channelId,
			},
			update: {
				...rules,
			},
			create: {
				channelId: channelId,
				leagueName: name ?? '',
				...rules,
			},
		});
	}

	static async getRules(channelId: string) {
		let rules = {
			channelId: channelId,
			leagueName: 'Default',
			recoil: 'D',
			suicide: 'D',
			abilityitem: 'P',
			selfteam: 'N',
			db: 'P',
			spoiler: true,
			ping: '',
			forfeit: 'N',
			format: '',
			quirks: true,
			stopTalking: false,
			tb: true,
			combine: false,
			redirect: '',
		} as Rules;

		const numLeagues = await prisma.rules.count({
			where: {
				channelId: channelId,
			},
		});

		if (numLeagues > 1)
			rules = (await prisma.rules
				.findUnique({
					where: {
						channelId: channelId,
					},
				})
				.catch((e: Error) => {
					console.error(e);
				})) as Rules;

		return rules;
	}
}

export default Prisma;
