import Pokemon from './Pokemon';

class Battle {
	p1: string;
	p1Pokemon: { [key: string]: Pokemon };
	p2: string;
	p2Pokemon: { [key: string]: Pokemon };
	id: string;
	hazardsSet: { [key: string]: { [key: string]: string } };
	history: string[];
	weather: string;
	weatherInflictor: string;
	turns: number;
	battlelink: string;
	replay: string;
	winner: string;
	loser: string;
	forfeiter: string;
	p1a: Pokemon;
	p1b: Pokemon;
	p2a: Pokemon;
	p2b: Pokemon;

	constructor(battleId: string, player1: string, player2: string) {
		//Player info
		this.p1 = player1;
		this.p1Pokemon = {};
		this.p2 = player2;
		this.p2Pokemon = {};

		//Battle info
		this.id = battleId;
		this.hazardsSet = {
			p1: {
				'Stealth Rock': '',
				Spikes: '',
				'Toxic Spikes': '',
			},
			p2: {
				'Stealth Rock': '',
				Spikes: '',
				'Toxic Spikes': '',
			},
		};
		this.history = [];
		this.weather = '';
		this.weatherInflictor = '';
		this.turns = 0;
		this.battlelink = battleId;
		this.replay = '';
		this.winner = '';
		this.loser = '';
		this.forfeiter = '';
		//Player 1's pokemon
		this.p1a = new Pokemon('');
		this.p1b = new Pokemon('');
		//Ploayer 2's pokemon
		this.p2a = new Pokemon('');
		this.p2b = new Pokemon('');
	}

	static numBattles: number = 0;
	static battles: string[] = [];

	static incrementBattles(battleLink: string) {
		this.numBattles++;
		this.battles.push(battleLink);
	}

	static decrementBattles(battleLink: string) {
		this.numBattles--;
		this.battles.splice(this.battles.indexOf(battleLink));
	}

	addHazard(side: string, hazard: string, hazardInflictor: string) {
		if (side !== '') {
			this.hazardsSet[side][hazard] = hazardInflictor;
		}
	}

	endHazard(side: string, hazard: string) {
		this.hazardsSet[side][hazard] = '';
	}

	setWeather(weather: string, inflictor: string) {
		this.weather = weather;
		this.weatherInflictor = inflictor;
	}

	clearWeather() {
		this.weather = '';
		this.weatherInflictor = '';
	}
}

export default Battle;
