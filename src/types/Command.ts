import { Message } from "discord.js";

interface Command {
    name: string;
    aliases?: string[];
    description: string;
    usage?: string;
    execute: Function;
}

export default Command;