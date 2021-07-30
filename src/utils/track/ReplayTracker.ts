import axios from "axios";
import { Rules, Battle, Stats, Pokemon } from "../../types";
import consts from "./consts";

class ReplayTracker {
    link: string;
    battlelink: string;
    rules: Rules;
    battle: Battle;

    constructor(link: string, rules: Rules) {
        this.link = link;
        this.battlelink = link.split("/")[3];
        this.rules = rules;

        this.battle = new Battle("", "", ""); //This is purely for the purposes of placating TypeScript
    }

    async track(data: string) {
        let players = [];
        let dataArr = [];

        try {
            //Separates the data into lines so it's easy to parse
            let realdata = data.split("\n");

            for (const line of realdata) {
                //console.log(line);
                dataArr.push(line);

                //Separates the line into parts, separated by `|`
                const parts = line.split("|").slice(1); //The substring is because all lines start with | so the first element is always blank

                //At the beginning of every match, the title of a match contains the player's names.
                if (line.startsWith(`|player|`)) {
                    if (players.length < 2) {
                        players.push(parts[2]);
                        if (parts[1] === "p2") {
                            //Initializes the this.battle as an object
                            this.battle = new Battle(
                                this.battlelink,
                                players[0],
                                players[1]
                            );
                        }
                    }
                }

                //Increments the total number of turns at the beginning of every new turn
                else if (line.startsWith(`|turn|`)) {
                    this.battle.turns++;
                    console.log(this.battle.turns);

                    dataArr.splice(dataArr.length - 1, 1);
                }

                //Checks if the this.battle is a randoms match
                else if (line.startsWith(`|tier|`)) {
                    if (line.toLowerCase().includes("random")) {
                        return {
                            players: {} as {
                                [key: string]: {
                                    ps: string;
                                    kills: {
                                        [key: string]: {
                                            [key: string]: number;
                                        };
                                    };
                                    deaths: { [key: string]: number };
                                    league_id?: string;
                                };
                            },
                            playerNames: [this.battle.p1, this.battle.p2],
                            info: {} as {
                                replay: string;
                                history: string;
                                turns: number;
                                winner: string;
                                loser: string;
                                rules: Rules;
                                result: string;
                                battleId: string;
                            },
                            error: ":x: **Error!** This is a Randoms match. I don't work with Randoms matches.",
                        };
                    }
                }

                //At the end of the match, when the winner is announced
                else if (line.startsWith(`|win|`)) {
                    this.battle.winner = parts[1];
                    this.battle.loser =
                        this.battle.winner === this.battle.p1
                            ? this.battle.p2
                            : this.battle.p1;

                    //Giving mons their proper kills
                    //Team 1
                    this.battle.p1Pokemon[this.battle.p1a.name] =
                        this.battle.p1a;
                    for (let pokemonKey of Object.keys(this.battle.p1Pokemon)) {
                        if (
                            !(
                                pokemonKey.includes("-") ||
                                pokemonKey.includes(":")
                            )
                        ) {
                            let pokemon = this.battle.p1Pokemon[pokemonKey];
                            this.battle.p1Pokemon[pokemon.name].directKills +=
                                pokemon.currentDKills;
                            this.battle.p1Pokemon[pokemon.name].passiveKills +=
                                pokemon.currentPKills;
                        }
                    }
                    //Team 2
                    this.battle.p2Pokemon[this.battle.p2a.name] =
                        this.battle.p2a;
                    for (let pokemonKey of Object.keys(this.battle.p2Pokemon)) {
                        if (
                            !(
                                pokemonKey.includes("-") ||
                                pokemonKey.includes(":")
                            )
                        ) {
                            let pokemon = this.battle.p2Pokemon[pokemonKey];
                            this.battle.p2Pokemon[pokemon.name].directKills +=
                                pokemon.currentDKills;
                            this.battle.p2Pokemon[pokemon.name].passiveKills +=
                                pokemon.currentPKills;
                        }
                    }

                    //Giving mons their proper names
                    //Team 1
                    for (let pokemonName of Object.keys(
                        this.battle.p1Pokemon
                    )) {
                        const newName =
                            this.battle.p1Pokemon[pokemonName].realName.split(
                                "-"
                            )[0];
                        if (
                            consts.misnomers.includes(newName) ||
                            consts.misnomers.includes(pokemonName) ||
                            consts.misnomers.includes(
                                this.battle.p1Pokemon[pokemonName].realName
                            )
                        ) {
                            this.battle.p1Pokemon[pokemonName].realName =
                                newName;
                        }
                        if (pokemonName === "") {
                            let possibleIndices = Object.entries(
                                this.battle.p1Pokemon
                            ).find(
                                ([, value]) =>
                                    value.realName === pokemonName ||
                                    value.name === pokemonName
                            );
                            if (possibleIndices)
                                delete this.battle.p1Pokemon[
                                    possibleIndices[0]
                                ];
                        }
                    }
                    //Team 2
                    for (let pokemonName of Object.keys(
                        this.battle.p2Pokemon
                    )) {
                        const newName =
                            this.battle.p2Pokemon[pokemonName].realName.split(
                                "-"
                            )[0];
                        if (
                            consts.misnomers.includes(newName) ||
                            consts.misnomers.includes(pokemonName) ||
                            consts.misnomers.includes(
                                this.battle.p2Pokemon[pokemonName].realName
                            )
                        ) {
                            this.battle.p2Pokemon[pokemonName].realName =
                                newName;
                        }
                        if (pokemonName === "") {
                            let possibleIndices = Object.entries(
                                this.battle.p2Pokemon
                            ).find(
                                ([, value]) =>
                                    value.realName === pokemonName ||
                                    value.name === pokemonName
                            );
                            if (possibleIndices)
                                delete this.battle.p2Pokemon[
                                    possibleIndices[0]
                                ];
                        }
                    }

                    //Creating the objects for kills and deaths
                    //Player 1
                    let killJsonp1: {
                        [key: string]: { [key: string]: number };
                    } = {};
                    let deathJsonp1: { [key: string]: number } = {};
                    for (let pokemonObj of Object.values(
                        this.battle.p1Pokemon
                    )) {
                        const realName = pokemonObj.realName;

                        if (
                            !(
                                Object.keys(killJsonp1).includes(
                                    pokemonObj.realName
                                ) ||
                                Object.keys(deathJsonp1).includes(
                                    pokemonObj.realName
                                )
                            ) &&
                            realName !== ""
                        ) {
                            killJsonp1[realName] = {
                                direct: pokemonObj.directKills,
                                passive: pokemonObj.passiveKills,
                            };
                            deathJsonp1[realName] = pokemonObj.isDead ? 1 : 0;
                        }
                    }
                    //Player 2
                    let killJsonp2: {
                        [key: string]: { [key: string]: number };
                    } = {};
                    let deathJsonp2: { [key: string]: number } = {};
                    for (let pokemonObj of Object.values(
                        this.battle.p2Pokemon
                    )) {
                        const realName = pokemonObj.realName;

                        if (
                            !(
                                Object.keys(killJsonp2).includes(
                                    pokemonObj.realName
                                ) ||
                                Object.keys(deathJsonp2).includes(
                                    pokemonObj.realName
                                )
                            ) &&
                            realName !== ""
                        ) {
                            killJsonp2[realName] = {
                                direct: pokemonObj.directKills,
                                passive: pokemonObj.passiveKills,
                            };
                            deathJsonp2[realName] = pokemonObj.isDead ? 1 : 0;
                        }
                    }

                    console.log(`${this.battle.winner} won!`);

                    this.battle.history =
                        this.battle.history.length === 0
                            ? ["Nothing happened"]
                            : this.battle.history;

                    await axios.post(
                        `https://server.porygonbot.xyz/kills/${this.battlelink}`,
                        this.battle.history.join("<br>"),
                        {
                            headers: {
                                "Content-Length": 0,
                                "Content-Type": "text/plain",
                            },
                            responseType: "text",
                        }
                    );

                    //Setting up the final object for returning
                    const player1 = this.battle.p1;
                    const player2 = this.battle.p2;
                    let returnData = {
                        players: {} as {
                            [key: string]: {
                                ps: string;
                                kills: {
                                    [key: string]: { [key: string]: number };
                                };
                                deaths: { [key: string]: number };
                            };
                        },
                        info: {},
                        playerNames: [this.battle.p1, this.battle.p2],
                    };
                    returnData.players[player1] = {
                        ps: this.battle.p1,
                        kills: killJsonp1,
                        deaths: deathJsonp1,
                    };
                    returnData.players[player2] = {
                        ps: this.battle.p2,
                        kills: killJsonp2,
                        deaths: deathJsonp2,
                    };
                    returnData.info = {
                        replay: this.battle.replay,
                        turns: this.battle.turns,
                        winner: this.battle.winner,
                        loser: this.battle.loser,
                        history: `https://server.porygonbot.xyz/kills/${this.battlelink}`,
                        rules: this.rules,
                        result: `${this.battle.winner} won ${
                            Object.keys(
                                returnData.players[this.battle.winner].kills
                            ).length -
                            Object.keys(
                                returnData.players[this.battle.winner].deaths
                            ).filter(
                                (pokemonKey) =>
                                    returnData.players[this.battle.winner]
                                        .deaths[pokemonKey] == 1
                            ).length
                        }-${
                            Object.keys(
                                returnData.players[this.battle.loser].kills
                            ).length -
                            Object.keys(
                                returnData.players[this.battle.loser].deaths
                            ).filter(
                                (pokemonKey) =>
                                    returnData.players[this.battle.loser]
                                        .deaths[pokemonKey] == 1
                            ).length
                        }`,
                        battleId: this.battle.id,
                    };

                    //Done!
                    return returnData as Stats;
                }

                //At the beginning of every non-randoms match, a list of Pokemon show up.
                //This code is to get all that
                if (line.startsWith(`|poke|`)) {
                    const realName = parts[2].split(",")[0];
                    const pokemonName = realName.split("-")[0];
                    const pokemon = new Pokemon(pokemonName, realName);
                    const side = parts[1] as "p1" | "p2";

                    this.battle[`${side}Pokemon` as const][pokemonName] =
                        pokemon;
                }

                //If a Pokemon switches, the active Pokemon must now change
                else if (
                    line.startsWith(`|switch|`) ||
                    line.startsWith(`|drag|`)
                ) {
                    let replacerRealName = parts[2].split(",")[0];
                    let replacer = replacerRealName.split("-")[0];
                    const side = parts[1].split(": ")[0] as
                        | "p1a"
                        | "p1b"
                        | "p2a"
                        | "p2b";
                    const playerSide = side.substring(0, 2) as "p1" | "p2";

                    //If the Pokemon gets switched out
                    this.battle[side].hasSubstitute = false;
                    this.battle[side].clearAfflictions();
                    let oldPokemon: Pokemon = new Pokemon("");

                    if (this.battle[side].name !== "") {
                        //Adding the kills
                        let tempCurrentDirectKills =
                            this.battle[side].currentDKills;
                        let tempCurrentPassiveKills =
                            this.battle[side].currentPKills;
                        this.battle[side].currentDKills = 0;
                        this.battle[side].currentPKills = 0;
                        this.battle[side].directKills += tempCurrentDirectKills;
                        this.battle[side].passiveKills +=
                            tempCurrentPassiveKills;

                        oldPokemon = this.battle[side];
                        this.battle[`${playerSide}Pokemon` as const][
                            oldPokemon.name
                        ] = oldPokemon;
                    }

                    this.battle[side] =
                        this.battle[`${playerSide}Pokemon` as const][replacer];
                    this.battle[side].realName = replacerRealName;
                    this.battle[`${playerSide}Pokemon` as const][
                        this.battle[side].realName
                    ] = this.battle[side];

                    console.log(
                        `${this.battle.battlelink}: ${
                            oldPokemon.realName || oldPokemon.name
                        } has been switched into ${
                            this.battle[side].realName || this.battle[side].name
                        }`
                    );
                }

                //Ally Switch and stuff
                else if (line.startsWith("|swap|")) {
                    //Swapping the mons
                    let userSide = parts[1].split(": ")[0].substring(0, 2) as
                        | "p1"
                        | "p2";

                    let temp = this.battle[`${userSide}a` as const];
                    this.battle[`${userSide}a` as const] =
                        this.battle[`${userSide}b` as const];
                    this.battle[`${userSide}b` as const] = temp;

                    console.log(
                        `${this.battle.battlelink}: ${
                            this.battle[`${userSide}a` as const].realName ||
                            this.battle[`${userSide}a` as const].name
                        } has swapped with ${
                            this.battle[`${userSide}b` as const].realName ||
                            this.battle[`${userSide}b` as const].name
                        } due to ${parts[3].split(": ")[1]}`
                    );
                }

                //If Zoroark replaces the pokemon due to Illusion
                else if (line.startsWith(`|replace|`)) {
                    const side = parts[1].split(": ")[0] as
                        | "p1a"
                        | "p1b"
                        | "p2a"
                        | "p2b";
                    const playerSide = side.substring(0, 2) as "p1" | "p2";
                    let replacer = parts[2].split(",")[0].split("-")[0];

                    let tempCurrentDirectKills =
                        this.battle[side].currentDKills;
                    let tempCurrentPassiveKills =
                        this.battle[side].currentPKills;
                    this.battle[side].currentDKills = 0;
                    this.battle[side].currentPKills = 0;
                    let oldPokemon: Pokemon = this.battle[side];
                    this.battle[side] =
                        this.battle[`${playerSide}Pokemon` as const][replacer];
                    this.battle[side].currentDKills += tempCurrentDirectKills;
                    this.battle[side].currentPKills += tempCurrentPassiveKills;

                    console.log(
                        `${this.battle.battlelink}: ${
                            oldPokemon.realName || oldPokemon.name
                        } has been replaced by ${
                            this.battle[side].realName || this.battle[side].name
                        }`
                    );

                    dataArr.splice(dataArr.length - 1, 1);
                }

                //Removes the |-supereffective| or  |upkeep part of realdata if it exists
                else if (
                    line.startsWith(`|-supereffective|`) ||
                    line.startsWith(`|upkeep`) ||
                    line.startsWith(`|-resisted|`) ||
                    line.startsWith(`|-unboost|`) ||
                    line.startsWith(`|-boost|`) ||
                    line.startsWith("|debug|") ||
                    line.startsWith("|-enditem|") ||
                    line.startsWith("|-fieldstart|") ||
                    line.startsWith("|-zbroken|") ||
                    line.startsWith("|-heal|") ||
                    line.startsWith("|-hint|") ||
                    line.startsWith("|-hitcount|") ||
                    line.startsWith("|-ability|") ||
                    line.startsWith("|-fieldactivate|") ||
                    line.startsWith("|-fail|") ||
                    line.startsWith("|-combine") ||
                    line.startsWith("|t:|") ||
                    line.startsWith("|c|") ||
                    line.startsWith("|l|") ||
                    line.startsWith("|j|") ||
                    line === "|"
                ) {
                    dataArr.splice(dataArr.length - 1, 1);
                }

                //When a Pokemon mega-evolves, I change its "realname"
                else if (line.startsWith(`|detailschange|`)) {
                    if (
                        parts[2].includes("Mega") ||
                        parts[2].includes("Primal")
                    ) {
                        const side = parts[1].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";
                        let realName = parts[2].split(",")[0];
                        this.battle[side].realName = realName;
                    }
                    dataArr.splice(dataArr.length - 1, 1);
                }

                //Moves that last for a single turn like Powder or Protect
                else if (line.startsWith(`|-singleturn|`)) {
                    let move = parts[2];
                    let victimSide = parts[1].split(": ")[0] as
                        | "p1a"
                        | "p1b"
                        | "p2a"
                        | "p2b";
                    let prevMoveLine = dataArr[dataArr.length - 2];
                    let prevMoveUserSide = prevMoveLine
                        .split("|")
                        .slice(1)[1]
                        .split(": ")[0] as "p1a" | "p1b" | "p2a" | "p2b";

                    this.battle[victimSide].otherAffliction[move] =
                        this.battle[prevMoveUserSide].realName ||
                        this.battle[prevMoveUserSide].name;

                    dataArr.splice(dataArr.length - 1, 1);
                }

                //When a Pokemon Gigantamaxes, I change its "realname"
                else if (line.startsWith(`|-formechange|`)) {
                    if (parts[2].includes("-Gmax")) {
                        const side = parts[1].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";
                        let realName = parts[2].split(",")[0];

                        this.battle[side].realName = realName;
                    }

                    dataArr.splice(dataArr.length - 1, 1);
                }

                //If a weather condition is set
                else if (line.startsWith(`|-weather|`)) {
                    if (!(line.includes("[upkeep]") || line.includes("none"))) {
                        let weather = parts[1];
                        let inflictor;
                        try {
                            //Weather is caused by an ability
                            let side = parts[3].split(": ")[0] as
                                | "p1a"
                                | "p1b"
                                | "p2a"
                                | "p2b";
                            inflictor =
                                this.battle[side].realName ||
                                this.battle[side].name;
                        } catch (e) {
                            //Weather is caused by a move
                            let prevLine = dataArr[dataArr.length - 2];
                            let side = prevLine
                                .split("|")
                                .slice(1)[1]
                                .split(": ")[0] as
                                | "p1a"
                                | "p1b"
                                | "p2a"
                                | "p2b";
                            inflictor =
                                this.battle[side].realName ||
                                this.battle[side].name;
                        }
                        console.log(
                            `${this.battle.battlelink}: ${inflictor} caused ${weather}.`
                        );
                        this.battle.setWeather(weather, inflictor);
                    }

                    //If the weather has been stopped
                    if (parts[1] === "none") {
                        this.battle.clearWeather();
                    }

                    dataArr.splice(dataArr.length - 1, 1);
                }

                //For moves like Infestation and Fire Spin
                else if (line.startsWith(`|-activate|`)) {
                    let move =
                        parts[2].includes("move") ||
                        parts[2].includes("ability")
                            ? parts[2].split(": ")[1]
                            : parts[2];
                    if (
                        !(
                            parts.length < 4 ||
                            !parts[3].includes(": ") ||
                            parts[2].includes("ability") ||
                            parts[2].includes("item")
                        )
                    ) {
                        let victimSide = parts[1].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";
                        let inflictorSide = parts[3]
                            .split(" ")[1]
                            .split(":")[0] as "p1a" | "p1b" | "p2a" | "p2b";

                        this.battle[victimSide].otherAffliction[move] =
                            this.battle[inflictorSide].realName ||
                            this.battle[inflictorSide].name;
                    }
                    if (
                        !(
                            move === "Destiny Bond" ||
                            move === "Synchronize" ||
                            move === "Powder"
                        )
                    )
                        dataArr.splice(dataArr.length - 1, 1);
                }

                //Checks for certain specific moves: hazards only for now
                else if (line.startsWith(`|move|`)) {
                    let move = parts[2];
                    console.log(`${this.battle.battlelink}: ${line}`);

                    if (line.includes("[miss]")) {
                        //If a mon missed
                        let inflictorSide = parts[1].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";
                        let victimSide = parts[3].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";
                        this.battle.history.push(
                            `${
                                this.battle[inflictorSide].realName ||
                                this.battle[inflictorSide].name
                            } missed ${move} against ${
                                this.battle[victimSide].realName ||
                                this.battle[victimSide].name
                            } (Turn ${this.battle.turns}).`
                        );
                    }
                }

                //Critical hit
                else if (line.startsWith(`|-crit|`)) {
                    let victimSide = parts[1].split(": ")[0] as
                        | "p1a"
                        | "p1b"
                        | "p2a"
                        | "p2b";
                    let prevMoveLine = dataArr[dataArr.length - 2];
                    if (prevMoveLine) {
                        let prevParts = prevMoveLine.split("|").slice(1);
                        let prevMove = prevParts[2];
                        let inflictorSide = prevParts[1].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";

                        this.battle.history.push(
                            `${
                                this.battle[inflictorSide].realName ||
                                this.battle[inflictorSide].name
                            } used ${prevMove} with a critical hit against ${
                                this.battle[victimSide].realName ||
                                this.battle[victimSide].name
                            } (Turn ${this.battle.turns}).`
                        );
                    }
                    dataArr.splice(dataArr.length - 1, 1);
                }

                //Statuses
                else if (line.startsWith(`|-status|`)) {
                    let prevMoveLine = dataArr[dataArr.length - 2];
                    let prevMove = prevMoveLine.split("|").slice(1)[2];
                    let prevParts = prevMoveLine.split("|").slice(1);
                    let prevPrevMoveLine = dataArr[dataArr.length - 3];
                    let prevPrevMove = prevPrevMoveLine.split("|").slice(1)[2];

                    let victimSide = parts[1].split(": ")[0] as
                        | "p1a"
                        | "p1b"
                        | "p2a"
                        | "p2b";
                    let inflictor = "";
                    let victim = "";

                    //If status was caused by a move
                    if (prevMoveLine.includes("Synchronize")) {
                        let inflictorSide = prevParts[1].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";

                        inflictor = this.battle[inflictorSide].name;
                        victim =
                            this.battle[victimSide].realName ||
                            this.battle[victimSide].name;
                        this.battle[victimSide].statusEffect(
                            parts[2] === "tox" ? "psn" : parts[2],
                            inflictor,
                            "P"
                        );
                        inflictor =
                            this.battle[inflictorSide].realName ||
                            this.battle[inflictorSide].name;
                    } else if (
                        (prevMoveLine.startsWith(`|move|`) &&
                            consts.statusMoves.includes(prevMove)) ||
                        (prevPrevMoveLine.startsWith(`|move|`) &&
                            consts.statusMoves.includes(prevPrevMove))
                    ) {
                        //Getting the pokemon side that inflicted the status
                        let inflictorSide = (
                            prevMoveLine.startsWith(`|move|`) &&
                            consts.statusMoves.includes(prevMove)
                                ? prevMoveLine
                                      .split("|")
                                      .slice(1)[1]
                                      .split(": ")[0]
                                : prevPrevMoveLine
                                      .split("|")
                                      .slice(1)[1]
                                      .split(": ")[0]
                        ) as "p1a" | "p1b" | "p2a" | "p2b";

                        inflictor = this.battle[inflictorSide].name;
                        this.battle[victimSide].statusEffect(
                            parts[2] === "tox" ? "psn" : parts[2],
                            inflictor,
                            "P"
                        );
                        inflictor =
                            this.battle[inflictorSide].realName ||
                            this.battle[inflictorSide].name;
                        victim =
                            this.battle[victimSide].realName ||
                            this.battle[victimSide].name;
                    } else if (
                        (line.includes("ability") &&
                            consts.statusAbility.includes(
                                parts[3].split("ability: ")[1].split("|")[0]
                            )) ||
                        line.includes("item")
                    ) {
                        //Ability status
                        let inflictorSide = (
                            line.includes("item: ")
                                ? victimSide
                                : parts[4].split("[of] ")[1].split(": ")[0]
                        ) as "p1a" | "p1b" | "p2a" | "p2b";
                        inflictor = this.battle[inflictorSide].name;
                        victim =
                            this.battle[victimSide].realName ||
                            this.battle[victimSide].name;
                        this.battle[victimSide].statusEffect(
                            parts[2],
                            inflictor,
                            this.rules.abilityitem
                        );
                        inflictor =
                            this.battle[inflictorSide].realName ||
                            this.battle[inflictorSide].name;
                    } else {
                        //If status wasn't caused by a move, but rather Toxic Spikes
                        victim =
                            this.battle[victimSide].realName ||
                            this.battle[victimSide].name;
                        if (victimSide.startsWith("p1")) {
                            inflictor =
                                this.battle.hazardsSet.p1["Toxic Spikes"];
                        } else {
                            inflictor =
                                this.battle.hazardsSet.p2["Toxic Spikes"];
                        }
                        this.battle[victimSide].statusEffect(
                            parts[2],
                            inflictor,
                            "P"
                        );
                    }
                    console.log(
                        `${this.battle.battlelink}: ${inflictor} caused ${parts[2]} on ${victim}.`
                    );
                    this.battle.history.push(
                        `${inflictor} caused ${parts[2]} on ${victim} (Turn ${this.battle.turns}).`
                    );

                    dataArr.splice(dataArr.length - 1, 1);
                }

                //If a mon flinches
                else if (line.startsWith("|cant|")) {
                    let userSide = parts[1].split(": ")[0] as
                        | "p1a"
                        | "p1b"
                        | "p2a"
                        | "p2b";

                    if (parts[2].includes("flinch")) {
                        this.battle.history.push(
                            `${this.battle[userSide].realName} flinched (Turn ${this.battle.turns}).`
                        );
                    }
                }

                //Side-specific ailments e.g. Stealth Rock
                else if (line.startsWith("|-sidestart|")) {
                    let prevLine = dataArr[dataArr.length - 2];
                    if (prevLine) {
                        let prevParts = prevLine.split("|").slice(1);
                        let inflictorSide = prevParts[1].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";

                        let inflictor = this.battle[inflictorSide].name;

                        this.battle.addHazard(
                            parts[1].split(": ")[0],
                            parts[2].split(": ")[1] || parts[2],
                            inflictor
                        );
                    }

                    dataArr.splice(dataArr.length - 1, 1);
                }

                //If a hazard ends on a side
                else if (line.startsWith(`|-sideend|`)) {
                    let side = parts[1].split(": ")[0];
                    let hazard = parts[2];
                    let prevMoveLine = dataArr[dataArr.length - 2];
                    let prevMoveParts = prevMoveLine.split("|").slice(1);
                    let move = parts[3]
                        ? parts[3].split("move: ")[1]
                        : prevMoveParts[2];
                    let removerSide = (
                        parts[4]
                            ? parts[4].split("[of] ")[1].split(": ")[0]
                            : prevMoveParts[1].split(": ")[0]
                    ) as "p1a" | "p1b" | "p2a" | "p2b";

                    this.battle.endHazard(side, hazard);

                    this.battle.history.push(
                        `${hazard} has been removed by ${this.battle[removerSide].realName} with ${move} (Turn ${this.battle.turns}).`
                    );
                    dataArr.splice(dataArr.length - 1, 1);
                }

                //If an affliction like Leech Seed or confusion starts
                else if (line.startsWith(`|-start|`)) {
                    let prevMove = dataArr[dataArr.length - 2];
                    let affliction = parts[2];

                    if (
                        prevMove.startsWith(`|move|`) &&
                        (prevMove.split("|").slice(1)[2] ===
                            affliction.split("move: ")[1] ||
                            prevMove.split("|").slice(1)[2] === affliction ||
                            consts.confusionMoves.includes(
                                prevMove.split("|").slice(1)[2]
                            ) || //For confusion
                            affliction.includes("perish") || //For Perish Song
                            affliction === "Curse" || //For Curse
                            affliction === "Nightmare") //For Nightmare
                    ) {
                        let move = affliction.split("move: ")[1]
                            ? affliction.split("move: ")[1]
                            : affliction;
                        let afflictorSide = prevMove
                            .split("|")
                            .slice(1)[1]
                            .split(": ")[0] as "p1a" | "p1b" | "p2a" | "p2b";
                        let afflictor;
                        let side = parts[1].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";

                        if (move === "Future Sight" || move === "Doom Desire") {
                            this.battle.hazardsSet[
                                afflictorSide.substring(0, 2).includes("1")
                                    ? afflictorSide
                                          .substring(0, 2)
                                          .replace("1", "2")
                                    : afflictorSide
                                          .substring(0, 2)
                                          .replace("2", "1")
                            ][move] =
                                this.battle[afflictorSide].realName ||
                                this.battle[afflictorSide].name;
                        } else {
                            let victim =
                                this.battle[side].realName ||
                                this.battle[side].name;
                            afflictor = this.battle[afflictorSide].name;
                            this.battle[side].otherAffliction[move] = afflictor;

                            console.log(
                                `${this.battle.battlelink}: Started ${move} on ${victim} by ${afflictor}`
                            );
                        }
                    } else if (affliction === `Substitute`) {
                        let side = parts[1].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";
                        this.battle[side].hasSubstitute = true;
                    }

                    if (affliction === `perish0`) {
                        //Pokemon dies of perish song
                        let side = parts[1].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";
                        let killer = "";
                        let afflictor =
                            this.battle[side].otherAffliction["perish3"];
                        let victim =
                            this.battle[side].realName ||
                            this.battle[side].name;
                        let currentPlayer = side.substring(0, 2) as "p1" | "p2";

                        if (
                            this.battle[`${currentPlayer}Pokemon` as const][
                                afflictor
                            ] &&
                            afflictor !== victim
                        ) {
                            let deathJson = this.battle[side].died(
                                affliction,
                                afflictor,
                                true
                            );
                            this.battle[`${currentPlayer}Pokemon` as const][
                                afflictor
                            ].killed(deathJson);
                        } else {
                            if (this.rules.suicide !== "N") {
                                killer =
                                    this.battle[`${currentPlayer}a` as const]
                                        .realName ||
                                    this.battle[`${currentPlayer}a` as const]
                                        .name;
                            }

                            let deathJson = this.battle[side].died(
                                prevMove,
                                killer,
                                this.rules.suicide === "P"
                            );
                            if (killer) {
                                this.battle[`${currentPlayer}Pokemon` as const][
                                    killer
                                ].killed(deathJson);
                            }
                        }

                        console.log(
                            `${this.battle.battlelink}: ${victim} was killed by ${killer} due to Perish Song (passive) (Turn ${this.battle.turns})`
                        );
                        this.battle.history.push(
                            `${victim} was killed by ${killer} due to Perish Song (passive) (Turn ${this.battle.turns})`
                        );
                    }

                    dataArr.splice(dataArr.length - 1, 1);
                }

                //If the pokemon didn't actually die, but it was immune.
                else if (line.startsWith(`|-immune|`)) {
                    let side = parts[1].split(": ")[0] as
                        | "p1a"
                        | "p1b"
                        | "p2a"
                        | "p2b";
                    let playerSide = side.substring(0, 2) as "p1" | "p2";

                    if (this.battle[side].isDead) {
                        this.battle[side].undied();
                        this.battle[`${playerSide}Pokemon` as const][
                            this.battle[side].killer
                        ].unkilled();
                    }

                    dataArr.splice(dataArr.length - 1, 1);
                }

                //Mostly used for Illusion cuz frick Zoroark
                else if (line.startsWith(`|-end|`)) {
                    let historyLine =
                        this.battle.history.filter((line) =>
                            line.includes(" was killed by ")
                        )[this.battle.history.length - 1] || "";

                    if (
                        line.endsWith("Illusion") &&
                        historyLine.includes(this.battle.turns.toString())
                    ) {
                        let historyLineParts = historyLine.split(" ");
                        let victim = historyLine.split(" was killed by ")[0];
                        let killer = historyLine
                            .split(" was killed by ")[1]
                            .split(" due to ")[0];
                        let isPassive =
                            historyLineParts[historyLineParts.length - 2] ===
                            "(passive)";

                        if (this.battle.p1Pokemon[victim]) {
                            this.battle.p1Pokemon[victim].undied();
                            this.battle.p2Pokemon[killer].unkilled(isPassive);
                        } else {
                            this.battle.p2Pokemon[victim].undied();
                            this.battle.p1Pokemon[killer].unkilled(isPassive);
                        }
                        this.battle.history.splice(
                            this.battle.history.length - 1,
                            1
                        );
                    }
                    if (
                        !(
                            line.endsWith("Future Sight") ||
                            line.endsWith("Doom Desire")
                        )
                    )
                        dataArr.splice(dataArr.length - 1, 1);
                }

                //If a pokemon's status is cured
                else if (line.startsWith(`|-curestatus|`)) {
                    let side = parts[1].split(": ")[0] as
                        | "p1a"
                        | "p1b"
                        | "p2a"
                        | "p2b";
                    let playerSide = side.substring(0, 2) as "p1" | "p2";
                    if (!(side.endsWith("a") || side.endsWith("b"))) {
                        for (let pokemon of Object.keys(
                            this.battle[`${playerSide}Pokemon` as const]
                        )) {
                            this.battle[`${playerSide}Pokemon` as const][
                                pokemon
                            ].statusFix();
                        }
                    } else {
                        this.battle[side].statusFix();
                    }
                }

                //When a Pokemon is damaged, and possibly faints
                else if (line.startsWith(`|-damage|`)) {
                    if (parts[2].endsWith("fnt") || parts[2].startsWith("0")) {
                        //A pokemon has fainted
                        let victimSide = parts[1].split(": ")[0] as
                            | "p1a"
                            | "p1b"
                            | "p2a"
                            | "p2b";
                        let victimPlayerSide = victimSide.substring(0, 2) as
                            | "p1"
                            | "p2";
                        let oppositeSide = (
                            victimSide.startsWith("p1")
                                ? victimSide.replace("1", "2")
                                : victimSide.replace("2", "1")
                        ) as "p1a" | "p1b" | "p2a" | "p2b";
                        let oppositePlayerSide = oppositeSide.substring(
                            0,
                            2
                        ) as "p1" | "p2";
                        let prevMoveLine = dataArr[dataArr.length - 2];

                        if (prevMoveLine) {
                            let prevMoveParts = prevMoveLine
                                .split("|")
                                .slice(1);
                            let prevMove;
                            try {
                                prevMove = prevMoveParts[2].split(": ")[1];
                            } catch (e) {
                                prevMove = "";
                            }
                            let killer = "";
                            let victim = "";
                            let reason = "";

                            if (parts[3] && parts[3].includes("[from]")) {
                                //It's a special death, not a normal one.
                                let move = parts[3].split("[from] ")[1];

                                //Hazards
                                if (consts.hazardMoves.includes(move)) {
                                    killer =
                                        this.battle.hazardsSet[
                                            victimSide.substring(0, 2)
                                        ][move];
                                    let deathJson = this.battle[
                                        victimSide
                                    ].died(move, killer, true);
                                    if (
                                        Object.keys(
                                            this.battle[
                                                `${victimPlayerSide}Pokemon` as const
                                            ]
                                        ).includes(killer)
                                    ) {
                                        killer =
                                            this.rules.selfteam !== "N"
                                                ? this.battle[oppositeSide]
                                                      .realName ||
                                                  this.battle[oppositeSide].name
                                                : "";
                                    }

                                    if (killer) {
                                        this.battle[
                                            `${victimPlayerSide}Pokemon` as const
                                        ][killer].killed(deathJson);
                                        killer = "an ally";
                                    }
                                    victim =
                                        this.battle[victimSide].realName ||
                                        this.battle[victimSide].name;

                                    reason = `${move} (passive) (Turn ${this.battle.turns})`;
                                }

                                //Weather
                                else if (
                                    move === "Hail" ||
                                    move === "Sandstorm"
                                ) {
                                    killer = this.battle.weatherInflictor;

                                    let deathJson = this.battle[
                                        victimSide
                                    ].died(move, killer, true);
                                    if (
                                        Object.keys(
                                            this.battle[
                                                `${victimPlayerSide}Pokemon` as const
                                            ]
                                        ).includes(killer)
                                    )
                                        killer =
                                            this.rules.selfteam !== "N"
                                                ? this.battle[oppositeSide]
                                                      .realName ||
                                                  this.battle[oppositeSide].name
                                                : "an ally";

                                    if (killer) {
                                        this.battle[
                                            `${oppositePlayerSide}Pokemon` as const
                                        ][killer].killed(deathJson);
                                    }
                                    victim =
                                        this.battle[victimSide].realName ||
                                        this.battle[victimSide].name;

                                    reason = `${move} (passive) (Turn ${this.battle.turns})`;
                                }

                                //Status
                                else if (move === "brn" || move === "psn") {
                                    killer =
                                        this.battle[victimSide].statusInflictor;

                                    let deathJson = this.battle[
                                        victimSide
                                    ].died(move, killer, true);
                                    if (
                                        Object.keys(
                                            this.battle[
                                                `${victimPlayerSide}Pokemon` as const
                                            ]
                                        ).includes(killer)
                                    ) {
                                        killer =
                                            this.rules.selfteam !== "N"
                                                ? this.battle[oppositeSide].name
                                                : "an ally";
                                    }

                                    if (killer) {
                                        this.battle[
                                            `${oppositePlayerSide}Pokemon` as const
                                        ][killer].killed(deathJson);
                                    }

                                    victim =
                                        this.battle[victimSide].realName ||
                                        this.battle[victimSide].name;
                                    reason = `${move} (${
                                        this.battle[victimSide].statusType ===
                                        "P"
                                            ? "passive"
                                            : "direct"
                                    }) (Turn ${this.battle.turns})`;
                                }

                                //Recoil
                                else if (
                                    consts.recoilMoves.includes(move) ||
                                    move.toLowerCase() === "recoil"
                                ) {
                                    if (this.rules.recoil !== "N")
                                        killer = this.battle[oppositeSide].name;
                                    else killer = "";

                                    let deathJson = this.battle[
                                        victimSide
                                    ].died(
                                        "recoil",
                                        killer,
                                        this.rules.recoil === "P"
                                    );

                                    if (killer)
                                        this.battle[
                                            `${victimPlayerSide}Pokemon` as const
                                        ][killer].killed(deathJson);
                                    victim =
                                        this.battle[victimSide].realName ||
                                        this.battle[victimSide].name;

                                    reason = `recoil (${
                                        this.rules.recoil === "P"
                                            ? "passive"
                                            : "direct"
                                    }) (Turn ${this.battle.turns})`;
                                }

                                //Item or Ability
                                else if (
                                    move.startsWith(`item: `) ||
                                    move.includes(`ability: `) ||
                                    (parts[3] &&
                                        parts[3].includes("Spiky Shield"))
                                ) {
                                    let item = parts[3]
                                        ? parts[3].split("[from] ")[1]
                                        : move.split(": ")[1];
                                    let owner = parts[4]
                                        ? parts[4]
                                              .split(": ")[0]
                                              .split("] ")[1] || ""
                                        : parts[1].split(": ")[0];

                                    if (owner === victimSide) {
                                        victim =
                                            this.battle[owner].realName ||
                                            this.battle[owner].name;
                                        if (this.rules.suicide !== "N")
                                            victim =
                                                this.battle[victimSide]
                                                    .realName ||
                                                this.battle[victimSide].name;

                                        let deathJson = this.battle[
                                            victimSide
                                        ].died(
                                            prevMove,
                                            killer,
                                            this.rules.suicide === "P"
                                        );
                                        if (killer) {
                                            this.battle.p2Pokemon[
                                                killer
                                            ].killed(deathJson);
                                        }
                                        killer = "suicide";
                                        reason = `${item} (${
                                            this.rules.suicide === "P"
                                                ? "passive"
                                                : "direct"
                                        }) (Turn ${this.battle.turns})`;
                                    } else {
                                        if (!this.battle[victimSide].isDead) {
                                            victim =
                                                this.battle[victimSide]
                                                    .realName ||
                                                this.battle[victimSide].name;

                                            if (this.rules.abilityitem !== "N")
                                                killer =
                                                    this.battle[oppositeSide]
                                                        .realName ||
                                                    this.battle[oppositeSide]
                                                        .name;
                                            else killer = "";

                                            let deathJson = this.battle[
                                                victimSide
                                            ].died(
                                                item,
                                                killer,
                                                this.rules.abilityitem === "P"
                                            );
                                            if (killer)
                                                this.battle[
                                                    `${oppositePlayerSide}Pokemon` as const
                                                ][killer].killed(deathJson);
                                        }

                                        reason = `${item} (${
                                            this.rules.abilityitem === "P"
                                                ? "passive"
                                                : "direct"
                                        }) (Turn ${this.battle.turns})`;
                                    }
                                }

                                //Affliction
                                else {
                                    move = move.includes("move: ")
                                        ? move.split(": ")[1]
                                        : move;

                                    killer =
                                        this.battle[victimSide].otherAffliction[
                                            move
                                        ] || "";
                                    victim =
                                        this.battle[victimSide].realName ||
                                        this.battle[victimSide].name;

                                    if (
                                        victim.includes(killer) ||
                                        killer.includes(victim)
                                    )
                                        killer =
                                            this.battle[oppositeSide]
                                                .realName ||
                                            this.battle[oppositeSide].name;

                                    let deathJson = this.battle[
                                        victimSide
                                    ].died(
                                        prevMove,
                                        killer,
                                        this.rules.suicide === "P"
                                    );
                                    this.battle[
                                        `${oppositePlayerSide}Pokemon` as const
                                    ][killer].killed(deathJson);

                                    reason = `${move} (passive) (Turn ${this.battle.turns})`;
                                }
                            } else if (
                                prevMove === "Future Sight" ||
                                prevMove === "Doom Desire"
                            ) {
                                //Future Sight or Doom Desire Kill
                                killer =
                                    this.battle.hazardsSet[victimPlayerSide][
                                        prevMove
                                    ];
                                let deathJson = this.battle[victimSide].died(
                                    prevMove,
                                    killer,
                                    false
                                );
                                this.battle[
                                    `${oppositePlayerSide}Pokemon` as const
                                ][killer].killed(deathJson);

                                reason = `${prevMove} (passive) (Turn ${this.battle.turns})`;
                            }

                            //If an affliction triggered
                            else if (prevMoveLine.includes("|-activate|")) {
                                killer =
                                    this.battle[victimSide].otherAffliction[
                                        prevMove
                                    ];
                                let deathJson = this.battle[victimSide].died(
                                    prevMove,
                                    killer,
                                    false
                                );
                                this.battle[
                                    `${oppositePlayerSide}Pokemon` as const
                                ][killer].killed(deathJson);

                                victim =
                                    this.battle[victimSide].realName ||
                                    this.battle[victimSide].name;
                                reason = `${prevMove} (direct) (Turn ${this.battle.turns})`;
                            } else {
                                if (
                                    !(
                                        ((prevMoveLine.startsWith(`|move|`) &&
                                            (prevMoveLine.includes(
                                                "Self-Destruct"
                                            ) ||
                                                prevMoveLine.includes(
                                                    "Explosion"
                                                ) ||
                                                prevMoveLine.includes(
                                                    "Misty Explosion"
                                                ) ||
                                                prevMoveLine.includes(
                                                    "Memento"
                                                ) ||
                                                prevMoveLine.includes(
                                                    "Healing Wish"
                                                ) ||
                                                prevMoveLine.includes(
                                                    "Final Gambit"
                                                ) ||
                                                prevMoveLine.includes(
                                                    "Lunar Dance"
                                                ))) ||
                                            prevMoveLine.includes("Curse")) &&
                                        prevMoveParts[1].includes(victimSide)
                                    )
                                ) {
                                    //It's just a regular effing kill
                                    prevMove = prevMoveLine
                                        .split("|")
                                        .slice(1)[2];
                                    let prevMoveUserSide =
                                        prevMoveParts[1].split(": ")[0] as
                                            | "p1a"
                                            | "p1b"
                                            | "p2a"
                                            | "p2b";

                                    killer =
                                        this.battle[prevMoveUserSide]
                                            .realName ||
                                        this.battle[prevMoveUserSide].name;
                                    let deathJson = this.battle[
                                        victimSide
                                    ].died("direct", killer, false);
                                    this.battle[prevMoveUserSide].killed(
                                        deathJson
                                    );

                                    if (
                                        (victimSide ||
                                            (victimSide &&
                                                prevMoveParts[4] &&
                                                prevMoveParts[4].includes(
                                                    "[spread]"
                                                ) &&
                                                prevMoveParts[4].includes(
                                                    victimSide
                                                ))) &&
                                        this.battle[victimSide].isDead
                                    )
                                        victim =
                                            this.battle[victimSide].realName ||
                                            this.battle[victimSide].name;

                                    reason = `${prevMove} (direct) (Turn ${this.battle.turns})`;
                                }
                            }

                            if (victim && reason) {
                                console.log(
                                    `${this.battle.battlelink}: ${victim} was killed by ${killer} due to ${reason}.`
                                );
                                this.battle.history.push(
                                    `${victim} was killed by ${killer} due to ${reason}.`
                                );
                            }
                        }
                    }
                    dataArr.splice(dataArr.length - 1, 1);
                }

                //This is mostly only used for the victim of Destiny Bond
                else if (line.startsWith(`|faint|`)) {
                    let victimSide = parts[1].split(": ")[0] as
                        | "p1a"
                        | "p1b"
                        | "p2a"
                        | "p2b";
                    let victimPlayerSide = victimSide.substring(0, 2) as
                        | "p1"
                        | "p2";
                    let oppositeSide = (
                        victimSide.startsWith("p1")
                            ? victimSide.replace("1", "2")
                            : victimSide.replace("2", "1")
                    ) as "p1a" | "p1b" | "p2a" | "p2b";
                    let oppositePlayerSide = oppositeSide.substring(0, 2) as
                        | "p1"
                        | "p2";
                    let prevLine = dataArr[dataArr.length - 2];
                    if (prevLine) {
                        let prevParts = prevLine.split("|").slice(1);

                        if (
                            prevLine.startsWith(`|-activate|`) &&
                            prevLine.endsWith(`Destiny Bond`)
                        ) {
                            let killerSide = prevLine
                                .split("|")
                                .slice(1)[1]
                                .split(": ")[0] as
                                | "p1a"
                                | "p1b"
                                | "p2a"
                                | "p2b";
                            let killer = "";
                            let victim =
                                this.battle[victimSide].realName ||
                                this.battle[victimSide].name;
                            if (this.rules.db !== "N") {
                                killer = this.battle[killerSide].name;
                            }

                            let deathJson = this.battle[victimSide].died(
                                "Destiny Bond",
                                killer,
                                this.rules.db === "P"
                            );
                            this.battle[`${victimPlayerSide}Pokemon` as const][
                                killer
                            ].killed(deathJson);

                            console.log(
                                `${this.battle.battlelink}: ${victim} was killed by ${killer} due to Destiny Bond (Turn ${this.battle.turns}).`
                            );
                            this.battle.history.push(
                                `${victim} was killed by ${killer} due to Destiny Bond (Turn ${this.battle.turns}).`
                            );
                        } else if (
                            (prevLine.startsWith(`|move|`) &&
                                (prevLine.includes("Self-Destruct") ||
                                    prevLine.includes("Explosion") ||
                                    prevLine.includes("Misty Explosion") ||
                                    prevLine.includes("Memento") ||
                                    prevLine.includes("Healing Wish") ||
                                    prevLine.includes("Final Gambit") ||
                                    prevLine.includes("Lunar Dance"))) ||
                            prevLine.includes("Curse")
                        ) {
                            let prevMove = prevParts[2];

                            let killer = "";
                            let victim = "";
                            if (this.rules.suicide !== "N") {
                                let newSide = (
                                    prevParts[1].split(": ")[0].endsWith("a") ||
                                    prevParts[1].split(": ")[0].endsWith("b")
                                        ? prevParts[1].split(": ")[0]
                                        : `${prevParts[1].split(": ")[0]}a`
                                ) as "p1a" | "p1b" | "p2a" | "p2b";

                                killer =
                                    this.battle[newSide].realName ||
                                    this.battle[newSide].name;
                            }

                            if (!this.battle[victimSide].isDead) {
                                victim =
                                    this.battle[victimSide].realName ||
                                    this.battle[victimSide].name;

                                let deathJson = this.battle[victimSide].died(
                                    prevMove,
                                    killer,
                                    this.rules.suicide === "P"
                                );
                                if (killer && killer !== victim) {
                                    this.battle[
                                        `${oppositePlayerSide}Pokemon` as const
                                    ][killer].killed(deathJson);
                                }

                                console.log(
                                    `${
                                        this.battle.battlelink
                                    }: ${victim} was killed by ${
                                        killer || "suicide"
                                    } due to ${prevMove} (${
                                        this.rules.suicide === "P"
                                            ? "passive"
                                            : "direct"
                                    }) (Turn ${this.battle.turns}).`
                                );
                                this.battle.history.push(
                                    `${victim} was killed by ${
                                        killer || "suicide"
                                    } due to ${prevMove} (${
                                        this.rules.suicide === "P"
                                            ? "passive"
                                            : "direct"
                                    }) (Turn ${this.battle.turns}).`
                                );
                            }
                        } else {
                            //Regular kill if it wasn't picked up by the |-damage| statement
                            let killer = "";
                            let victim = "";
                            if (!this.battle[victimSide].isDead) {
                                let killerSide = prevParts[1].split(": ")[0] as
                                    | "p1a"
                                    | "p1b"
                                    | "p2a"
                                    | "p2b";
                                killer =
                                    this.battle[killerSide].realName ||
                                    this.battle[killerSide].name;
                                victim =
                                    this.battle[victimSide].realName ||
                                    this.battle[victimSide].name;

                                let deathJson = this.battle[victimSide].died(
                                    "faint",
                                    killer,
                                    false
                                );
                                this.battle[
                                    `${oppositePlayerSide}Pokemon` as const
                                ][killer].killed(deathJson);
                            }

                            if (killer && victim) {
                                console.log(
                                    `${this.battle.battlelink}: ${victim} was killed by ${killer} (Turn ${this.battle.turns}).`
                                );
                                this.battle.history.push(
                                    `${victim} was killed by ${killer} (Turn ${this.battle.turns}).`
                                );
                            }
                        }
                    }

                    dataArr.splice(dataArr.length - 1, 1);
                }

                //Messages sent by the server
                else if (line.startsWith(`|-message|`)) {
                    let messageParts = parts[1].split(" forfeited");
                    if (line.endsWith("forfeited.")) {
                        let forfeiter = messageParts[0];
                        let forfeiterSide = (
                            forfeiter === this.battle.p1 ? "p1" : "p2"
                        ) as "p1" | "p2";
                        if (this.rules.forfeit !== "N") {
                            let numDead = 0;

                            for (let pokemon of Object.values(
                                this.battle[`${forfeiterSide}Pokemon` as const]
                            )) {
                                if (!pokemon.isDead) numDead++;
                            }
                            this.battle[`${forfeiterSide}a` as const][
                                `current${
                                    this.rules.forfeit as "D" | "P"
                                }Kills` as const
                            ] += numDead;
                        }
                        this.battle.forfeiter = forfeiter;
                    }

                    dataArr.splice(dataArr.length - 1, 1);
                }
            }

            return {
                players: {} as {
                    [key: string]: {
                        ps: string;
                        kills: { [key: string]: { [key: string]: number } };
                        deaths: { [key: string]: number };
                        league_id?: string;
                    };
                },
                playerNames: [this.battle.p1, this.battle.p2],
                info: {} as {
                    replay: string;
                    history: string;
                    turns: number;
                    winner: string;
                    loser: string;
                    rules: Rules;
                    result: string;
                    battleId: string;
                },
                error: ":x: :x: Something went wrong. Please try again. :x: :x: ",
            };
        } catch (e) {
            process.stdout.write(`${this.battlelink}: `);
            console.error(e);
            return {
                players: {} as {
                    [key: string]: {
                        ps: string;
                        kills: { [key: string]: { [key: string]: number } };
                        deaths: { [key: string]: number };
                        league_id?: string;
                    };
                },
                playerNames: [this.battle.p1, this.battle.p2],
                info: {} as {
                    replay: string;
                    history: string;
                    turns: number;
                    winner: string;
                    loser: string;
                    rules: Rules;
                    result: string;
                    battleId: string;
                },
                error: `:x: Error with match number \`${
                    this.battlelink
                }\`. I will be unable to analyze this match until you screenshot this message and send it to the Porygon server's bugs-and-help channel and ping harbar20 in the same channel.\n\n**Error:**\`\`\`${
                    e.message
                }\nLine number: ${e.stack.split(":")[2]}\`\`\``,
            };
        }
    }
}

export default ReplayTracker;
