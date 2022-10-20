import { Message } from "discord.js";

interface Command {
    name: string;
    aliases?: string[];
    description: string;
    usage?: string;
    execute: Function;
    buttonResponse?: Function;
}

export default Command;