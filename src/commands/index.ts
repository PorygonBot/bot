import { Collection } from "discord.js";
import { Command } from "../types";
import analyzeCommand from "./analyze";
import conversionCommand from "./conversion";
import deleteCommand from "./delete";
import endTrackCommand from "./end-track";
import faqCommand from "./faq";
import helpCommand from "./help";
import modeCommand from "./mode";
import pingCommand from "./ping";
import renameCommand from "./rename";
import ruleCommand from "./rule";
import rulesCommand from "./rules";
import startTrackCommand from "./start-track";
import triAttackCommand from "./tri-attack";

//Aggregating all the commands
const commandsArr: Command[] = [
    analyzeCommand,
    conversionCommand,
    deleteCommand,
    endTrackCommand,
    faqCommand,
    helpCommand,
    modeCommand,
    pingCommand,
    renameCommand,
    ruleCommand,
    rulesCommand,
    startTrackCommand,
    triAttackCommand
];

//Creating the Collection
let commands: Collection<string, Command> = new Collection();
for (let command of commandsArr) {
    commands.set(command.name, command);
}

export { commands, commandsArr };
