import { Message, Client } from "discord.js";

export default {
    name: "start-track",
    description:
        "Sets the bot up to start tracking the users that reacted to messages sent between the calling of start-track and end-track.",
    execute(message: Message, args: string[], client: Client) {
        return message.channel.send("Tracking now!");
    },
};
