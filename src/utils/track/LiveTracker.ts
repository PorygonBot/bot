import axios from 'axios';
import querystring from 'querystring';
import WebSocket from 'ws';
import { Rules, Battle } from '../../types';
import track from './tracker';
import consts from './consts';

class ReplayTracker {
	battlelink: string;
	rules: Rules;
	serverType: string;
	battle: Battle;
	websocket: WebSocket;

	constructor(battlelink: string, serverType: string, rules: Rules, websocket: WebSocket) {
		this.battlelink = battlelink;
		this.rules = rules;
		this.serverType = serverType.toLowerCase();
		this.battle = new Battle('', '', ''); //This is purely for the purposes of placating TypeScript
		this.websocket = websocket; //Should already have been opened in /utils/track/sockets.ts
	}

	async track(data: string) {
		let dataArr = [];

		try {
			//Separates the data into lines so it's easy to parse
			let realdata = data.split('\n');

			for (const line of realdata) {
				//console.log(line);
				dataArr.push(line);

				//Separates the line into parts, separated by `|`
				const parts = line.split('|').slice(1); //The substring is because all lines start with | so the first element is always blank

				//Checks first and foremost if the battle even exists
				if (line.startsWith(`|noinit|`)) {
					this.websocket.send(`${this.battlelink}|/leave`);
					Battle.decrementBattles(this.battlelink);
					console.log(`Left ${this.battlelink}.`);
					if (line.includes('nonexistent|')) {
						return {
							error: `:x: Battle ${this.battlelink} is invalid. The battleroom is either closed or non-existent. I have left the battle.`,
						};
					} else if (line.includes('joinfailed')) {
						return {
							error: `:x: Battle ${this.battlelink} is closed to spectators. I have left the battle. Please start a new battle with spectators allowed if you want me to track it.`,
						};
					} else if (line.includes('rename')) {
						return {
							error: `:x: Battle ${this.battlelink} has become private. I have left the battle. Please run \`/inviteonly off\` in the battle chat and re-send the link here.`,
						};
					}
				}

				//Once the server connects, the bot logs in and joins the battle
				else if (data.startsWith('|challstr|')) {
					//Logging in
					const psUrl = `https://play.pokemonshowdown.com/~~${this.serverType}/action.php`;
					const loginData = querystring.stringify({
						act: 'login',
						name: process.env.PS_USERNAME,
						pass: process.env.PS_PASSWORD,
						challstr: data.substring(10),
					});
					const response = await axios.post(psUrl, loginData);
					const json = JSON.parse(response.data.substring(1));
					const assertion = json.assertion;
					if (assertion) {
						this.websocket.send(`|/trn ${process.env.PS_USERNAME},0,${assertion}|`);
					} else {
						return;
					}
				}

				//At the beginning of every match, the title of a match contains the player's names.
				//As such, in order to get and verify the player's names in the database, this is the most effective.
				else if (line.startsWith(`|title|`)) {
					let players = parts[1].split(' vs. ');
					console.log(`${this.battlelink}: ${players}`);

					//Initializes the battle as an object
					this.battle = new Battle(this.battlelink, players[0], players[1]);
				}

				//Checks for Showdown-based commands
				else if (line.startsWith('|c|☆')) {
					if (parts[2] === 'porygon, use leave') {
						this.websocket.send(`${this.battlelink}|Ok. Bye!`);
						Battle.decrementBattles(this.battlelink);

						console.log(`Left ${this.battlelink}.`);
						return { error: `Left ${this.battlelink}.` };
					}
				}

				//Increments the total number of turns at the beginning of every new turn
				else if (line.startsWith(`|turn|`)) {
					this.battle.turns++;
					console.log(this.battlelink + ': ' + this.battle.turns);

					dataArr.splice(dataArr.length - 1, 1);
				}

				//Checks if the battle is a randoms match
				else if (line.startsWith(`|tier|`)) {
					if (line.toLowerCase().includes('random')) {
						return {
							error: ":x: **Error!** This is a Randoms match. I don't work with Randoms matches.",
						};
					}
				}

				//At the end of the match, when the winner is announced
				else if (line.startsWith(`|win|`)) {
					this.battle.winner = parts[1];
					this.battle.loser = this.battle.winner === this.battle.p1 ? this.battle.p2 : this.battle.p1;

					console.log(`${this.battlelink}: ${this.battle.winner} won!`);
					this.websocket.send(`${this.battlelink}|/savereplay`); //Requesting the replay from Showdown
				}

				//Getting the replay and returning all the data
				else if (line.startsWith('|queryresponse|savereplay')) {
					//Getting the replay
					const replayData = JSON.parse(data.substring(26));
					const replayUrl = `https://play.pokemonshowdown.com/~~${this.serverType}/action.php`;
					replayData.id = `${this.serverType === 'showdown' ? '' : `${this.serverType}-`}${replayData.id}`;
					const replayNewData = querystring.stringify({
						act: 'uploadreplay',
						log: replayData.log,
						id: replayData.id,
					});
					await axios.post(replayUrl, replayNewData).catch((e) => console.error(e));
					this.battle.replay = `https://replay.pokemonshowdown.com/${replayData.id}`;

					//Giving mons their proper kills
					//Team 1
					this.battle.p1Pokemon[this.battle.p1a.name] = this.battle.p1a;
					for (let pokemonKey of Object.keys(this.battle.p1Pokemon)) {
						if (!(pokemonKey.includes('-') || pokemonKey.includes(':'))) {
							let pokemon = this.battle.p1Pokemon[pokemonKey];
							this.battle.p1Pokemon[pokemon.name].directKills += pokemon.currentDKills;
							this.battle.p1Pokemon[pokemon.name].passiveKills += pokemon.currentPKills;
						}
					}
					//Team 2
					this.battle.p2Pokemon[this.battle.p2a.name] = this.battle.p2a;
					for (let pokemonKey of Object.keys(this.battle.p2Pokemon)) {
						if (!(pokemonKey.includes('-') || pokemonKey.includes(':'))) {
							let pokemon = this.battle.p2Pokemon[pokemonKey];
							this.battle.p2Pokemon[pokemon.name].directKills += pokemon.currentDKills;
							this.battle.p2Pokemon[pokemon.name].passiveKills += pokemon.currentPKills;
						}
					}

					//Giving mons their proper names
					//Team 1
					for (let pokemonName of Object.keys(this.battle.p1Pokemon)) {
						const newName = this.battle.p1Pokemon[pokemonName].realName.split('-')[0];
						if (
							consts.misnomers.includes(newName) ||
							consts.misnomers.includes(pokemonName) ||
							consts.misnomers.includes(this.battle.p1Pokemon[pokemonName].realName)
						) {
							this.battle.p1Pokemon[pokemonName].realName = newName;
						}
						if (pokemonName === '') {
							let possibleIndices = Object.entries(this.battle.p1Pokemon).find(
								([, value]) => value.realName === pokemonName || value.name === pokemonName
							);
							if (possibleIndices) delete this.battle.p1Pokemon[possibleIndices[0]];
						}
					}
					//Team 2
					for (let pokemonName of Object.keys(this.battle.p2Pokemon)) {
						const newName = this.battle.p2Pokemon[pokemonName].realName.split('-')[0];
						if (
							consts.misnomers.includes(newName) ||
							consts.misnomers.includes(pokemonName) ||
							consts.misnomers.includes(this.battle.p2Pokemon[pokemonName].realName)
						) {
							this.battle.p2Pokemon[pokemonName].realName = newName;
						}
						if (pokemonName === '') {
							let possibleIndices = Object.entries(this.battle.p2Pokemon).find(
								([, value]) => value.realName === pokemonName || value.name === pokemonName
							);
							if (possibleIndices) delete this.battle.p2Pokemon[possibleIndices[0]];
						}
					}

					//Creating the objects for kills and deaths
					//Player 1
					let killJsonp1: { [key: string]: { [key: string]: number } } = {};
					let deathJsonp1: { [key: string]: number } = {};
					for (let pokemonObj of Object.values(this.battle.p1Pokemon)) {
						const realName = pokemonObj.realName;

						if (
							!(
								Object.keys(killJsonp1).includes(pokemonObj.realName) ||
								Object.keys(deathJsonp1).includes(pokemonObj.realName)
							) &&
							realName !== ''
						) {
							killJsonp1[realName] = {
								direct: pokemonObj.directKills,
								passive: pokemonObj.passiveKills,
							};
							deathJsonp1[realName] = pokemonObj.isDead ? 1 : 0;
						}
					}
					//Player 2
					let killJsonp2: { [key: string]: { [key: string]: number } } = {};
					let deathJsonp2: { [key: string]: number } = {};
					for (let pokemonObj of Object.values(this.battle.p2Pokemon)) {
						const realName = pokemonObj.realName;

						if (
							!(
								Object.keys(killJsonp2).includes(pokemonObj.realName) ||
								Object.keys(deathJsonp2).includes(pokemonObj.realName)
							) &&
							realName !== ''
						) {
							killJsonp2[realName] = {
								direct: pokemonObj.directKills,
								passive: pokemonObj.passiveKills,
							};
							deathJsonp2[realName] = pokemonObj.isDead ? 2 : 0;
						}
					}

					console.log(`${this.battle.winner} won!`);

					//Posting to the history server
					this.battle.history = this.battle.history.length === 0 ? ['Nothing happened'] : this.battle.history;
					await axios.post(
						`https://server.porygonbot.xyz/kills/${this.battlelink}`,
						this.battle.history.join('<br>'),
						{
							headers: {
								'Content-Length': 0,
								'Content-Type': 'text/plain',
							},
							responseType: 'text',
						}
					);

					//Setting up the final object for returning
					let info = {
						replay: this.battle.replay,
						turns: this.battle.turns,
						winner: this.battle.winner,
						loser: this.battle.loser,
						history: `https://server.porygonbot.xyz/kills/${this.battlelink}`,
						spoiler: this.rules.spoiler,
						format: this.rules.format,
						tb: this.rules.tb,
						result: '',
					};
					const player1 = this.battle.p1;
					const player2 = this.battle.p2;
					let returnData = {
						players: {} as {
							[key: string]: {
								ps: string;
								kills: { [key: string]: { [key: string]: number } };
								deaths: { [key: string]: number };
							};
						},
						info: {},
					};
					returnData.players[player1] = {
						ps: this.battle.p1,
						kills: killJsonp1,
						deaths: deathJsonp1,
					};
					returnData.players[player2] = {
						ps: this.battle.p2,
						kills: killJsonp1,
						deaths: deathJsonp1,
					};

					info.result = `${info.winner} won ${
						Object.keys(returnData.players[info.winner].kills).length -
						Object.keys(returnData.players[info.winner].deaths).filter(
							(pokemonKey) => returnData.players[info.winner].deaths[pokemonKey] == 1
						).length
					}-${
						Object.keys(returnData.players[info.winner].kills).length -
						Object.keys(returnData.players[info.loser].deaths).filter(
							(pokemonKey) => returnData.players[info.loser].deaths[pokemonKey] == 1
						).length
					}`;
					returnData.info = info;

					//Done!
					this.websocket.send(`|/leave ${this.battlelink}`);
					return returnData;
				}

				//Normal tracking
				else {
					track(line, parts, this.rules, this.battle, dataArr);
				}
			}

			return { error: ':x: :x: Something went wrong. Please try again. :x: :x: ' };
		} catch (e) {
			process.stdout.write(`${this.battlelink}: `);
			console.error(e);
			return {
				error: `:x: Error with match number \`${
					this.battlelink
				}\`. I will be unable to analyze this match until you screenshot this message and send it to the Porygon server's bugs-and-help channel and ping harbar20 in the same channel.\n\n**Error:**\`\`\`${
					e.message
				}\nLine number: ${e.stack.split(':')[2]}\`\`\``,
			};
		}
	}
}

export default ReplayTracker;
