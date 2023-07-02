import fs from "fs/promises"
import EventListener from "../EventListener";
import { RCONBot } from "../../Bot";
import { ChatInputCommandInteraction } from "discord.js";

export default class InteractionCreateListener extends EventListener
{

    startListener(bot: RCONBot): void 
    {
        bot.client.on("interactionCreate", async (i) => 
        {
            if(i.isChatInputCommand())
            {
                if(!await this.isWhitelisted(i) && !RCONBot.isAdmin(i.user.id)) { //check if user has perms to rn this command
                    i.reply("You cannot use this")
                    return;
                } 
                bot.commands.get(i.commandName!)?.executeCommand(i, bot)
            }
        })
    }

    private async isWhitelisted(i: ChatInputCommandInteraction): Promise<boolean>
    {
        const whitelist = JSON.parse(await fs.readFile("./db/whitelist.json", "utf-8"))[i.commandName!] as {"users": string[], "roles": string[]}
        //return true if whitelist does not exist
        if(!whitelist) return true;
        if(whitelist.users.length == 0 && whitelist.roles.length == 0) return true;

        //check user whitelist
        if(whitelist.users.includes(i.user.id)) return true;

        const member = await i.guild?.members.fetch(i.user.id)
        if(!member) return false
        for(const id of whitelist.roles)
        {
            if(member?.roles.resolveId(id))
            {
                return true;
            }
        }
        return false;
    }
}