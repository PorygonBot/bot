import consts from "./consts";
//Types
import { Rules, Battle, Pokemon } from "../../types";

function track(
    line: string,
    parts: string[],
    rules: Rules,
    battle: Battle,
    dataArr: string[]
) {
    //At the beginning of every non-randoms match, a list of Pokemon show up.
    //This code is to get all that
    if (line.startsWith(`|poke|`)) {
        const realName = parts[2].split(",")[0];
        const pokemonName = realName.split("-")[0];
        const pokemon = new Pokemon(pokemonName, realName);
        const side = parts[1] as "p1" | "p2";

        battle[`${side}Pokemon` as const][pokemonName] = pokemon;
    }

    //If a Pokemon switches, the active Pokemon must now change
    else if (line.startsWith(`|switch|`) || line.startsWith(`|drag|`)) {
        let replacerRealName = parts[2].split(",")[0];
        let replacer = replacerRealName.split("-")[0];
        const side = parts[1].split(": ")[0] as "p1a" | "p1b" | "p2a" | "p2b";
        const playerSide = side.substring(0, 2) as "p1" | "p2";

        //If the Pokemon gets switched out
        battle[side].hasSubstitute = false;
        battle[side].clearAfflictions();
        let oldPokemon: Pokemon = new Pokemon("");

        if (battle[side].name !== "") {
            //Adding the kills
            let tempCurrentDirectKills = battle[side].currentDKills;
            let tempCurrentPassiveKills = battle[side].currentPKills;
            battle[side].currentDKills = 0;
            battle[side].currentPKills = 0;
            battle[side].directKills += tempCurrentDirectKills;
            battle[side].passiveKills += tempCurrentPassiveKills;

            oldPokemon = battle[side];
            battle[`${playerSide}Pokemon` as const][oldPokemon.name] =
                oldPokemon;
        }

        battle[side] = battle[`${playerSide}Pokemon` as const][replacer];
        battle[side].realName = replacerRealName;
        battle[`${playerSide}Pokemon` as const][battle[side].realName] =
            battle[side];

        console.log(
            `${battle.battlelink}: ${
                oldPokemon.realName || oldPokemon.name
            } has been switched into ${
                battle[side].realName || battle[side].name
            }`
        );
    }

    //Ally Switch and stuff
    else if (line.startsWith("|swap|")) {
        //Swapping the mons
        let userSide = parts[1].split(": ")[0].substring(0, 2) as "p1" | "p2";

        let temp = battle[`${userSide}a` as const];
        battle[`${userSide}a` as const] = battle[`${userSide}b` as const];
        battle[`${userSide}b` as const] = temp;

        console.log(
            `${battle.battlelink}: ${
                battle[`${userSide}a` as const].realName ||
                battle[`${userSide}a` as const].name
            } has swapped with ${
                battle[`${userSide}b` as const].realName ||
                battle[`${userSide}b` as const].name
            } due to ${parts[3].split(": ")[1]}`
        );
    }

    //If Zoroark replaces the pokemon due to Illusion
    else if (line.startsWith(`|replace|`)) {
        const side = parts[1].split(": ")[0] as "p1a" | "p1b" | "p2a" | "p2b";
        const playerSide = side.substring(0, 2) as "p1" | "p2";
        let replacer = parts[2].split(",")[0].split("-")[0];

        let tempCurrentDirectKills = battle[side].currentDKills;
        let tempCurrentPassiveKills = battle[side].currentPKills;
        battle[side].currentDKills = 0;
        battle[side].currentPKills = 0;
        let oldPokemon: Pokemon = battle[side];
        battle[side] = battle[`${playerSide}Pokemon` as const][replacer];
        battle[side].currentDKills += tempCurrentDirectKills;
        battle[side].currentPKills += tempCurrentPassiveKills;

        console.log(
            `${battle.battlelink}: ${
                oldPokemon.realName || oldPokemon.name
            } has been replaced by ${
                battle[side].realName || battle[side].name
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
        if (parts[2].includes("Mega") || parts[2].includes("Primal")) {
            const side = parts[1].split(": ")[0] as
                | "p1a"
                | "p1b"
                | "p2a"
                | "p2b";
            let realName = parts[2].split(",")[0];
            battle[side].realName = realName;
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

        battle[victimSide].otherAffliction[move] =
            battle[prevMoveUserSide].realName || battle[prevMoveUserSide].name;

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

            battle[side].realName = realName;
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
                inflictor = battle[side].realName || battle[side].name;
            } catch (e) {
                //Weather is caused by a move
                let prevLine = dataArr[dataArr.length - 2];
                let side = prevLine.split("|").slice(1)[1].split(": ")[0] as
                    | "p1a"
                    | "p1b"
                    | "p2a"
                    | "p2b";
                inflictor = battle[side].realName || battle[side].name;
            }
            console.log(
                `${battle.battlelink}: ${inflictor} caused ${weather}.`
            );
            battle.setWeather(weather, inflictor);
        }

        //If the weather has been stopped
        if (parts[1] === "none") {
            battle.clearWeather();
        }

        dataArr.splice(dataArr.length - 1, 1);
    }

    //For moves like Infestation and Fire Spin
    else if (line.startsWith(`|-activate|`)) {
        let move =
            parts[2].includes("move") || parts[2].includes("ability")
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
            let inflictorSide = parts[3].split(" ")[1].split(":")[0] as
                | "p1a"
                | "p1b"
                | "p2a"
                | "p2b";

            battle[victimSide].otherAffliction[move] =
                battle[inflictorSide].realName || battle[inflictorSide].name;
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
        console.log(`${battle.battlelink}: ${line}`);

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
            battle.history.push(
                `${
                    battle[inflictorSide].realName || battle[inflictorSide].name
                } missed ${move} against ${
                    battle[victimSide].realName || battle[victimSide].name
                } (Turn ${battle.turns}).`
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

            battle.history.push(
                `${
                    battle[inflictorSide].realName || battle[inflictorSide].name
                } used ${prevMove} with a critical hit against ${
                    battle[victimSide].realName || battle[victimSide].name
                } (Turn ${battle.turns}).`
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

            inflictor = battle[inflictorSide].name;
            victim = battle[victimSide].realName || battle[victimSide].name;
            battle[victimSide].statusEffect(
                parts[2] === "tox" ? "psn" : parts[2],
                inflictor,
                "P"
            );
            inflictor =
                battle[inflictorSide].realName || battle[inflictorSide].name;
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
                    ? prevMoveLine.split("|").slice(1)[1].split(": ")[0]
                    : prevPrevMoveLine.split("|").slice(1)[1].split(": ")[0]
            ) as "p1a" | "p1b" | "p2a" | "p2b";

            inflictor = battle[inflictorSide].name;
            battle[victimSide].statusEffect(
                parts[2] === "tox" ? "psn" : parts[2],
                inflictor,
                "P"
            );
            inflictor =
                battle[inflictorSide].realName || battle[inflictorSide].name;
            victim = battle[victimSide].realName || battle[victimSide].name;
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
            inflictor = battle[inflictorSide].name;
            victim = battle[victimSide].realName || battle[victimSide].name;
            battle[victimSide].statusEffect(
                parts[2],
                inflictor,
                rules.abilityitem
            );
            inflictor =
                battle[inflictorSide].realName || battle[inflictorSide].name;
        } else {
            //If status wasn't caused by a move, but rather Toxic Spikes
            victim = battle[victimSide].realName || battle[victimSide].name;
            if (victimSide.startsWith("p1")) {
                inflictor = battle.hazardsSet.p1["Toxic Spikes"];
            } else {
                inflictor = battle.hazardsSet.p2["Toxic Spikes"];
            }
            battle[victimSide].statusEffect(parts[2], inflictor, "P");
        }
        console.log(
            `${battle.battlelink}: ${inflictor} caused ${parts[2]} on ${victim}.`
        );
        battle.history.push(
            `${inflictor} caused ${parts[2]} on ${victim} (Turn ${battle.turns}).`
        );

        dataArr.splice(dataArr.length - 1, 1);
    }

    //If a mon flinches
    else if (line.startsWith("|cant|")) {
        let userSide = parts[1].split(": ")[0] as "p1a" | "p1b" | "p2a" | "p2b";

        if (parts[2].includes("flinch")) {
            battle.history.push(
                `${battle[userSide].realName} flinched (Turn ${battle.turns}).`
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

            let inflictor = battle[inflictorSide].name;

            battle.addHazard(
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
        let move = parts[3] ? parts[3].split("move: ")[1] : prevMoveParts[2];
        let removerSide = (
            parts[4]
                ? parts[4].split("[of] ")[1].split(": ")[0]
                : prevMoveParts[1].split(": ")[0]
        ) as "p1a" | "p1b" | "p2a" | "p2b";

        battle.endHazard(side, hazard);

        battle.history.push(
            `${hazard} has been removed by ${battle[removerSide].realName} with ${move} (Turn ${battle.turns}).`
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
            let side = parts[1].split(": ")[0] as "p1a" | "p1b" | "p2a" | "p2b";

            if (move === "Future Sight" || move === "Doom Desire") {
                console.log("yo");
                battle.hazardsSet[
                    afflictorSide.substring(0, 2).includes("1")
                        ? afflictorSide.substring(0, 2).replace("1", "2")
                        : afflictorSide.substring(0, 2).replace("2", "1")
                ][move] =
                    battle[afflictorSide].realName ||
                    battle[afflictorSide].name;
            } else {
                let victim = battle[side].realName || battle[side].name;
                afflictor = battle[afflictorSide].name;
                battle[side].otherAffliction[move] = afflictor;

                console.log(
                    `${battle.battlelink}: Started ${move} on ${victim} by ${afflictor}`
                );
            }
        } else if (affliction === `Substitute`) {
            let side = parts[1].split(": ")[0] as "p1a" | "p1b" | "p2a" | "p2b";
            battle[side].hasSubstitute = true;
        }

        if (affliction === `perish0`) {
            //Pokemon dies of perish song
            let side = parts[1].split(": ")[0] as "p1a" | "p1b" | "p2a" | "p2b";
            let killer = "";
            let afflictor = battle[side].otherAffliction["perish3"];
            let victim = battle[side].realName || battle[side].name;
            let currentPlayer = side.substring(0, 2) as "p1" | "p2";

            if (
                battle[`${currentPlayer}Pokemon` as const][afflictor] &&
                afflictor !== victim
            ) {
                let deathJson = battle[side].died(affliction, afflictor, true);
                battle[`${currentPlayer}Pokemon` as const][afflictor].killed(
                    deathJson
                );
            } else {
                if (rules.suicide !== "N") {
                    killer =
                        battle[`${currentPlayer}a` as const].realName ||
                        battle[`${currentPlayer}a` as const].name;
                }

                let deathJson = battle[side].died(
                    prevMove,
                    killer,
                    rules.suicide === "P"
                );
                if (killer) {
                    battle[`${currentPlayer}Pokemon` as const][killer].killed(
                        deathJson
                    );
                }
            }

            console.log(
                `${battle.battlelink}: ${victim} was killed by ${killer} due to Perish Song (passive) (Turn ${battle.turns})`
            );
            battle.history.push(
                `${victim} was killed by ${killer} due to Perish Song (passive) (Turn ${battle.turns})`
            );
        }

        dataArr.splice(dataArr.length - 1, 1);
    }

    //If the pokemon didn't actually die, but it was immune.
    else if (line.startsWith(`|-immune|`)) {
        let side = parts[1].split(": ")[0] as "p1a" | "p1b" | "p2a" | "p2b";
        let playerSide = side.substring(0, 2) as "p1" | "p2";

        if (battle[side].isDead) {
            battle[side].undied();
            battle[`${playerSide}Pokemon` as const][
                battle[side].killer
            ].unkilled();
        }

        dataArr.splice(dataArr.length - 1, 1);
    }

    //Mostly used for Illusion cuz frick Zoroark
    else if (line.startsWith(`|-end|`)) {
        let historyLine =
            battle.history.filter((line) => line.includes(" was killed by "))[
                battle.history.length - 1
            ] || "";

        if (
            line.endsWith("Illusion") &&
            historyLine.includes(battle.turns.toString())
        ) {
            let historyLineParts = historyLine.split(" ");
            let victim = historyLine.split(" was killed by ")[0];
            let killer = historyLine
                .split(" was killed by ")[1]
                .split(" due to ")[0];
            let isPassive =
                historyLineParts[historyLineParts.length - 2] === "(passive)";

            if (battle.p1Pokemon[victim]) {
                battle.p1Pokemon[victim].undied();
                battle.p2Pokemon[killer].unkilled(isPassive);
            } else {
                battle.p2Pokemon[victim].undied();
                battle.p1Pokemon[killer].unkilled(isPassive);
            }
            battle.history.splice(battle.history.length - 1, 1);
        }
        if (!(line.endsWith("Future Sight") || line.endsWith("Doom Desire")))
            dataArr.splice(dataArr.length - 1, 1);
    }

    //If a pokemon's status is cured
    else if (line.startsWith(`|-curestatus|`)) {
        let side = parts[1].split(": ")[0] as "p1a" | "p1b" | "p2a" | "p2b";
        let playerSide = side.substring(0, 2) as "p1" | "p2";
        if (!(side.endsWith("a") || side.endsWith("b"))) {
            for (let pokemon of Object.keys(
                battle[`${playerSide}Pokemon` as const]
            )) {
                battle[`${playerSide}Pokemon` as const][pokemon].statusFix();
            }
        } else {
            battle[side].statusFix();
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
            let victimPlayerSide = victimSide.substring(0, 2) as "p1" | "p2";
            let oppositeSide = (
                victimSide.startsWith("p1")
                    ? victimSide.replace("1", "2")
                    : victimSide.replace("2", "1")
            ) as "p1a" | "p1b" | "p2a" | "p2b";
            let oppositePlayerSide = oppositeSide.substring(0, 2) as
                | "p1"
                | "p2";
            let prevMoveLine = dataArr[dataArr.length - 2];

            if (prevMoveLine) {
                let prevMoveParts = prevMoveLine.split("|").slice(1);
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
                            battle.hazardsSet[victimSide.substring(0, 2)][move];
                        let deathJson = battle[victimSide].died(
                            move,
                            killer,
                            true
                        );
                        if (
                            Object.keys(
                                battle[`${victimPlayerSide}Pokemon` as const]
                            ).includes(killer)
                        ) {
                            killer =
                                rules.selfteam !== "N"
                                    ? battle[oppositeSide].realName ||
                                      battle[oppositeSide].name
                                    : "";
                        }

                        if (killer) {
                            battle[`${victimPlayerSide}Pokemon` as const][
                                killer
                            ].killed(deathJson);
                            killer = "an ally";
                        }
                        victim =
                            battle[victimSide].realName ||
                            battle[victimSide].name;

                        reason = `${move} (passive) (Turn ${battle.turns})`;
                    }

                    //Weather
                    else if (move === "Hail" || move === "Sandstorm") {
                        killer = battle.weatherInflictor;

                        let deathJson = battle[victimSide].died(
                            move,
                            killer,
                            true
                        );
                        if (
                            Object.keys(
                                battle[`${victimPlayerSide}Pokemon` as const]
                            ).includes(killer)
                        )
                            killer =
                                rules.selfteam !== "N"
                                    ? battle[oppositeSide].realName ||
                                      battle[oppositeSide].name
                                    : "an ally";

                        if (killer) {
                            battle[`${oppositePlayerSide}Pokemon` as const][
                                killer
                            ].killed(deathJson);
                        }
                        victim =
                            battle[victimSide].realName ||
                            battle[victimSide].name;

                        reason = `${move} (passive) (Turn ${battle.turns})`;
                    }

                    //Status
                    else if (move === "brn" || move === "psn") {
                        killer = battle[victimSide].statusInflictor;

                        let deathJson = battle[victimSide].died(
                            move,
                            killer,
                            true
                        );
                        if (
                            Object.keys(
                                battle[`${victimPlayerSide}Pokemon` as const]
                            ).includes(killer)
                        ) {
                            killer =
                                rules.selfteam !== "N"
                                    ? battle[oppositeSide].name
                                    : "an ally";
                        }

                        if (killer) {
                            battle[`${oppositePlayerSide}Pokemon` as const][
                                killer
                            ].killed(deathJson);
                        }

                        victim =
                            battle[victimSide].realName ||
                            battle[victimSide].name;
                        reason = `${move} (${
                            battle[victimSide].statusType === "P"
                                ? "passive"
                                : "direct"
                        }) (Turn ${battle.turns})`;
                    }

                    //Recoil
                    else if (
                        consts.recoilMoves.includes(move) ||
                        move.toLowerCase() === "recoil"
                    ) {
                        if (rules.recoil !== "N")
                            killer = battle[oppositeSide].name;
                        else killer = "";

                        let deathJson = battle[victimSide].died(
                            "recoil",
                            killer,
                            rules.recoil === "P"
                        );

                        if (killer)
                            battle[`${victimPlayerSide}Pokemon` as const][
                                killer
                            ].killed(deathJson);
                        victim =
                            battle[victimSide].realName ||
                            battle[victimSide].name;

                        reason = `recoil (${
                            rules.recoil === "P" ? "passive" : "direct"
                        }) (Turn ${battle.turns})`;
                    }

                    //Item or Ability
                    else if (
                        move.startsWith(`item: `) ||
                        move.includes(`ability: `) ||
                        (parts[3] && parts[3].includes("Spiky Shield"))
                    ) {
                        let item = parts[3]
                            ? parts[3].split("[from] ")[1]
                            : move.split(": ")[1];
                        let owner = parts[4]
                            ? parts[4].split(": ")[0].split("] ")[1] || ""
                            : parts[1].split(": ")[0];

                        if (owner === victimSide) {
                            victim =
                                battle[owner].realName || battle[owner].name;
                            if (rules.suicide !== "N")
                                victim =
                                    battle[victimSide].realName ||
                                    battle[victimSide].name;

                            let deathJson = battle[victimSide].died(
                                prevMove,
                                killer,
                                rules.suicide === "P"
                            );
                            if (killer) {
                                battle.p2Pokemon[killer].killed(deathJson);
                            }
                            killer = "suicide";
                            reason = `${item} (${
                                rules.suicide === "P" ? "passive" : "direct"
                            }) (Turn ${battle.turns})`;
                        } else {
                            if (!battle[victimSide].isDead) {
                                victim =
                                    battle[victimSide].realName ||
                                    battle[victimSide].name;

                                if (rules.abilityitem !== "N")
                                    killer =
                                        battle[oppositeSide].realName ||
                                        battle[oppositeSide].name;
                                else killer = "";

                                let deathJson = battle[victimSide].died(
                                    item,
                                    killer,
                                    rules.abilityitem === "P"
                                );
                                if (killer)
                                    battle[
                                        `${oppositePlayerSide}Pokemon` as const
                                    ][killer].killed(deathJson);
                            }

                            reason = `${item} (${
                                rules.abilityitem === "P" ? "passive" : "direct"
                            }) (Turn ${battle.turns})`;
                        }
                    }

                    //Affliction
                    else {
                        move = move.includes("move: ")
                            ? move.split(": ")[1]
                            : move;

                        killer = battle[victimSide].otherAffliction[move] || "";
                        victim =
                            battle[victimSide].realName ||
                            battle[victimSide].name;

                        if (victim.includes(killer) || killer.includes(victim))
                            killer =
                                battle[oppositeSide].realName ||
                                battle[oppositeSide].name;

                        let deathJson = battle[victimSide].died(
                            prevMove,
                            killer,
                            rules.suicide === "P"
                        );
                        battle[`${oppositePlayerSide}Pokemon` as const][
                            killer
                        ].killed(deathJson);

                        reason = `${move} (passive) (Turn ${battle.turns})`;
                    }
                } else if (
                    prevMove === "Future Sight" ||
                    prevMove === "Doom Desire"
                ) {
                    //Future Sight or Doom Desire Kill
                    killer = battle.hazardsSet[victimPlayerSide][prevMove];
                    let deathJson = battle[victimSide].died(
                        prevMove,
                        killer,
                        false
                    );
                    battle[`${oppositePlayerSide}Pokemon` as const][
                        killer
                    ].killed(deathJson);

                    reason = `${prevMove} (passive) (Turn ${battle.turns})`;
                }

                //If an affliction triggered
                else if (prevMoveLine.includes("|-activate|")) {
                    killer = battle[victimSide].otherAffliction[prevMove];
                    let deathJson = battle[victimSide].died(
                        prevMove,
                        killer,
                        false
                    );
                    battle[`${oppositePlayerSide}Pokemon` as const][
                        killer
                    ].killed(deathJson);

                    victim =
                        battle[victimSide].realName || battle[victimSide].name;
                    reason = `${prevMove} (direct) (Turn ${battle.turns})`;
                } else {
                    if (
                        !(
                            ((prevMoveLine.startsWith(`|move|`) &&
                                (prevMoveLine.includes("Self-Destruct") ||
                                    prevMoveLine.includes("Explosion") ||
                                    prevMoveLine.includes("Misty Explosion") ||
                                    prevMoveLine.includes("Memento") ||
                                    prevMoveLine.includes("Healing Wish") ||
                                    prevMoveLine.includes("Final Gambit") ||
                                    prevMoveLine.includes("Lunar Dance"))) ||
                                prevMoveLine.includes("Curse")) &&
                            prevMoveParts[1].includes(victimSide)
                        )
                    ) {
                        //It's just a regular effing kill
                        prevMove = prevMoveLine.split("|").slice(1)[2];
                        let prevMoveUserSide = prevMoveParts[1].split(
                            ": "
                        )[0] as "p1a" | "p1b" | "p2a" | "p2b";

                        killer =
                            battle[prevMoveUserSide].realName ||
                            battle[prevMoveUserSide].name;
                        let deathJson = battle[victimSide].died(
                            "direct",
                            killer,
                            false
                        );
                        battle[prevMoveUserSide].killed(deathJson);

                        if (
                            (victimSide ||
                                (victimSide &&
                                    prevMoveParts[4] &&
                                    prevMoveParts[4].includes("[spread]") &&
                                    prevMoveParts[4].includes(victimSide))) &&
                            !battle[victimSide].isDead
                        )
                            victim =
                                battle[victimSide].realName ||
                                battle[victimSide].name;

                        reason = `${prevMove} (direct) (Turn ${battle.turns})`;
                    }
                }
                console.log(victim, reason);
                if (victim && reason) {
                    console.log(
                        `${battle.battlelink}: ${victim} was killed by ${killer} due to ${reason}.`
                    );
                    battle.history.push(
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
        let victimPlayerSide = victimSide.substring(0, 2) as "p1" | "p2";
        let oppositeSide = (
            victimSide.startsWith("p1")
                ? victimSide.replace("1", "2")
                : victimSide.replace("2", "1")
        ) as "p1a" | "p1b" | "p2a" | "p2b";
        let oppositePlayerSide = oppositeSide.substring(0, 2) as "p1" | "p2";
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
                    .split(": ")[0] as "p1a" | "p1b" | "p2a" | "p2b";
                let killer = "";
                let victim =
                    battle[victimSide].realName || battle[victimSide].name;
                if (rules.db !== "N") {
                    killer = battle[killerSide].name;
                }

                let deathJson = battle[victimSide].died(
                    "Destiny Bond",
                    killer,
                    rules.db === "P"
                );
                battle[`${victimPlayerSide}Pokemon` as const][killer].killed(
                    deathJson
                );

                console.log(
                    `${battle.battlelink}: ${victim} was killed by ${killer} due to Destiny Bond (Turn ${battle.turns}).`
                );
                battle.history.push(
                    `${victim} was killed by ${killer} due to Destiny Bond (Turn ${battle.turns}).`
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
                if (rules.suicide !== "N") {
                    let newSide = (
                        prevParts[1].split(": ")[0].endsWith("a") ||
                        prevParts[1].split(": ")[0].endsWith("b")
                            ? prevParts[1].split(": ")[0]
                            : `${prevParts[1].split(": ")[0]}a`
                    ) as "p1a" | "p1b" | "p2a" | "p2b";

                    killer = battle[newSide].realName || battle[newSide].name;
                }

                if (!battle[victimSide].isDead) {
                    victim =
                        battle[victimSide].realName || battle[victimSide].name;

                    let deathJson = battle[victimSide].died(
                        prevMove,
                        killer,
                        rules.suicide === "P"
                    );
                    if (killer && killer !== victim) {
                        battle[`${oppositePlayerSide}Pokemon` as const][
                            killer
                        ].killed(deathJson);
                    }

                    console.log(
                        `${battle.battlelink}: ${victim} was killed by ${
                            killer || "suicide"
                        } due to ${prevMove} (${
                            rules.suicide === "P" ? "passive" : "direct"
                        }) (Turn ${battle.turns}).`
                    );
                    battle.history.push(
                        `${victim} was killed by ${
                            killer || "suicide"
                        } due to ${prevMove} (${
                            rules.suicide === "P" ? "passive" : "direct"
                        }) (Turn ${battle.turns}).`
                    );
                }
            } else {
                //Regular kill if it wasn't picked up by the |-damage| statement
                let killer = "";
                let victim = "";
                if (!battle[victimSide].isDead) {
                    let killerSide = prevParts[1].split(": ")[0] as
                        | "p1a"
                        | "p1b"
                        | "p2a"
                        | "p2b";
                    killer =
                        battle[killerSide].realName || battle[killerSide].name;
                    victim =
                        battle[victimSide].realName || battle[victimSide].name;

                    let deathJson = battle[victimSide].died(
                        "faint",
                        killer,
                        false
                    );
                    battle[`${oppositePlayerSide}Pokemon` as const][
                        killer
                    ].killed(deathJson);
                }

                if (killer && victim) {
                    console.log(
                        `${battle.battlelink}: ${victim} was killed by ${killer} (Turn ${battle.turns}).`
                    );
                    battle.history.push(
                        `${victim} was killed by ${killer} (Turn ${battle.turns}).`
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
            let forfeiterSide = (forfeiter === battle.p1 ? "p1" : "p2") as
                | "p1"
                | "p2";
            if (rules.forfeit !== "N") {
                let numDead = 0;

                for (let pokemon of Object.values(
                    battle[`${forfeiterSide}Pokemon` as const]
                )) {
                    if (!pokemon.isDead) numDead++;
                }
                battle[`${forfeiterSide}a` as const][
                    `current${rules.forfeit as "D" | "P"}Kills` as const
                ] += numDead;
            }
            battle.forfeiter = forfeiter;
        }

        dataArr.splice(dataArr.length - 1, 1);
    }

    return [battle, dataArr];
}

export default track;
