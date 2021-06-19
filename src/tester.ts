import { Prisma } from './utils';

// A `main` function so that you can use async/await
async function main() {
	let league = await Prisma.getLeague('692097604108156928');
	console.log(league);
}

main().catch((e) => {
	throw e;
});
