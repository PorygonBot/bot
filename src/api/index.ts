/**
 * Credit: Ian Mitchell (@IanMitchell)
 * https://ianmitchell.dev/blog/deploying-a-discord-bot-as-a-vercel-serverless-function
 */

import {
    InteractionResponseType,
    InteractionType,
    verifyKey,
} from "discord-interactions";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import getRawBody from "raw-body";
import { commands } from "../utils"

export default async function (
    request: VercelRequest,
    response: VercelResponse
) {
    // Only respond to POST requests
    if (request.method === "POST") {
        // Verify the request
        const signature = request.headers["x-signature-ed25519"] as string;
        const timestamp = request.headers["x-signature-timestamp"] as string;
        const rawBody = await getRawBody(request);

        const isValidRequest = verifyKey(
            rawBody,
            signature,
            timestamp,
            process.env.PUBLIC_KEY ?? ""
        );

        if (!isValidRequest) {
            console.error("Invalid Request");
            return response
                .status(401)
                .send({ error: "Bad request signature " });
        }

        // Handle the request
        const message = request.body;

        // Handle PINGs from Discord
        if (message.type === InteractionType.PING) {
            console.log("Handling Ping request");
            response.send({
                type: InteractionResponseType.PONG,
            });
        } else if (message.type === InteractionType.APPLICATION_COMMAND) {
            // Handle our Slash Commands
			if (message.isCommand()) {
				//Getting info from the message if it's not a live link
				const commandName = message.commandName;
				const options = message.options;
		
				//Getting the actual command
				const command = commands.get(commandName);
				if (!command) return;
		
				//Running the command
				await command.execute(message, options);
			} else if (
				(message.isButton() || message.isSelectMenu()) &&
				message.message.interaction
			) {
				const commandName = message.message.interaction.commandName;
		
				const command = commands.get(commandName);
				if (!(command && command.buttonResponse)) return;
		
				await command.buttonResponse(message);
			}
        } else {
            console.error("Unknown Type");
            response.status(400).send({ error: "Unknown Type" });
        }
    }
}
