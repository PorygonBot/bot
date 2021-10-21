import { Message, Client } from "discord.js";
import { Command } from "../../types";

export default {
    name: "conversion",
    description:
        "Causes Porygon to use the Conversion move, with Porygon changing to a random Pokemon type.",
    async execute(message: Message, args: string[], client: Client) {
        const channel = message.channel;
        const types = [
            "Bug",
            "Dark",
            "Dragon",
            "Electric",
            "Fairy",
            "Fighting",
            "Fire",
            "Flying",
            "Ghost",
            "Grass",
            "Ground",
            "Ice",
            "Normal",
            "Poison",
            "Psychic",
            "Rock",
            "Steel",
            "Water",
        ];

        let rand = Math.round(Math.random() * (17 - 0 + 1) + 0);
        let type = types[rand];

        return channel.send(
            `Porygon used Conversion! Porygon's type changed to ${type}!`
        );
    },
} as Command;
