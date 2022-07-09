// Importing required modules
import * as dotenv from "dotenv";
import axios from "axios";
import { Message, GuildMember } from "discord.js";
import {
    client,
    Prisma,
    ReplayTracker,
    LiveTracker,
    sockets,
    commands,
    slashAnalyzeUpdate,
} from "./utils";
import { Battle, Command } from "./types";
// Setting things up
dotenv.config();

// When the client boots up
client.on("ready", () => {
    console.log(`${client.user!.username} is online!`);
    client.user!.setActivity(
        `${Battle.numBattles} PS Battles in ${client.guilds.cache.size} servers.`,
        {
            type: "WATCHING",
        }
    );
});

client.on("guildCreate", () => {
    client.user!.setActivity(
        `${Battle.numBattles} PS Battles in ${client.guilds.cache.size} servers.`,
        {
            type: "WATCHING",
        }
    );
});

client.on("guildDelete", () => {
    client.user!.setActivity(
        `${Battle.numBattles} PS Battles in ${client.guilds.cache.size} servers.`,
        {
            type: "WATCHING",
        }
    );
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    let valueLink = interaction.options.data[0].value as string;
    let link = valueLink + ".log";
    let response = await axios
        .get(link, {
            headers: { "User-Agent": "PorygonTheBot" },
        })
        .catch((e) => console.error(e));
    let data = response?.data;

    //Getting the rules
    let rules = await Prisma.getRules(interaction.channelId);
    rules.isSlash = true;

    await interaction.deferReply();
    let replayer = new ReplayTracker(valueLink, rules);
    const matchJson = await replayer.track(data);

    await slashAnalyzeUpdate(matchJson, interaction);
    // await message.channel.send(
    //     `Battle between \`${matchJson.playerNames[0]}\` and \`${matchJson.playerNames[1]}\` is complete and info has been updated!`
    // );
    console.log(`${link} has been analyzed!`);
});

//When a message is sent at any time
const messageFunction = async (message: Message) => {
    const channel = message.channel;
    const msgStr = message.content;
    const prefix = "porygon, use ";

    //If it's a DM, analyze the replay
    if (channel.type === "DM") {
        if (
            msgStr.includes("replay.pokemonshowdown.com") &&
            message.author.id !== client.user!.id
        ) {
            //Extracting URL
            const urlRegex = /(https?:\/\/[^ ]*)/;
            const links = msgStr.match(urlRegex);
            let link = "";
            if (links) link = links[0];

            let response = await axios
                .get(link + ".log", {
                    headers: { "User-Agent": "PorygonTheBot" },
                })
                .catch((e) => console.error(e));
            let data = response?.data;

            //Getting the rules
            let rules = await Prisma.getRules(channel.id);

            //Analyzing the replay
            let replayer = new ReplayTracker(link, rules);
            const matchJson = await replayer.track(data);

            await channel.send(JSON.stringify(matchJson));
            console.log(`${link} has been analyzed!`);
        }
    }
    //If it's sent in a validly-named live links channel, join the battle
    else if (
        channel.name.includes("live-links") ||
        channel.name.includes("live-battles")
    ) {
        try {
            //Extracting battlelink from the message
            const urlRegex = /(https?:\/\/[^ ]*)/;
            const links = msgStr.match(urlRegex);
            let battlelink = "";
            if (links) battlelink = links[0];
            let battleId = battlelink && battlelink.split("/")[3];

            if (Battle.battles.includes(battleId) && battleId !== "") {
                await channel.send(
                    `:x: I'm already tracking battle \`${battleId}\`. If you think this is incorrect, send a replay of this match in the #bugs-and-help channel in the Porygon server.`
                );

                return;
            }

            if (
                battlelink &&
                !(
                    battlelink.includes("google") ||
                    battlelink.includes("replay") ||
                    battlelink.includes("draft-league.nl") ||
                    battlelink.includes("porygonbot.xyz")
                )
            ) {
                let server = Object.values(sockets).filter((socket) =>
                    battlelink.includes(socket.link)
                )[0];
                if (!server) {
                    await channel.send(
                        "This link is not a valid Pokemon Showdown battle url."
                    );

                    return;
                }

                //Getting the rules
                let rules = await Prisma.getRules(channel.id);

                //Check if bot has SEND_MESSAGES perms in the channel
                if (
                    message.channel.type == "GUILD_TEXT" &&
                    !message.channel
                        ?.permissionsFor(message.guild?.me as GuildMember)
                        .has("SEND_MESSAGES")
                ) {
                    rules.notalk = true;
                }

                if (!rules.notalk)
                    await channel
                        .send("Joining the battle...")
                        .catch((e: Error) => console.error(e));

                Battle.incrementBattles(battleId);
                console.log(Battle.battles);
                client.user!.setActivity(
                    `${Battle.numBattles} PS Battles in ${client.guilds.cache.size} servers.`,
                    {
                        type: "WATCHING",
                    }
                );
                let tracker = new LiveTracker(
                    battleId,
                    server.name,
                    rules,
                    message
                );
                await tracker.track();
            }
        } catch (e) {
            console.error(e);
        }
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);

    // Checks if the Message contains the Prefix at the start.
    if (message.content.toLowerCase().startsWith(prefix)) {
        //Getting info from the message if it's not a live link
        const commandName: string = args.shift()?.toLowerCase() || "";
        if (!commandName) return;

        //Check if bot has SEND_MESSAGES perms in the channel
        if (
            message.channel.type == "GUILD_TEXT" &&
            !message.channel
                ?.permissionsFor(message.guild?.me as GuildMember)
                .has("SEND_MESSAGES")
        ) {
            await message.author.send(
                `:x: The command that you tried to run in \`${message.guild?.name}\` did not work because Chatot does not have \`Send Messages\` permissions in the channel.`
            );
            return;
        }

        //Getting the actual command
        const command =
            commands.get(commandName) ||
            commands.find(
                (cmd: Command) =>
                    (cmd.aliases &&
                        cmd.aliases.includes(commandName)) as boolean
            );
        if (!command) return;

        //Running the command
        try {
            await command.execute(message, args, client);
        } catch (error: any) {
            console.error(error);
            message.reply(
                `There was an error trying to execute that command!\n\n\`\`\`${error.stack}\`\`\``
            );
        }
    }
};
client.on("messageCreate", messageFunction);

// Log the client in.
client.login(process.env.TOKEN);
