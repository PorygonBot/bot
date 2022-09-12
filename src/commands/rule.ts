import { Message, EmbedBuilder, Client } from "discord.js";
import { Prisma } from "../utils";
import { Rules } from "../types";

export default {
    name: "rule",
    description:
        "Creates a custom kill rule depending on the parameters. Run command without parameters for more info.",
    usage: "[rule name with hyphen] [parameter]",
    async execute(message: Message, args: string[], client: Client) {
        const channel = message.channel;

        //Checking if user is able to change rules
        if (message.member && !message.member.permissions.has("ManageRoles")) {
            return channel.send(
                ":x: You're not a moderator. Ask a moderator to add this person for you."
            );
        }

        //Getting rules
        let rules: Rules = await Prisma.getRules(channel.id);

        //Help embed
        const ruleEmbed = new EmbedBuilder()
            .setTitle("Rule Command Help")
            .setDescription(
                "This command is used to set custom kill rules for how each kill is attributed. You can add multiple rules in the same message. The command is as follows:\nporygon, use rule [rule extension] [option]\n\nThese are the rule extensions: "
            )
            .setColor(0xffc0cb)
            .addFields([
                {
                    name: "-recoil",
                    value: "sets the kill rule of a recoil death.\nOptions: none (no kill), passive (passive kill), direct (direct kill).",
                },
                {
                    name: "-suicide",
                    value: "sets the kill rule of a suicide death.\nOptions: none, passive, direct.",
                },
                {
                    name: "-ability or -item",
                    value: "sets the kill rule of a kill caused by an ability or item.\nOptions: none, passive, direct.",
                },
                {
                    name: "-self or -team",
                    value: "sets the kill rule of a kill caused by itself or a teammate.\nOptions: none, passive, direct.",
                },
                {
                    name: "-db",
                    value: "sets the kill rule of a Destiny Bond death.\nOptions: none, passive, direct.",
                },
                {
                    name: "-spoiler",
                    value: "changes if stats are spoiler tagged.\nOptions: true, false.",
                },
                {
                    name: "-forfeit",
                    value: "sets the type of kills attributed after a forfeit.\nOptions: none, passive, direct.",
                },
                {
                    name: "-ping",
                    value: "sets a rule so that the client @'s this ping when it starts tracking a match.\nOptions: none, @ping.",
                },
                {
                    name: "-format",
                    value: "changes the way stats are formatted when outputted.\nOptions: csv (comma-separated), sheets (space-separated), tour, default.",
                },
                {
                    name: "-quirks",
                    value: "sets whether you want quirky messages sent by the bot or not.\nOptions: true, false.",
                },
                {
                    name: "-pingtime",
                    value: "sets when you want the bot to ping, if at all.\nOptions: sent (immediately after the link is sent), first (immediately as the first turn starts).",
                },
                {
                    name: "-notalk",
                    value: "sets whether you want the bot to not talk while analyzing a live battle.\nOptions: true, false.",
                },
                {
                    name: "-tb",
                    value: "sets whether you want extra tidbits in the stats message (replay, history link, etc.).\nOptions: true, false.",
                },
                {
                    name: "-combine",
                    value: "sets whether you want passive and direct kills combined or separated.\nOptions: true, false",
                },
                {
                    name: "-redirect",
                    value: "sets the redirect channel if you use a non-Discord updating mode.",
                },
            ]);

        //Getting an array of only the keys of the rules
        let ruleKeyArgs = args
            .filter((arg) => arg.includes("-"))
            .map((arg) => arg.substring(1, arg.length));
        if (!ruleKeyArgs.length) {
            return channel.send({ embeds: [ruleEmbed] });
        }

        //Setting the new rules
        for (let ruleKey of ruleKeyArgs) {
            let ruleValue: string =
                args[args.indexOf(`-${ruleKey}`) + 1].toLowerCase();
            let boolRuleValue = false;

            //Enforcing ruleValue
            if (ruleValue === "true") boolRuleValue = true;
            else if (
                ruleValue === "direct" ||
                ruleValue === "default" ||
                ruleValue === "d"
            )
                ruleValue = "D";
            else if (ruleValue === "passive" || ruleValue === "p")
                ruleValue = "P";
            else if (ruleValue === "none" || ruleValue === "n") ruleValue = "N";
            else if (ruleValue === "csv") ruleValue = "CSV";
            else if (ruleValue === "sheets" || ruleValue === "space")
                ruleValue = "SPACE";
            //Setting the rules
            switch (ruleKey) {
                case "recoil":
                    rules.recoil = ruleValue;
                    break;
                case "suicide":
                    rules.suicide = ruleValue;
                    break;
                case "self":
                case "team":
                    rules.selfteam = ruleValue;
                    break;
                case "ability":
                case "item":
                    rules.abilityitem = ruleValue;
                    break;
                case "db":
                    rules.db = ruleValue;
                    break;
                case "spoiler":
                    rules.spoiler = boolRuleValue;
                    break;
                case "ping":
                    rules.ping = ruleValue;
                    break;
                case "forfeit":
                    rules.forfeit = ruleValue;
                    break;
                case "format":
                    rules.format = ruleValue;
                    break;
                case "quirks":
                    rules.quirks = boolRuleValue;
                    break;
                case "notalk":
                    rules.notalk = boolRuleValue;
                    break;
                case "tb":
                    rules.tb = boolRuleValue;
                    break;
                case "combine":
                    rules.combine = boolRuleValue;
                    break;
                case "redirect":
                    rules.redirect = ruleValue;
                    break;
            }
        }

        //Updating the rules
        await Prisma.upsertRules(
            channel.id,
            rules.leagueName,
            rules as unknown as { [key: string]: string | boolean }
        );

        return await channel.send("Your rules have been set!");
    },
};
