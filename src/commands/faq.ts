import { Message, Client, EmbedBuilder } from "discord.js";
import { Command } from "../types";

export default {
    name: "faq",
    description:
        "An FAQ regarding setup of the bot and about the bot in general.",
    execute(message: Message, args: string[], client: Client) {
        const faqEmbed = new EmbedBuilder()
            .setColor("#fc03d7")
            .setTitle("Porygon FAQ")
            .setURL("https://bit.ly/porygon")
            .setDescription(
                'Porygon is a bot that automatically joins and tracks the stats of a Pokemon Showdown battle. Click on "Porygon FAQ" in this message for a tutorial.'
            )
            .setThumbnail(
                "https://images.discordapp.net/avatars/692091256477581423/634148e2b64c4cd5e555d9677188e1e2.png"
            )
            .addFields([
                {
                    name: "What if I have more than 1 league or subdivision in my server and I want to use the bot for all of them?",
                    value: "Just run the `mode` command in different channels! The bot treats each channel separately, so just make sure you're naming the leagues different things!",
                },
                {
                    name: "What Showdown servers does this bot support?",
                    value: "This is the list so far, but it can very easily be expanded at anyone's request!\n- play.pokemonshowdown.com\n- sports.psim.us\n - automatthic.psim.us\n - dawn.psim.us",
                },
                {
                    name: "The bot left in the middle of the match! Is something wrong?",
                    value: "That just means that I just pushed an update. Resend the link and you'll be good to go!",
                },
                {
                    name: "Surely there are some caveats that there are to using the bot?",
                    value: "Yes! You need to keep your battles spectator-open, they cannot be randoms matches, and they have to have Dupe Clause active.",
                },
                {
                    name: "I want to support this bot!",
                    value: "Awesome! You can support it here, monetarily or otherwise:\nhttps://patreon.com/harbar20 \nhttps://paypal.me/harbar20 \nCashapp: $harbar20 \nhttps://top.gg/bot/692091256477581423 \nhttps://discord.bots.gg/bots/692091256477581423",
                },
                {
                    name: "My question isn't on this list! or I have another issue!",
                    value: "Join the porygon server (https://discord.gg/ZPTMZ8f) and report your issue!",
                },
            ]);

        return message.channel.send({ embeds: [faqEmbed] }).catch((e) => {
            message.channel.send(
                ":x: You need to enable embeds in this channel to use this command."
            );
        });
    },
} as Command;
