import { Collection } from "discord.js";
import { Command } from "../types/index.js";
import analyzeCommand from "./analyze.js";
import deleteCommand from "./delete.js";
// import endTrackCommand from "./end-track.js";
import faqCommand from "./faq.js";
import helpCommand from "./help.js";
import modeCommand from "./mode.js";
import renameCommand from "./rename.js";
import ruleCommand from "./rule.js";
import rulesCommand from "./rules.js";
// import startTrackCommand from "./start-track.js";

//Aggregating all the commands
const commandsArr: Command[] = [
    analyzeCommand,
    deleteCommand,
    // endTrackCommand,
    faqCommand,
    helpCommand,
    modeCommand,
    renameCommand,
    ruleCommand,
    rulesCommand,
    // startTrackCommand,
];

//Creating the Collection
let commands: Collection<string, Command> = new Collection();
for (let command of commandsArr) {
    commands.set(command.name, command);
}

export { commands, commandsArr };
