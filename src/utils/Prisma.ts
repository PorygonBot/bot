import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class Prisma {
	static async upsertLeague(
		channelId: string,
		system: string,
		leagueName?: string,
		guildId?: string,
		resultsChannelId?: string,
		dlId?: string,
		sheetId?: string
	) {
		await prisma.league.upsert({
			where: {
				channelId: channelId,
			},
			update: {
				system: system as 'D' | 'DM' | 'C' | 'S' | 'DL',
				resultsChannelId: resultsChannelId ?? '',
				dlId: dlId ?? '',
				sheetId: sheetId ?? '',
			},
			create: {
				name: leagueName ?? '',
				guildId: guildId ?? '',
				channelId: channelId,
				system: system as 'D' | 'DM' | 'C' | 'S' | 'DL',
				resultsChannelId: resultsChannelId ?? '',
				dlId: dlId ?? '',
				sheetId: sheetId ?? '',
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
		const rules = await prisma.rules.findUnique({
			where: {
				channelId: channelId,
			},
		});

		return rules;
	}
}

export default Prisma;
