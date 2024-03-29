class Pokemon {
	name: string;
	realName: string;
	status: string;
	statusInflictor: string;
	statusType: string;
	otherAffliction: { [key: string]: string };
	causeOfDeath: string;
	currentDKills: number;
	directKills: number;
	currentPKills: number;
	passiveKills: number;
	isDead: boolean;
	killer: string;
	hasSubstitute: boolean;

	constructor(pokemonName: string, realName?: string) {
		this.name = pokemonName;
		this.realName = realName || pokemonName;
		this.status = 'n/a';
		this.statusInflictor = '';
		this.statusType = ''; //Passive or Direct or undefined
		this.otherAffliction = {}; //Like Leech Seed and stuff
		this.causeOfDeath = 'n/a';
		this.currentDKills = 0;
		this.directKills = 0;
		this.currentPKills = 0;
		this.passiveKills = 0;
		this.isDead = false;
		this.killer = '';
		this.hasSubstitute = false;
	}

	//If the pokemon gets poisoned, burned, etc.
	statusEffect(statusInflicted: string, statusInflictor: string, statusType: string) {
		this.status = statusInflicted;
		this.statusInflictor = statusInflictor;
		this.statusType = statusType;
	}

	//If the pokemon gets healed with healing bell, aromatherapy, etc.
	statusFix() {
		this.status = 'n/a';
		this.statusInflictor = '';
		this.statusType = '';
	}

	clearAfflictions() {
		this.otherAffliction = {};
	}

	//When the pokemon has killed another pokemon in battle
	killed(deathJson: { killer: string; isPassive: boolean }) {
		if (deathJson.killer) {
			if (deathJson.isPassive) this.currentPKills++;
			else this.currentDKills++;
		}
	}

	unkilled(isPassive?: boolean) {
		if (isPassive) this.currentPKills--;
		else this.currentDKills--;
	}

	//Run when the pokemon has died in battle
	died(causeOfDeath: string, killer: string, isPassive: boolean) {
		this.causeOfDeath = causeOfDeath;
		this.killer = killer ? killer : '';
		this.isDead = true;

		return {
			killer: killer,
			isPassive: isPassive,
		};
	}

	undied() {
		this.causeOfDeath = '';
		this.isDead = false;
	}
}

export default Pokemon;
