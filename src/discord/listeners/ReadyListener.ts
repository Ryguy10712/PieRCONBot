import { Client } from "discord.js";
import EventListener from "../EventListener";
import { RCONBot } from "../../Bot";

export default class ReadyListener extends EventListener
{
    startListener(bot: RCONBot) {
        bot.client.on("ready", () =>
        {
            console.log(`${bot.client.user?.username} is online`)
        })
    }
}