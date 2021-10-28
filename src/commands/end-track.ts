import { channel } from "diagnostic_channel";
import { Message, Client, Collection } from "discord.js";
import { Command } from "../types";

export default {
    name: "end-track",
    description:
        "Set the bot up to end tracking the users that reacted to messages sent between the calling of start-track and end-track.",
    async execute(message: Message, args: string[], client: Client) {
        const author = message.author;

        let messagesList = (await message.channel.messages
            .fetch()
            .catch((e: Error) => {
                message.channel.send(
                    ":x: Error! I don't have `Read Message History` permissions."
                );
                console.error(e);
            })) as Collection<string, Message>;

        //Creating the array of messages between the start and end of tracking
        let messages = messagesList.map((collection) => collection);
        let msgs = [];
        for (const msg of messages) {
            if (msg.content === "Tracking now!") break;
            else msgs.push(msg);
        }
        msgs.splice(0, 1);

        //Collecting the reactions and stuff
        msgs = msgs.reverse();
        let allMessages = [];
        for (const msg of msgs) {
            const reactions = msg.reactions.cache.map(
                (collection) => collection
            );

            let reactorsArr;
            let allReactions = [];
            for (const reaction of reactions) {
                const emoji = reaction.emoji.toString();

                let reactorsCollection = await reaction.users.fetch();
                reactorsArr = reactorsCollection.map(
                    (reactor) =>
                        reactor.username + "#" + reactor.discriminator
                );
                allReactions.push([emoji, ...reactorsArr]);
            }
            //Sending the reactions for each message one by one
            allMessages.push(
                `> ${msg.content}\n${allReactions
                    .map((reactionsList) => reactionsList.join(","))
                    .join("\n")}`
            );
        }

        await author.send(allMessages.join("\n\n"));
        await message.channel.send("Reactions tracked and updated!");
    },
} as Command;
